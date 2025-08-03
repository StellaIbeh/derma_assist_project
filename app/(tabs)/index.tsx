import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, MessageCircle, History, TrendingUp, Heart, Shield, Brain, Users, Award, ChevronRight, Info, TriangleAlert as AlertTriangle, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useScanContext } from '@/contexts/ScanContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { scans } = useScanContext();
  const [currentTip, setCurrentTip] = useState(0);

  const skinCareTips = [
    {
      title: "Daily Sun Protection",
      description: "Apply broad-spectrum SPF 30+ sunscreen daily, even on cloudy days.",
      icon: Shield,
      color: '#F59E0B'
    },
    {
      title: "Gentle Cleansing",
      description: "Use a mild, fragrance-free cleanser twice daily to maintain skin barrier.",
      icon: Heart,
      color: '#14B8A6'
    },
    {
      title: "Stay Hydrated",
      description: "Drink plenty of water and use a moisturizer suitable for your skin type.",
      icon: TrendingUp,
      color: '#3B82F6'
    }
  ];

  const quickActions = [
    {
      title: 'Take Skin Scan',
      subtitle: 'AI-powered analysis',
      icon: Camera,
      color: '#14B8A6',
      action: () => router.push('/scan')
    },
    {
      title: 'Ask AI Assistant',
      subtitle: 'Get instant answers',
      icon: MessageCircle,
      color: '#8B5CF6',
      action: () => router.push('/chat')
    },
    {
      title: 'Book Consultation',
      subtitle: 'Find dermatologists',
      icon: Calendar,
      color: '#EF4444',
      action: () => router.push('/consultation')
    },
    {
      title: 'View History',
      subtitle: 'Track your progress',
      icon: History,
      color: '#F59E0B',
      action: () => router.push('/history')
    }
  ];

  const educationalContent = [
    {
      id: 'understanding-acne',
      title: "Understanding Acne",
      description: "Learn about causes, types, and effective treatments for acne.",
      image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
      readTime: "5 min read",
      category: "Conditions"
    },
    {
      id: 'skin-cancer-prevention',
      title: "Skin Cancer Prevention",
      description: "Essential tips for protecting your skin from harmful UV rays.",
      image: "https://images.pexels.com/photos/4269921/pexels-photo-4269921.jpeg?auto=compress&cs=tinysrgb&w=400",
      readTime: "7 min read",
      category: "Prevention"
    },
    {
      id: 'eczema-management',
      title: "Eczema Management",
      description: "Comprehensive guide to managing eczema symptoms and triggers.",
      image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
      readTime: "6 min read",
      category: "Treatment"
    }
  ];

  const stats = [
    { label: 'Scans Completed', value: scans.length.toString(), icon: Camera },
    { label: 'Days Active', value: '12', icon: TrendingUp },
    { label: 'Health Score', value: '85%', icon: Award }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentTipData = skinCareTips[currentTip];
  const TipIcon = currentTipData.icon;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{profile?.full_name || user?.user_metadata?.full_name || 'User'}</Text>
            </View>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {(profile?.full_name || user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                  onPress={action.action}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <ActionIcon size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <ChevronRight size={20} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Health Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <StatIcon size={20} color="#14B8A6" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Daily Tip */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Skin Tip</Text>
            <View style={styles.tipIndicators}>
              {skinCareTips.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tipIndicator,
                    { backgroundColor: index === currentTip ? '#14B8A6' : '#E5E7EB' }
                  ]}
                  onPress={() => setCurrentTip(index)}
                />
              ))}
            </View>
          </View>
          <View style={[styles.tipCard, { borderLeftColor: currentTipData.color }]}>
            <View style={[styles.tipIcon, { backgroundColor: currentTipData.color }]}>
              <TipIcon size={24} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{currentTipData.title}</Text>
              <Text style={styles.tipDescription}>{currentTipData.description}</Text>
            </View>
          </View>
        </View>

        {/* Educational Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learn More</Text>
            <TouchableOpacity onPress={() => router.push('/articles')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.educationScroll}>
            {educationalContent.map((content, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.educationCard} 
                activeOpacity={0.8}
                onPress={() => router.push(`/article?id=${content.id}`)}
              >
                <Image source={{ uri: content.image }} style={styles.educationImage} />
                <View style={styles.educationContent}>
                  <View style={styles.educationMeta}>
                    <Text style={styles.educationCategory}>{content.category}</Text>
                    <Text style={styles.educationReadTime}>{content.readTime}</Text>
                  </View>
                  <Text style={styles.educationTitle}>{content.title}</Text>
                  <Text style={styles.educationDescription}>{content.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Ethics Notice */}
        <View style={styles.ethicsCard}>
          <View style={styles.ethicsHeader}>
            <Brain size={20} color="#3B82F6" />
            <Text style={styles.ethicsTitle}>AI-Powered Analysis</Text>
          </View>
          <Text style={styles.ethicsText}>
            Our AI models are continuously improving to provide accurate skin analysis across all skin types and demographics. Your feedback helps us build better, more inclusive technology.
          </Text>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <AlertTriangle size={16} color="#F59E0B" />
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This app is for educational purposes only and should not replace professional medical consultation. Always consult with a qualified dermatologist for proper diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tipIndicators: {
    flexDirection: 'row',
    gap: 6,
  },
  tipIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  educationScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  educationCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  educationImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  educationContent: {
    padding: 16,
  },
  educationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  educationCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#14B8A6',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  educationReadTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  educationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ethicsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  ethicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ethicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  ethicsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  disclaimerCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});