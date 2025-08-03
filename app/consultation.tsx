import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, Mail, MapPin, Star, Clock, Calendar, Navigation, Share2, Filter, Map } from 'lucide-react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface Dermatologist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  distance: string;
  availability: string;
  languages: string[];
  insurance: string[];
  consultationFee: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hospital: string;
  experience: string;
}

// Realistic dermatologists in Kigali, Rwanda
const dermatologists: Dermatologist[] = [
  {
    id: '1',
    name: 'Dr. Jean Pierre Ndayisaba',
    specialty: 'General Dermatology',
    rating: 4.7,
    reviewCount: 89,
    address: 'KN 4 Ave, Kigali, Rwanda',
    phone: '+250 788 123 456',
    email: 'dr.ndayisaba@kigalihealth.com',
    distance: '0.8 km',
    availability: 'Mon-Fri 8AM-5PM, Sat 9AM-1PM',
    languages: ['Kinyarwanda', 'English', 'French'],
    insurance: ['RAMA', 'Mutuelle de Santé', 'Private Insurance'],
    consultationFee: '15,000 RWF',
    coordinates: { latitude: -1.9441, longitude: 30.0619 },
    hospital: 'King Faisal Hospital',
    experience: '15 years'
  },
  {
    id: '2',
    name: 'Dr. Marie Claire Uwimana',
    specialty: 'Cosmetic Dermatology',
    rating: 4.9,
    reviewCount: 156,
    address: 'KG 7 Ave, Kimihurura, Kigali',
    phone: '+250 789 234 567',
    email: 'dr.uwimana@cosmeticderm.rw',
    distance: '1.2 km',
    availability: 'Mon-Sat 9AM-6PM',
    languages: ['Kinyarwanda', 'English', 'French'],
    insurance: ['RAMA', 'Private Insurance'],
    consultationFee: '25,000 RWF',
    coordinates: { latitude: -1.9341, longitude: 30.0719 },
    hospital: 'Kigali University Teaching Hospital',
    experience: '12 years'
  },
  {
    id: '3',
    name: 'Dr. Emmanuel Gasana',
    specialty: 'Pediatric Dermatology',
    rating: 4.6,
    reviewCount: 203,
    address: 'KG 2 Ave, Remera, Kigali',
    phone: '+250 787 345 678',
    email: 'dr.gasana@pediatricderm.rw',
    distance: '1.8 km',
    availability: 'Mon-Fri 8AM-4PM',
    languages: ['Kinyarwanda', 'English'],
    insurance: ['RAMA', 'Mutuelle de Santé'],
    consultationFee: '12,000 RWF',
    coordinates: { latitude: -1.9241, longitude: 30.0819 },
    hospital: 'Rwanda Military Hospital',
    experience: '18 years'
  },
  {
    id: '4',
    name: 'Dr. Alice Mukamana',
    specialty: 'Surgical Dermatology',
    rating: 4.8,
    reviewCount: 134,
    address: 'KN 3 Rd, Nyarugenge, Kigali',
    phone: '+250 786 456 789',
    email: 'dr.mukamana@surgicalderm.rw',
    distance: '2.3 km',
    availability: 'Mon-Thu 8AM-5PM',
    languages: ['Kinyarwanda', 'English', 'French'],
    insurance: ['RAMA', 'Private Insurance'],
    consultationFee: '30,000 RWF',
    coordinates: { latitude: -1.9141, longitude: 30.0919 },
    hospital: 'Kibagabaga Hospital',
    experience: '20 years'
  },
  {
    id: '5',
    name: 'Dr. Patrick Niyonsenga',
    specialty: 'General Dermatology',
    rating: 4.5,
    reviewCount: 78,
    address: 'KG 5 Ave, Kacyiru, Kigali',
    phone: '+250 785 567 890',
    email: 'dr.niyonsenga@kacyiruhealth.com',
    distance: '2.8 km',
    availability: 'Mon-Fri 9AM-6PM',
    languages: ['Kinyarwanda', 'English'],
    insurance: ['RAMA', 'Mutuelle de Santé'],
    consultationFee: '10,000 RWF',
    coordinates: { latitude: -1.9041, longitude: 30.1019 },
    hospital: 'Kacyiru District Hospital',
    experience: '10 years'
  },
  {
    id: '6',
    name: 'Dr. Grace Uwineza',
    specialty: 'Cosmetic Dermatology',
    rating: 4.7,
    reviewCount: 95,
    address: 'KG 1 Ave, Kiyovu, Kigali',
    phone: '+250 784 678 901',
    email: 'dr.uwineza@kiyovuclinic.rw',
    distance: '3.1 km',
    availability: 'Mon-Sat 10AM-7PM',
    languages: ['Kinyarwanda', 'English', 'French'],
    insurance: ['Private Insurance'],
    consultationFee: '20,000 RWF',
    coordinates: { latitude: -1.8941, longitude: 30.1119 },
    hospital: 'Kiyovu Medical Center',
    experience: '14 years'
  }
];

export default function ConsultationScreen() {
  const router = useRouter();
  const { condition } = useLocalSearchParams<{ condition: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    } catch (error) {
      console.log('Location permission denied');
    }
  };

  const filteredDermatologists = dermatologists.filter(doc => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'general' && doc.specialty.includes('General')) return true;
    if (selectedFilter === 'cosmetic' && doc.specialty.includes('Cosmetic')) return true;
    if (selectedFilter === 'pediatric' && doc.specialty.includes('Pediatric')) return true;
    if (selectedFilter === 'surgical' && doc.specialty.includes('Surgical')) return true;
    return false;
  }).sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance);
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'reviews') {
      return b.reviewCount - a.reviewCount;
    }
    if (sortBy === 'fee') {
      return parseFloat(a.consultationFee.replace(/[^\d]/g, '')) - parseFloat(b.consultationFee.replace(/[^\d]/g, ''));
    }
    return 0;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleDirections = (coordinates: { latitude: number; longitude: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url);
  };

  const handleBookAppointment = (dermatologist: Dermatologist) => {
    Alert.alert(
      'Book Appointment',
      `Would you like to book an appointment with ${dermatologist.name}?\n\nFee: ${dermatologist.consultationFee}\nHospital: ${dermatologist.hospital}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Office', 
          onPress: () => handleCall(dermatologist.phone) 
        },
        { 
          text: 'Email', 
          onPress: () => handleEmail(dermatologist.email) 
        }
      ]
    );
  };

  const handleShare = (dermatologist: Dermatologist) => {
    const shareText = `Check out ${dermatologist.name} - ${dermatologist.specialty}\n${dermatologist.hospital}\n${dermatologist.address}\nPhone: ${dermatologist.phone}\nFee: ${dermatologist.consultationFee}`;
    Alert.alert('Share', shareText);
  };

  const openMapWithAllDermatologists = () => {
    const dermatologistsCoords = dermatologists.map(doc => `${doc.coordinates.latitude},${doc.coordinates.longitude}`).join('|');
    const url = `https://www.google.com/maps/search/dermatologist/@${dermatologists[0].coordinates.latitude},${dermatologists[0].coordinates.longitude},12z`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Consultation</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Location Status */}
      <View style={styles.locationCard}>
        <MapPin size={20} color="#14B8A6" />
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Kigali, Rwanda</Text>
          <Text style={styles.locationSubtext}>
            {locationPermission ? 'Location enabled - showing nearby dermatologists' : 'Enable location for better results'}
          </Text>
        </View>
      </View>

      {/* Condition Info */}
      {condition && (
        <View style={styles.conditionCard}>
          <Text style={styles.conditionTitle}>Analysis Result</Text>
          <Text style={styles.conditionText}>{condition}</Text>
          <Text style={styles.conditionSubtext}>
            Find a dermatologist in Kigali for professional consultation
          </Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              All Specialties
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'general' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('general')}
          >
            <Text style={[styles.filterText, selectedFilter === 'general' && styles.filterTextActive]}>
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'cosmetic' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('cosmetic')}
          >
            <Text style={[styles.filterText, selectedFilter === 'cosmetic' && styles.filterTextActive]}>
              Cosmetic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'pediatric' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('pediatric')}
          >
            <Text style={[styles.filterText, selectedFilter === 'pediatric' && styles.filterTextActive]}>
              Pediatric
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'surgical' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('surgical')}
          >
            <Text style={[styles.filterText, selectedFilter === 'surgical' && styles.filterTextActive]}>
              Surgical
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>
            Distance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>
            Rating
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'fee' && styles.sortButtonActive]}
          onPress={() => setSortBy('fee')}
        >
          <Text style={[styles.sortText, sortBy === 'fee' && styles.sortTextActive]}>
            Fee
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'reviews' && styles.sortButtonActive]}
          onPress={() => setSortBy('reviews')}
        >
          <Text style={[styles.sortText, sortBy === 'reviews' && styles.sortTextActive]}>
            Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dermatologists List */}
      <ScrollView style={styles.doctorsList} showsVerticalScrollIndicator={false}>
        {filteredDermatologists.map((dermatologist) => (
          <View key={dermatologist.id} style={styles.doctorCard}>
            {/* Doctor Info */}
            <View style={styles.doctorHeader}>
              <View style={styles.doctorAvatar}>
                <Text style={styles.doctorInitial}>
                  {dermatologist.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{dermatologist.name}</Text>
                <Text style={styles.doctorSpecialty}>{dermatologist.specialty}</Text>
                <Text style={styles.doctorHospital}>{dermatologist.hospital}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {dermatologist.rating} ({dermatologist.reviewCount} reviews)
                  </Text>
                </View>
                <View style={styles.distanceContainer}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.distanceText}>{dermatologist.distance}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(dermatologist)}
              >
                <Share2 size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Experience & Fee */}
            <View style={styles.experienceRow}>
              <Text style={styles.experienceText}>Experience: {dermatologist.experience}</Text>
              <Text style={styles.feeText}>Fee: {dermatologist.consultationFee}</Text>
            </View>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.contactText} numberOfLines={2}>
                  {dermatologist.address}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.contactText}>{dermatologist.availability}</Text>
              </View>
            </View>

            {/* Languages & Insurance */}
            <View style={styles.tagsContainer}>
              <View style={styles.tagGroup}>
                <Text style={styles.tagLabel}>Languages:</Text>
                <View style={styles.tags}>
                  {dermatologist.languages.map((lang, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.tagGroup}>
                <Text style={styles.tagLabel}>Insurance:</Text>
                <View style={styles.tags}>
                  {dermatologist.insurance.slice(0, 2).map((ins, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{ins}</Text>
                    </View>
                  ))}
                  {dermatologist.insurance.length > 2 && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>+{dermatologist.insurance.length - 2} more</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(dermatologist.phone)}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => handleEmail(dermatologist.email)}
              >
                <Mail size={16} color="#14B8A6" />
                <Text style={styles.emailButtonText}>Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => handleDirections(dermatologist.coordinates)}
              >
                <Navigation size={16} color="#3B82F6" />
                <Text style={styles.directionsButtonText}>Directions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookAppointment(dermatologist)}
              >
                <Calendar size={16} color="#FFFFFF" />
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Map Button */}
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={openMapWithAllDermatologists}
        >
          <Map size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>View All on Map</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F766E',
  },
  locationSubtext: {
    fontSize: 14,
    color: '#0F766E',
  },
  conditionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  conditionSubtext: {
    fontSize: 14,
    color: '#1E40AF',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#14B8A6',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
  doctorsList: {
    flex: 1,
  },
  doctorCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  doctorHospital: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  experienceText: {
    fontSize: 14,
    color: '#374151',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagGroup: {
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#14B8A6',
    gap: 6,
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 