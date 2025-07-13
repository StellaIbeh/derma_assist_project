import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Switch, Alert, Modal, TextInput, Animated, ActivityIndicator } from 'react-native';
import { User, Bell, Shield, CircleHelp as HelpCircle, FileText, Star, LogOut, ChevronRight, Moon, Globe, Download, Camera, Palette, Volume2, Smartphone, Database, Eye, Lock, Mail, Phone, Calendar, MapPin, CreditCard as Edit3, Check, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const { settings, updateSetting, loading: settingsLoading } = useSettings();
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    location: profile?.location || '',
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // If profile is missing but user exists, show a fallback
  const displayProfile = profile || {
    id: 'temp',
    user_id: user?.id || '',
    role: 'patient' as const,
    full_name: user?.user_metadata?.full_name || 'User',
    membership_type: 'Free' as const,
    created_at: new Date().toISOString(),
    email: user?.email || '',
    phone: null,
    date_of_birth: null,
    location: null,
  };

  const languages = [
    'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 
    'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'
  ];

  const themes = [
    { key: 'system', label: 'System Default', description: 'Follow device settings' },
    { key: 'light', label: 'Light Mode', description: 'Always use light theme' },
    { key: 'dark', label: 'Dark Mode', description: 'Always use dark theme' },
    { key: 'auto', label: 'Auto Switch', description: 'Switch based on time of day' }
  ];

  useEffect(() => {
    // Simulate storage calculation
    const timer = setTimeout(() => {
      setStorageUsed(Math.floor(Math.random() * 80) + 10);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (displayProfile) {
      setEditingProfile({
        name: displayProfile.full_name || '',
        email: displayProfile.email || '',
        phone: displayProfile.phone || '',
        date_of_birth: displayProfile.date_of_birth || '',
        location: displayProfile.location || '',
      });
    }
  }, [displayProfile]);

  // If settings are null but profile exists, show default settings
  const displaySettings = settings || {
    notifications: true,
    dark_mode: false,
    analytics_enabled: true,
    sound_enabled: true,
    haptics_enabled: true,
    auto_save: true,
    high_quality_images: true,
    language: 'English (US)',
    theme: 'system' as const,
  };

  const handleUpdateSetting = async (key: any, value: any) => {
    try {
      await updateSetting(key, value);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(fadeAnim, { duration: 100, toValue: 0.7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { duration: 100, toValue: 1, useNativeDriver: true })
    ]).start();
  };

  const saveProfile = async () => {
    try {
      const { error } = await updateProfile({
        full_name: editingProfile.name,
        phone: editingProfile.phone,
        date_of_birth: editingProfile.date_of_birth,
        location: editingProfile.location,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
      } else {
        setShowProfileModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Pro': return '#8B5CF6';
      case 'Premium': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'Pro': return '💎';
      case 'Premium': return '⭐';
      default: return '👤';
    }
  };

  const getStorageColor = (percentage: number) => {
    if (percentage > 80) return '#EF4444';
    if (percentage > 60) return '#F59E0B';
    return '#10B981';
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          action: () => setShowProfileModal(true),
          showChevron: true,
        },
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: displaySettings?.notifications ? 'Enabled' : 'Disabled',
          rightComponent: (
            <Switch
              value={displaySettings?.notifications || false}
              onValueChange={(value) => handleUpdateSetting('notifications', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your data and privacy',
          action: () => Alert.alert('Privacy Settings', 'Advanced privacy controls coming soon!'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: Palette,
          title: 'Theme',
          subtitle: themes.find(t => t.key === displaySettings?.theme)?.label || 'System Default',
          action: () => setShowThemeModal(true),
          showChevron: true,
        },
        {
          icon: Globe,
          title: 'Language',
          subtitle: displaySettings?.language || 'English (US)',
          action: () => setShowLanguageModal(true),
          showChevron: true,
        },
        {
          icon: Volume2,
          title: 'Sound Effects',
          subtitle: displaySettings?.sound_enabled ? 'Enabled' : 'Disabled',
          rightComponent: (
            <Switch
              value={displaySettings?.sound_enabled || false}
              onValueChange={(value) => handleUpdateSetting('sound_enabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Smartphone,
          title: 'Haptic Feedback',
          subtitle: displaySettings?.haptics_enabled ? 'Enabled' : 'Disabled',
          rightComponent: (
            <Switch
              value={displaySettings?.haptics_enabled || false}
              onValueChange={(value) => handleUpdateSetting('haptics_enabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: Database,
          title: 'Auto-Save Scans',
          subtitle: displaySettings?.auto_save ? 'Automatically save all scans' : 'Manual save only',
          rightComponent: (
            <Switch
              value={displaySettings?.auto_save || false}
              onValueChange={(value) => handleUpdateSetting('auto_save', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Camera,
          title: 'High Quality Images',
          subtitle: displaySettings?.high_quality_images ? 'Better quality, more storage' : 'Compressed images',
          rightComponent: (
            <Switch
              value={displaySettings?.high_quality_images || false}
              onValueChange={(value) => handleUpdateSetting('high_quality_images', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Download,
          title: 'Export Data',
          subtitle: 'Download your scan history',
          action: () => Alert.alert('Export Data', 'Your data export will be ready shortly!'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Privacy & Analytics',
      items: [
        {
          icon: Eye,
          title: 'Usage Analytics',
          subtitle: displaySettings?.analytics_enabled ? 'Help improve our AI models' : 'Analytics disabled',
          rightComponent: (
            <Switch
              value={displaySettings?.analytics_enabled || false}
              onValueChange={(value) => handleUpdateSetting('analytics_enabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: Lock,
          title: 'Data Encryption',
          subtitle: 'End-to-end encryption enabled',
          rightComponent: (
            <View style={styles.encryptionBadge}>
              <Text style={styles.encryptionText}>✓ Secured</Text>
            </View>
          ),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help Center',
          subtitle: 'FAQs and troubleshooting',
          action: () => Alert.alert('Help Center', 'Help center coming soon!'),
          showChevron: true,
        },
        {
          icon: Star,
          title: 'Rate App',
          subtitle: 'Share your feedback',
          action: () => Alert.alert('Rate App', 'Thank you for your feedback!'),
          showChevron: true,
        },
        {
          icon: FileText,
          title: 'Send Feedback',
          subtitle: 'Report bugs or suggest features',
          action: () => Alert.alert('Feedback', 'Feedback form coming soon!'),
          showChevron: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.action}
      disabled={!item.action}
      activeOpacity={item.action ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <item.icon size={20} color="#6B7280" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.rightComponent || (item.showChevron && <ChevronRight size={20} color="#D1D5DB" />)}
      </View>
    </TouchableOpacity>
  );

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await signOut();
          router.replace('/auth');
        }},
      ]
    );
  };

  // Show loading state if auth or settings are still loading
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if user or profile is missing
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please sign in to access settings.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace('/auth')}
          >
            <Text style={styles.retryButtonText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show minimal loading only for settings if they're still loading
  if (settingsLoading && !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Edit3 size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Card - Show even while settings load */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <User size={32} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayProfile.full_name}</Text>
                <Text style={styles.profileEmail}>{displayProfile.email}</Text>
                <View style={styles.profileMeta}>
                  <View style={[styles.membershipBadge, { backgroundColor: getMembershipColor(displayProfile.membership_type) }]}>
                    <Text style={styles.membershipIcon}>{getMembershipIcon(displayProfile.membership_type)}</Text>
                    <Text style={styles.membershipText}>{displayProfile.membership_type}</Text>
                  </View>
                  <Text style={styles.joinDate}>
                    Member since {new Date(displayProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#D1D5DB" />
            </View>
          </TouchableOpacity>

          {/* Loading indicator for settings */}
          <View style={styles.settingsLoadingContainer}>
            <ActivityIndicator size="small" color="#14B8A6" />
            <Text style={styles.settingsLoadingText}>Loading settings...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Edit3 size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Profile Card */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => setShowProfileModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <View style={styles.profileMeta}>
                <View style={[styles.membershipBadge, { backgroundColor: getMembershipColor(profile.membership_type) }]}>
                  <Text style={styles.membershipIcon}>{getMembershipIcon(profile.membership_type)}</Text>
                  <Text style={styles.membershipText}>{profile.membership_type}</Text>
                </View>
                <Text style={styles.joinDate}>
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#D1D5DB" />
          </View>
        </TouchableOpacity>

        {/* Storage Usage Card */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Database size={20} color="#6B7280" />
            <Text style={styles.storageTitle}>Storage Usage</Text>
          </View>
          <View style={styles.storageBar}>
            <View 
              style={[
                styles.storageProgress, 
                { 
                  width: `${storageUsed}%`,
                  backgroundColor: getStorageColor(storageUsed)
                }
              ]} 
            />
          </View>
          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>{storageUsed}% used</Text>
            <Text style={styles.storageSubtext}>2.4 GB of 5 GB</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderSettingItem({
                    ...item,
                    // Update settings references to use displaySettings
                    rightComponent: item.rightComponent || (item.showChevron && <ChevronRight size={20} color="#D1D5DB" />)
                  }, itemIndex)}
                  {itemIndex < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* AI Ethics Notice */}
        <View style={styles.ethicsCard}>
          <Text style={styles.ethicsTitle}>AI Ethics & Bias</Text>
          <Text style={styles.ethicsText}>
            Our AI models are continuously improving. We're committed to reducing bias and improving accuracy across all skin types and demographics. Your feedback helps us build better, more inclusive technology.
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>DermAssist AI v1.0.0</Text>
          <Text style={styles.appBuild}>Build 2024.01.15</Text>
        </View>

        {/* Sign Out Button */}
        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon!')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon!')}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Check size={24} color="#14B8A6" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.name}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your full name"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  editable={false}
                />
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.phone}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date of Birth</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.date_of_birth}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, date_of_birth: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.location}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, location: text }))}
                  placeholder="Enter your location"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  displaySettings.language === language && styles.optionItemSelected
                ]}
                onPress={() => {
                  handleUpdateSetting('language', language);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  displaySettings.language === language && styles.optionTextSelected
                ]}>
                  {language}
                </Text>
                {displaySettings.language === language && (
                  <Check size={20} color="#14B8A6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Theme</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {themes.map((theme, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.themeItem,
                  displaySettings.theme === theme.key && styles.themeItemSelected
                ]}
                onPress={() => {
                  handleUpdateSetting('theme', theme.key);
                  setShowThemeModal(false);
                }}
              >
                <View style={styles.themeContent}>
                  <Text style={[
                    styles.themeTitle,
                    displaySettings.theme === theme.key && styles.themeTextSelected
                  ]}>
                    {theme.label}
                  </Text>
                  <Text style={[
                    styles.themeDescription,
                    displaySettings.theme === theme.key && styles.themeDescriptionSelected
                  ]}>
                    {theme.description}
                  </Text>
                </View>
                {displaySettings.theme === theme.key && (
                  <Check size={20} color="#14B8A6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  settingsLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileMeta: {
    gap: 6,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  membershipIcon: {
    fontSize: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  storageCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  storageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  storageSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptionBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  encryptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  ethicsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  ethicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 8,
  },
  ethicsText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  appBuild: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingLeft: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionItemSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  themeItemSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
  },
  themeContent: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  themeTextSelected: {
    color: '#14B8A6',
  },
  themeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  themeDescriptionSelected: {
    color: '#047857',
  },
});