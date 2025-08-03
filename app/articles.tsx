import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, BookOpen, Clock, Tag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ArticleData {
  id: string;
  title: string;
  description: string;
  image: string;
  readTime: string;
  category: string;
}

// Articles with full content
const availableArticles = ['understanding-acne', 'skin-cancer-prevention', 'eczema-management'];

const allArticles: ArticleData[] = [
  {
    id: 'understanding-acne',
    title: "Understanding Acne: Causes, Types, and Treatments",
    description: "Learn about causes, types, and effective treatments for acne.",
    image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "5 min read",
    category: "Conditions"
  },
  {
    id: 'skin-cancer-prevention',
    title: "Skin Cancer Prevention: Essential Protection Strategies",
    description: "Essential tips for protecting your skin from harmful UV rays.",
    image: "https://images.pexels.com/photos/4269921/pexels-photo-4269921.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "7 min read",
    category: "Prevention"
  },
  {
    id: 'eczema-management',
    title: "Eczema Management: Comprehensive Care Guide",
    description: "Comprehensive guide to managing eczema symptoms and triggers.",
    image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "6 min read",
    category: "Treatment"
  },
  {
    id: 'psoriasis-guide',
    title: "Psoriasis: Understanding and Managing the Condition",
    description: "A comprehensive guide to understanding psoriasis and effective management strategies.",
    image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "8 min read",
    category: "Conditions"
  },
  {
    id: 'anti-aging-skincare',
    title: "Anti-Aging Skincare: Science-Based Approaches",
    description: "Evidence-based strategies for maintaining youthful, healthy skin.",
    image: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "9 min read",
    category: "Treatment"
  },
  {
    id: 'sunscreen-guide',
    title: "Complete Sunscreen Guide: Protection Made Simple",
    description: "Everything you need to know about choosing and using sunscreen effectively.",
    image: "https://images.pexels.com/photos/4269921/pexels-photo-4269921.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "6 min read",
    category: "Prevention"
  },
  {
    id: 'rosacea-treatment',
    title: "Rosacea Treatment: Managing Facial Redness",
    description: "Effective strategies for managing rosacea symptoms and triggers.",
    image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "7 min read",
    category: "Treatment"
  },
  {
    id: 'vitamin-d-skin',
    title: "Vitamin D and Skin Health: The Complete Connection",
    description: "Understanding the relationship between vitamin D and skin health.",
    image: "https://images.pexels.com/photos/4269921/pexels-photo-4269921.jpeg?auto=compress&cs=tinysrgb&w=400",
    readTime: "5 min read",
    category: "Prevention"
  }
];

const categories = ['All', 'Conditions', 'Prevention', 'Treatment'];

export default function ArticlesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <Text style={styles.headerTitle}>Learn More</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      <ScrollView style={styles.articlesContainer} showsVerticalScrollIndicator={false}>
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No articles found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          <View style={styles.articlesGrid}>
            {filteredArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => router.push(`/article?id=${article.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: article.image }} style={styles.articleImage} />
                <View style={styles.articleContent}>
                  <View style={styles.articleMeta}>
                    <View style={styles.categoryBadge}>
                      <Tag size={10} color="#14B8A6" />
                      <Text style={styles.categoryText}>{article.category}</Text>
                    </View>
                    <View style={styles.readTimeContainer}>
                      <Clock size={10} color="#9CA3AF" />
                      <Text style={styles.readTimeText}>{article.readTime}</Text>
                    </View>
                  </View>
                  {!availableArticles.includes(article.id) && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                    </View>
                  )}
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.articleDescription} numberOfLines={3}>
                    {article.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#14B8A6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  articlesContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  articlesGrid: {
    padding: 20,
    gap: 16,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  articleContent: {
    padding: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  comingSoonBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
}); 