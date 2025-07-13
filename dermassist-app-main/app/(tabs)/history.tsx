import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Image, Modal, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, TrendingUp, Filter, Search, Share, ChevronRight, X, CircleAlert as AlertCircle, Info, Trash2, Users, Award } from 'lucide-react-native';
import { useScanContext, ScanResult } from '@/contexts/ScanContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { scans, deleteScan } = useScanContext();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const filters = ['All', 'This Week', 'This Month', 'Last 3 Months'];

  const filteredScans = scans.filter(scan => {
    if (selectedFilter === 'All') return true;
    
    const now = new Date();
    const scanDate = new Date(scan.date);
    
    switch (selectedFilter) {
      case 'This Week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return scanDate >= weekAgo;
      case 'This Month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return scanDate >= monthAgo;
      case 'Last 3 Months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return scanDate >= threeMonthsAgo;
      default:
        return true;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return '#10B981';
      case 'Moderate': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Acne': return '#EF4444';
      case 'Eczema': return '#8B5CF6';
      case 'Psoriasis': return '#F59E0B';
      case 'Healthy Skin': return '#10B981';
      default: return '#14B8A6';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleDeleteScan = (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteScan(scanId);
            setSelectedScan(null);
          }
        }
      ]
    );
  };

  const renderScanRecord = ({ item }: { item: ScanResult }) => (
    <TouchableOpacity 
      style={styles.recordCard} 
      activeOpacity={0.8}
      onPress={() => setSelectedScan(item)}
    >
      <View style={styles.recordHeader}>
        <Image source={{ uri: item.imageUri }} style={styles.recordImage} />
        <View style={styles.recordInfo}>
          <View style={styles.recordTitleRow}>
            <Text style={styles.recordCondition}>{item.condition}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
              <Text style={styles.severityText}>{item.severity}</Text>
            </View>
          </View>
          
          <Text style={styles.recordBodyPart}>{item.bodyPart}</Text>
          
          <View style={styles.recordMeta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <TrendingUp size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.confidence}% confidence</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.recordActions}>
          <TouchableOpacity style={styles.shareButton}>
            <Share size={16} color="#6B7280" />
          </TouchableOpacity>
          <ChevronRight size={20} color="#D1D5DB" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => {
    const totalScans = scans.length;
    const recentScans = scans.filter(scan => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(scan.date) >= weekAgo;
    }).length;

    const conditionCounts = scans.reduce((acc, scan) => {
      acc[scan.condition] = (acc[scan.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0];

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Skin Health Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recentScans}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: getConditionColor(mostCommon?.[0] || '') }]}>
              {mostCommon?.[0] || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Most Common</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item && styles.filterTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.filterIconButton}>
          <Filter size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredScans}
        keyExtractor={(item) => item.id}
        renderItem={renderScanRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderStats}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Clock size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by taking your first skin scan to track your skin health over time.
            </Text>
            <TouchableOpacity 
              style={styles.startScanButton}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.startScanButtonText}>Take First Scan</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Detailed Scan Modal */}
      <Modal
        visible={selectedScan !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedScan && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Details</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteScan(selectedScan.id)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedScan(null)}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Image and Basic Info */}
              <View style={styles.scanImageContainer}>
                <Image source={{ uri: selectedScan.imageUri }} style={styles.scanDetailImage} />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanBasicInfo}>
                    <Text style={styles.scanConditionTitle}>{selectedScan.condition}</Text>
                    <View style={styles.scanMetaRow}>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedScan.severity) }]}>
                        <Text style={styles.severityText}>{selectedScan.severity}</Text>
                      </View>
                      <Text style={styles.scanDate}>{formatDate(selectedScan.date)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Confidence and Body Part */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Confidence</Text>
                    <Text style={[styles.detailValue, { color: getSeverityColor(selectedScan.severity) }]}>
                      {selectedScan.confidence}%
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Body Part</Text>
                    <Text style={styles.detailValue}>{selectedScan.bodyPart}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionContent}>{selectedScan.description}</Text>
              </View>

              {/* Symptoms */}
              {selectedScan.symptoms && selectedScan.symptoms.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Observed Symptoms</Text>
                  {selectedScan.symptoms.map((symptom, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.listBullet, { backgroundColor: getConditionColor(selectedScan.condition) }]} />
                      <Text style={styles.listText}>{symptom}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Care Advice */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Care Recommendations</Text>
                {selectedScan.careAdvice.map((advice, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.listBullet, { backgroundColor: getConditionColor(selectedScan.condition) }]} />
                    <Text style={styles.listText}>{advice}</Text>
                  </View>
                ))}
              </View>

              {/* Treatment Options */}
              {selectedScan.treatmentOptions && selectedScan.treatmentOptions.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Treatment Options</Text>
                  {selectedScan.treatmentOptions.map((treatment, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.listBullet, { backgroundColor: getConditionColor(selectedScan.condition) }]} />
                      <Text style={styles.listText}>{treatment}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Risk Level */}
              <View style={styles.riskContainer}>
                <AlertCircle size={16} color="#F59E0B" />
                <Text style={styles.riskText}>{selectedScan.riskLevel}</Text>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerContainer}>
                <Info size={16} color="#3B82F6" />
                <Text style={styles.disclaimerText}>
                  This analysis is for educational purposes only. Please consult a dermatologist for proper diagnosis and treatment.
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filtersList: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#14B8A6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  listContainer: {
    padding: 20,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  recordImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordCondition: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordBodyPart: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startScanButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startScanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  scanImageContainer: {
    position: 'relative',
    height: 250,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scanDetailImage: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  scanBasicInfo: {
    gap: 8,
  },
  scanConditionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scanMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanDate: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  riskText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});