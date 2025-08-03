import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Tag, Share2, BookOpen, Heart, Shield, TrendingUp, MessageCircle, Camera, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ArticleData {
  id: string;
  title: string;
  description: string;
  image: string;
  readTime: string;
  category: string;
  content: string[];
  tips: string[];
  relatedTopics: string[];
}

const articles: Record<string, ArticleData> = {
  'understanding-acne': {
    id: 'understanding-acne',
    title: 'Understanding Acne: Causes, Types, and Treatments',
    description: 'Learn about causes, types, and effective treatments for acne.',
    image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '5 min read',
    category: 'Conditions',
    content: [
      'Acne is one of the most common skin conditions affecting people of all ages, particularly during adolescence. It occurs when hair follicles become clogged with oil and dead skin cells, leading to the formation of pimples, blackheads, and whiteheads.',
      'The primary causes of acne include excess oil production, clogged hair follicles, bacteria, and inflammation. Hormonal changes, stress, certain medications, and diet can also contribute to acne development.',
      'There are several types of acne lesions: comedones (blackheads and whiteheads), papules (small red bumps), pustules (pimples with pus), nodules (large, painful lumps), and cysts (deep, pus-filled lesions).',
      'Treatment approaches vary depending on the severity and type of acne. Mild cases may respond to over-the-counter treatments containing benzoyl peroxide, salicylic acid, or alpha hydroxy acids.',
      'For moderate to severe acne, prescription medications like topical retinoids, antibiotics, or oral medications may be necessary. It\'s important to consult with a dermatologist for personalized treatment plans.',
      'Prevention strategies include maintaining a consistent skincare routine, avoiding touching your face frequently, using non-comedogenic products, and managing stress levels.'
    ],
    tips: [
      'Wash your face twice daily with a gentle cleanser',
      'Use oil-free, non-comedogenic skincare products',
      'Avoid picking or popping pimples',
      'Keep your hair clean and away from your face',
      'Consider dietary changes if certain foods trigger breakouts'
    ],
    relatedTopics: ['Hormonal Acne', 'Adult Acne', 'Acne Scars', 'Skincare Routine']
  },
  'skin-cancer-prevention': {
    id: 'skin-cancer-prevention',
    title: 'Skin Cancer Prevention: Essential Protection Strategies',
    description: 'Essential tips for protecting your skin from harmful UV rays.',
    image: 'https://images.pexels.com/photos/4269921/pexels-photo-4269921.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '7 min read',
    category: 'Prevention',
    content: [
      'Skin cancer is the most common type of cancer worldwide, with UV radiation from the sun being the primary cause. Understanding prevention strategies is crucial for maintaining skin health.',
      'There are three main types of skin cancer: basal cell carcinoma, squamous cell carcinoma, and melanoma. While melanoma is less common, it\'s the most dangerous and can be life-threatening if not caught early.',
      'UV radiation damages the DNA in skin cells, leading to mutations that can cause cancer. Both UVA and UVB rays contribute to skin damage, with UVB being primarily responsible for sunburn and UVA contributing to aging and skin cancer.',
      'The ABCDE rule helps identify potential melanoma: Asymmetry, Border irregularity, Color variation, Diameter larger than 6mm, and Evolution or changes over time.',
      'Regular skin self-examinations are essential for early detection. Check your entire body monthly, including hard-to-see areas, and have a professional skin examination annually.',
      'Protection strategies include seeking shade during peak sun hours (10 AM to 4 PM), wearing protective clothing, using broad-spectrum sunscreen with SPF 30 or higher, and avoiding tanning beds.'
    ],
    tips: [
      'Apply sunscreen 15-30 minutes before sun exposure',
      'Reapply sunscreen every 2 hours or after swimming/sweating',
      'Wear protective clothing including wide-brimmed hats',
      'Seek shade during peak UV hours (10 AM - 4 PM)',
      'Perform monthly skin self-examinations'
    ],
    relatedTopics: ['Sunscreen Guide', 'Skin Self-Exam', 'UV Index', 'Protective Clothing']
  },
  'eczema-management': {
    id: 'eczema-management',
    title: 'Eczema Management: Comprehensive Care Guide',
    description: 'Comprehensive guide to managing eczema symptoms and triggers.',
    image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '6 min read',
    category: 'Treatment',
    content: [
      'Eczema, also known as atopic dermatitis, is a chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin. It affects people of all ages but is most common in children.',
      'The exact cause of eczema is unknown, but it\'s believed to result from a combination of genetic and environmental factors. People with eczema often have a compromised skin barrier and an overactive immune system.',
      'Common triggers include dry skin, irritants (soaps, detergents, fragrances), allergens (dust mites, pet dander, pollen), stress, temperature changes, and certain foods in some individuals.',
      'Symptoms vary but typically include dry, sensitive skin, intense itching, red or brownish-gray patches, small raised bumps that may leak fluid, and thickened, cracked, or scaly skin.',
      'Treatment focuses on managing symptoms and preventing flare-ups. This includes maintaining skin hydration, identifying and avoiding triggers, using appropriate medications, and establishing a consistent skincare routine.',
      'Moisturizing is the cornerstone of eczema management. Apply moisturizer immediately after bathing to lock in moisture, and reapply throughout the day as needed.'
    ],
    tips: [
      'Take lukewarm baths or showers (not hot)',
      'Use fragrance-free, gentle cleansers',
      'Apply moisturizer within 3 minutes of bathing',
      'Wear cotton clothing and avoid wool or synthetic fabrics',
      'Keep nails short to prevent scratching damage'
    ],
    relatedTopics: ['Atopic Dermatitis', 'Contact Dermatitis', 'Moisturizers', 'Trigger Management']
  }
};

export default function ArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const article = articles[id || 'understanding-acne'];

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800' }} 
            style={styles.headerImage} 
          />
          <View style={styles.headerOverlay} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Coming Soon Content */}
          <View style={styles.comingSoonContainer}>
            <View style={styles.comingSoonIcon}>
              <BookOpen size={48} color="#14B8A6" />
            </View>
            <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
            <Text style={styles.comingSoonSubtitle}>
              We're working hard to bring you comprehensive content about this topic.
            </Text>
            
            <View style={styles.comingSoonCard}>
              <Text style={styles.comingSoonCardTitle}>What to Expect</Text>
              <View style={styles.comingSoonFeatures}>
                <View style={styles.comingSoonFeature}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Detailed explanations and causes</Text>
                </View>
                <View style={styles.comingSoonFeature}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Professional treatment advice</Text>
                </View>
                <View style={styles.comingSoonFeature}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Practical tips and prevention</Text>
                </View>
                <View style={styles.comingSoonFeature}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Expert-backed recommendations</Text>
                </View>
              </View>
            </View>

            {/* Alternative Actions */}
            <View style={styles.alternativeActions}>
              <Text style={styles.alternativeTitle}>In the meantime...</Text>
              
              <TouchableOpacity 
                style={styles.alternativeCard}
                onPress={() => router.push('/chat')}
              >
                <MessageCircle size={24} color="#8B5CF6" />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeCardTitle}>Ask Our AI Assistant</Text>
                  <Text style={styles.alternativeCardText}>
                    Get instant answers to your questions about this topic
                  </Text>
                </View>
                <ChevronRight size={20} color="#8B5CF6" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.alternativeCard}
                onPress={() => router.push('/scan')}
              >
                <Camera size={24} color="#14B8A6" />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeCardTitle}>Take a Skin Scan</Text>
                  <Text style={styles.alternativeCardText}>
                    Get AI-powered analysis of your skin condition
                  </Text>
                </View>
                <ChevronRight size={20} color="#14B8A6" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.alternativeCard}
                onPress={() => router.push('/articles')}
              >
                <BookOpen size={24} color="#F59E0B" />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeCardTitle}>Browse Other Articles</Text>
                  <Text style={styles.alternativeCardText}>
                    Explore our available educational content
                  </Text>
                </View>
                <ChevronRight size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>

            {/* Notification Signup */}
            <View style={styles.notificationCard}>
              <Text style={styles.notificationTitle}>Stay Updated</Text>
              <Text style={styles.notificationText}>
                We'll notify you when this article and other new content becomes available.
              </Text>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationButtonText}>Get Notified</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: article.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Tag size={12} color="#14B8A6" />
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <View style={styles.readTimeContainer}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.readTimeText}>{article.readTime}</Text>
            </View>
          </View>
        </View>

        {/* Article Title */}
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleDescription}>{article.description}</Text>

        {/* Content Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Understanding the Condition</Text>
          {article.content.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.tipsHeader}>
            <Heart size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>Practical Tips</Text>
          </View>
          {article.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Related Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Topics</Text>
          <View style={styles.relatedTopicsContainer}>
            {article.relatedTopics.map((topic, index) => (
              <TouchableOpacity key={index} style={styles.relatedTopic}>
                <Text style={styles.relatedTopicText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <BookOpen size={24} color="#14B8A6" />
            <Text style={styles.ctaTitle}>Need More Help?</Text>
            <Text style={styles.ctaText}>
              Chat with our AI assistant for personalized advice or schedule a consultation with a dermatologist.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => router.push('/chat')}
              >
                <Text style={styles.ctaButtonText}>Ask AI Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.ctaButton, styles.ctaButtonSecondary]}
                onPress={() => router.push('/scan')}
              >
                <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>Take Skin Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Shield size={16} color="#F59E0B" />
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and should not replace professional medical consultation. Always consult with a qualified dermatologist for proper diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImageContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  metaContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#14B8A6',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
    lineHeight: 36,
  },
  articleDescription: {
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  relatedTopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedTopic: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  relatedTopicText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  ctaCard: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  ctaButtonTextSecondary: {
    color: '#14B8A6',
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
  // Coming Soon Styles
  comingSoonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  comingSoonCard: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  comingSoonCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  comingSoonFeatures: {
    gap: 12,
  },
  comingSoonFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  alternativeActions: {
    width: '100%',
    marginBottom: 32,
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  alternativeContent: {
    flex: 1,
    marginLeft: 12,
  },
  alternativeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alternativeCardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notificationCard: {
    backgroundColor: '#EFF6FF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    width: '100%',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  notificationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  notificationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 