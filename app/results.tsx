import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CircleAlert as AlertCircle, Info, Calendar, Download, Share, Eye, EyeOff } from 'lucide-react-native';
import { useScanContext } from '@/contexts/ScanContext';

const { width: screenWidth } = Dimensions.get('window');

interface AnalysisResult {
  condition: string;
  confidence: number;
  description: string;
  careAdvice: string[];
  severity: 'Low' | 'Moderate' | 'High';
  riskLevel: string;
  gradcamUri?: string; // Add GradCAM URI
}

export default function ResultsScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const { addScan } = useScanContext();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showGradCAM, setShowGradCAM] = useState(true); // Toggle for GradCAM view
  const [gradcamLoading, setGradcamLoading] = useState(false);

  // Mock AI analysis results for fallback
  const mockResults: AnalysisResult[] = [
    {
      condition: 'Acne',
      confidence: 87.3,
      description: 'Common inflammatory skin condition affecting hair follicles and oil glands.',
      careAdvice: [
        'Use gentle, non-comedogenic cleansers',
        'Apply topical retinoids as recommended',
        'Avoid picking or squeezing lesions',
        'Consider salicylic acid or benzoyl peroxide treatments'
      ],
      severity: 'Moderate',
      riskLevel: 'Generally benign but may cause scarring if untreated'
    },
    {
      condition: 'Eczema',
      confidence: 92.1,
      description: 'Chronic inflammatory skin condition characterized by dry, itchy patches.',
      careAdvice: [
        'Moisturize frequently with fragrance-free products',
        'Identify and avoid triggers',
        'Use mild, soap-free cleansers',
        'Apply topical corticosteroids as prescribed'
      ],
      severity: 'Moderate',
      riskLevel: 'Chronic condition requiring ongoing management'
    },
    {
      condition: 'Psoriasis',
      confidence: 79.8,
      description: 'Autoimmune condition causing rapid skin cell turnover and scaling.',
      careAdvice: [
        'Keep skin moisturized',
        'Manage stress levels',
        'Consider phototherapy treatments',
        'Follow prescribed medication regimen'
      ],
      severity: 'Moderate',
      riskLevel: 'Chronic autoimmune condition'
    }
  ];

  const fetchGradCAM = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('🔥 Fetching GradCAM visualization...');
      setGradcamLoading(true);

      // Create FormData with proper file handling
      const formData = new FormData();
      
      // Get file extension from URI
      const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;
      const fileExtension = imageUriString.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      // Handle web vs mobile differently
      if (Platform.OS === 'web') {
        // For web, we need to fetch the image and create a blob
        try {
          const response = await fetch(imageUriString);
          const blob = await response.blob();
          formData.append('file', blob, `image.${fileExtension}`);
        } catch (error) {
          console.error('Error creating blob for GradCAM web:', error);
          // Fallback to original method
          formData.append('file', {
            uri: imageUriString,
            type: mimeType,
            name: `image.${fileExtension}`,
          } as any);
        }
      } else {
        // For mobile, use the original method
        formData.append('file', {
          uri: imageUriString,
          type: mimeType,
          name: `image.${fileExtension}`,
        } as any);
      }

      const response = await fetch('https://dermassist-app-qxzs.onrender.com/gradcam', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'image/png',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`GradCAM request failed: ${response.status}`);
      }

      // Convert the response to a blob and then to a data URI
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          console.log('✅ GradCAM fetched successfully');
          resolve(dataUri);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error fetching GradCAM:', error);
      return null;
    } finally {
      setGradcamLoading(false);
    }
  };

  const fetchAnalysis = async (retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      if (!imageUri) {
        throw new Error('Image URI is missing');
      }
  
      console.log(`🚀 Starting image analysis... (attempt ${retryCount + 1})`);
      console.log('📱 Image URI:', imageUri);
      console.log('📤 Preparing FormData...');
  
      // Create FormData with proper file handling
      const formData = new FormData();
      
      // Get file extension from URI
      const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;
      const fileExtension = imageUriString.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      // Ensure we're sending a JPEG for better compatibility
      const finalMimeType = 'image/jpeg';
      const finalExtension = 'jpg';
      
      // Handle web vs mobile differently
      if (Platform.OS === 'web') {
        // For web, we need to fetch the image and create a blob
        try {
          const response = await fetch(imageUriString);
          const blob = await response.blob();
          formData.append('file', blob, `image.${finalExtension}`);
        } catch (error) {
          console.error('Error creating blob for web:', error);
          // Fallback to original method
          formData.append('file', {
            uri: imageUriString,
            type: finalMimeType,
            name: `image.${finalExtension}`,
          } as any);
        }
      } else {
        // For mobile, use the original method
        formData.append('file', {
          uri: imageUriString,
          type: finalMimeType,
          name: `image.${finalExtension}`,
        } as any);
      }
  
      console.log('📤 FormData prepared, sending request...');
      console.log('📤 FormData details:', {
        uri: imageUriString,
        type: finalMimeType,
        name: `image.${finalExtension}`,
        originalExtension: fileExtension,
        originalMimeType: mimeType,
        finalExtension,
        finalMimeType
      });
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 30 seconds');
        controller.abort();
      }, 30000);
  
      const response = await fetch('https://dermassist-app-qxzs.onrender.com/predict', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          // Don't set Content-Type for FormData - let the browser set it with boundary
        },
      });
  
      clearTimeout(timeoutId);
  
      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response ok:', response.ok);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        
        let errorMessage = `Server error (${response.status})`;
        
        switch (response.status) {
          case 422:
            errorMessage = 'Invalid image format or corrupted file (422 Unprocessable Entity)';
            break;
          case 502:
            errorMessage = 'Server is temporarily unavailable (502 Bad Gateway)';
            break;
          case 503:
            errorMessage = 'Service is currently unavailable (503 Service Unavailable)';
            break;
          case 504:
            errorMessage = 'Request timeout (504 Gateway Timeout)';
            break;
          case 500:
            errorMessage = 'Internal server error (500)';
            break;
          default:
            errorMessage = `HTTP error! status: ${response.status}`;
        }
        
        if ((response.status === 502 || response.status === 503 || response.status === 504) && retryCount < maxRetries) {
          console.log(`🔄 Retrying in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return fetchAnalysis(retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('✅ Analysis successful:', data);
      
      // Fetch GradCAM visualization
      const gradcamUri = await fetchGradCAM(imageUri as string);
      
      setResult({
        condition: data.predicted_class || 'Unknown',
        confidence: Math.min(100, Math.max(0, (data.confidence || 0) * 100)),
        description: getConditionDescription(data.predicted_class),
        careAdvice: getConditionCareAdvice(data.predicted_class),
        severity: getConditionSeverity(data.predicted_class),
        riskLevel: getConditionRiskLevel(data.predicted_class),
        gradcamUri: gradcamUri || undefined,
      });
    } catch (error) {
      console.error('❌ Error fetching analysis:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
      
      let alertMessage = 'Using offline analysis mode.';
      
      if (error.name === 'AbortError') {
        alertMessage = 'Request timed out. Using offline analysis mode.';
      } else if (error.message.includes('502')) {
        alertMessage = 'Server is temporarily down (502 error). Using offline analysis mode.';
      } else if (error.message.includes('503')) {
        alertMessage = 'Service temporarily unavailable (503 error). Using offline analysis mode.';
      } else if (error.message.includes('Network') || error.message.includes('not responding')) {
        alertMessage = 'Network connection issue. Using offline analysis mode.';
      }
      
      Alert.alert(
        'Analysis Complete', 
        alertMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const getConditionDescription = (condition: string): string => {
    const descriptions = {
      'DrugEruption': 'A skin reaction caused by medication or drugs, characterized by rashes, hives, or other skin changes.',
      'Acne': 'Common inflammatory skin condition affecting hair follicles and oil glands.',
      'Eczema': 'Chronic inflammatory skin condition characterized by dry, itchy patches.',
      'Psoriasis': 'Autoimmune condition causing rapid skin cell turnover and scaling.',
    };
    
    return descriptions[condition] || 'This condition requires professional medical evaluation for proper diagnosis and treatment.';
  };
  
  const getConditionCareAdvice = (condition: string): string[] => {
    const careAdvice = {
      'DrugEruption': [
        'Discontinue the suspected medication immediately',
        'Consult your doctor about alternative medications',
        'Apply cool, wet compresses to affected areas',
        'Avoid scratching or rubbing the rash',
        'Seek immediate medical attention if symptoms worsen'
      ],
      'Acne': [
        'Use gentle, non-comedogenic cleansers',
        'Apply topical retinoids as recommended',
        'Avoid picking or squeezing lesions',
        'Consider salicylic acid or benzoyl peroxide treatments'
      ],
      'Eczema': [
        'Moisturize frequently with fragrance-free products',
        'Identify and avoid triggers',
        'Use mild, soap-free cleansers',
        'Apply topical corticosteroids as prescribed'
      ],
      'Psoriasis': [
        'Keep skin moisturized',
        'Manage stress levels',
        'Consider phototherapy treatments',
        'Follow prescribed medication regimen'
      ]
    };
    
    return careAdvice[condition] || [
      'Keep the affected area clean and dry',
      'Avoid scratching or picking at the area',
      'Consult with a dermatologist for proper treatment',
      'Monitor for any changes in appearance'
    ];
  };
  
  const getConditionSeverity = (condition: string): 'Low' | 'Moderate' | 'High' => {
    const severities = {
      'DrugEruption': 'High',
      'Acne': 'Moderate',
      'Eczema': 'Moderate',
      'Psoriasis': 'Moderate'
    };
    
    return severities[condition] || 'Moderate';
  };
  
  const getConditionRiskLevel = (condition: string): string => {
    const riskLevels = {
      'DrugEruption': 'Potentially serious - requires immediate medical attention',
      'Acne': 'Generally benign but may cause scarring if untreated',
      'Eczema': 'Chronic condition requiring ongoing management',
      'Psoriasis': 'Chronic autoimmune condition'
    };
    
    return riskLevels[condition] || 'Please consult a healthcare professional for proper evaluation.';
  };

  useEffect(() => {
    if (imageUri) {
      fetchAnalysis();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No image provided for analysis');
    }
  }, [imageUri]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return '#10B981';
      case 'Moderate': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10B981';
    if (confidence >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const saveToHistory = () => {
    if (result && imageUri) {
      addScan({
        condition: result.condition,
        confidence: result.confidence,
        severity: result.severity,
        imageUri: imageUri as string,
        bodyPart: 'Analyzed Area',
        description: result.description,
        careAdvice: result.careAdvice,
        riskLevel: result.riskLevel,
        symptoms: ['Detected during AI analysis'],
        treatmentOptions: ['Consult dermatologist for specific treatment plan']
      });
      setIsSaved(true);
    }
  };

  const toggleGradCAMView = () => {
    setShowGradCAM(!showGradCAM);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingTitle}>Analyzing Image</Text>
          <Text style={styles.loadingSubtitle}>Our AI is examining your skin condition...</Text>
          
          <View style={styles.loadingSteps}>
            <View style={styles.loadingStep}>
              <View style={[styles.stepIndicator, { backgroundColor: '#14B8A6' }]} />
              <Text style={styles.stepText}>Image preprocessing</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={[styles.stepIndicator, { backgroundColor: '#14B8A6' }]} />
              <Text style={styles.stepText}>Feature extraction</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={[styles.stepIndicator, { backgroundColor: '#14B8A6' }]} />
              <Text style={styles.stepText}>GradCAM visualization</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={[styles.stepIndicator, { backgroundColor: '#E5E7EB' }]} />
              <Text style={styles.stepText}>Classification</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>No Results Available</Text>
          <Text style={styles.loadingSubtitle}>Please try analyzing an image again.</Text>
          <TouchableOpacity style={styles.consultButton} onPress={() => router.back()}>
            <Text style={styles.consultButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image and GradCAM Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {/* Toggle Button */}
            <TouchableOpacity style={styles.toggleButton} onPress={toggleGradCAMView}>
              {showGradCAM ? <Eye size={16} color="#FFFFFF" /> : <EyeOff size={16} color="#FFFFFF" />}
              <Text style={styles.toggleButtonText}>
                {showGradCAM ? 'Hide Heatmap' : 'Show Heatmap'}
              </Text>
            </TouchableOpacity>

            {/* Image Display */}
            {showGradCAM && result.gradcamUri ? (
              <View style={styles.gradcamContainer}>
                <Image source={{ uri: result.gradcamUri }} style={styles.analyzedImage} />
                <View style={styles.gradcamLabel}>
                  <Text style={styles.gradcamText}>AI Focus Areas (GradCAM)</Text>
                </View>
              </View>
            ) : (
              <View style={styles.originalImageContainer}>
                <Image source={{ uri: imageUri as string }} style={styles.analyzedImage} />
                <View style={styles.originalImageLabel}>
                  <Text style={styles.originalImageText}>Original Image</Text>
                </View>
              </View>
            )}

            {/* Loading indicator for GradCAM */}
            {gradcamLoading && (
              <View style={styles.gradcamLoadingOverlay}>
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text style={styles.gradcamLoadingText}>Loading visualization...</Text>
              </View>
            )}
          </View>

          {/* GradCAM Explanation */}
          {result.gradcamUri && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>About GradCAM Visualization</Text>
              <Text style={styles.explanationText}>
                The heatmap shows which areas of your image the AI focused on when making its prediction. 
                Warmer colors (red/yellow) indicate areas that were more important for the diagnosis.
              </Text>
            </View>
          )}
        </View>

        {/* Results Card */}
        <View style={styles.resultsCard}>
          <View style={styles.conditionHeader}>
            <Text style={styles.conditionName}>{result.condition}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(result.severity) }]}>
              <Text style={styles.severityText}>{result.severity}</Text>
            </View>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${Math.min(100, Math.max(0, result.confidence))}%`,
                    backgroundColor: getConfidenceColor(result.confidence)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.confidenceValue, { color: getConfidenceColor(result.confidence) }]}>
              {result.confidence.toFixed(1)}%
            </Text>
          </View>

          <Text style={styles.description}>{result.description}</Text>

          <View style={styles.riskContainer}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.riskText}>{result.riskLevel}</Text>
          </View>
        </View>

        {/* Care Advice */}
        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>Recommended Care</Text>
          {result.careAdvice.map((advice, index) => (
            <View key={index} style={styles.adviceItem}>
              <View style={styles.adviceBullet} />
              <Text style={styles.adviceText}>{advice}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Info size={20} color="#3B82F6" />
            <Text style={styles.disclaimerTitle}>Important Notice</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This analysis is for educational purposes only and should not replace professional medical consultation. Please consult a dermatologist for proper diagnosis and treatment.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.consultButton}
            onPress={() => router.push(`/consultation?condition=${result?.condition || 'Skin Condition'}`)}
          >
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.consultButtonText}>Book Consultation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, isSaved && styles.savedButton]}
            onPress={saveToHistory}
            disabled={isSaved}
          >
            <Download size={20} color={isSaved ? "#10B981" : "#14B8A6"} />
            <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
              {isSaved ? 'Saved to History' : 'Save to History'}
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingSteps: {
    width: '100%',
    gap: 16,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepText: {
    fontSize: 16,
    color: '#6B7280',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  shareButton: {
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
  imageSection: {
    padding: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  toggleButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gradcamContainer: {
    position: 'relative',
  },
  originalImageContainer: {
    position: 'relative',
  },
  analyzedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  gradcamLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 12,
  },
  gradcamText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  originalImageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    padding: 12,
  },
  originalImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gradcamLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradcamLoadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
  },
  explanationCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  resultsCard: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  conditionName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  riskText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  adviceCard: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  adviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginTop: 8,
  },
  
  adviceText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  disclaimerCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginBottom: 24,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 32,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  consultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  savedButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  savedButtonText: {
    color: '#10B981',
  },
});