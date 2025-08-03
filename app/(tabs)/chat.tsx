import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, Bot, User, Lightbulb, CircleHelp as HelpCircle, Shield, Heart, TriangleAlert as AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { config } from '../../config/env';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  formattedContent?: FormattedContent[];
}

interface FormattedContent {
  type: 'text' | 'section' | 'bullet' | 'warning' | 'tip' | 'info';
  content: string;
  title?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI dermatology assistant powered by Gemini. I can help answer questions about skin conditions, skincare routines, and general skin health. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      formattedContent: [
        {
          type: 'text',
          content: "Hello! I'm your AI dermatology assistant powered by Gemini. I can help answer questions about skin conditions, skincare routines, and general skin health. How can I assist you today?"
        }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickQuestions = [
    {
      text: "What causes acne?",
      icon: HelpCircle,
      color: '#3B82F6'
    },
    {
      text: "How to prevent wrinkles?",
      icon: Shield,
      color: '#8B5CF6'
    },
    {
      text: "Best skincare routine?",
      icon: Heart,
      color: '#14B8A6'
    },
    {
      text: "Sun protection tips",
      icon: Lightbulb,
      color: '#F59E0B'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if API key is configured
    if (!config.geminiApiKey) {
      Alert.alert(
        'Configuration Required',
        'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Function to parse and format AI responses
  const parseAIResponse = (text: string): FormattedContent[] => {
    const formattedContent: FormattedContent[] = [];
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      
      // Check for section headers (lines ending with :)
      if (trimmed.includes(':') && trimmed.length < 100 && !trimmed.includes('. ')) {
        const [title, ...content] = trimmed.split(':');
        if (content.length > 0) {
          formattedContent.push({
            type: 'section',
            title: title.trim(),
            content: content.join(':').trim()
          });
        } else {
          formattedContent.push({
            type: 'section',
            title: title.trim(),
            content: ''
          });
        }
      }
      // Check for bullet points or lists
      else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        formattedContent.push({
          type: 'bullet',
          content: trimmed
        });
      }
      // Check for warnings (contains words like "warning", "important", "note")
      else if (/warning|important|caution|critical/i.test(trimmed)) {
        formattedContent.push({
          type: 'warning',
          content: trimmed
        });
      }
      // Check for tips (contains words like "tip", "advice", "recommendation")
      else if (/tip|advice|recommendation|suggestion/i.test(trimmed)) {
        formattedContent.push({
          type: 'tip',
          content: trimmed
        });
      }
      // Check for general information
      else if (/remember|note|info|fact/i.test(trimmed)) {
        formattedContent.push({
          type: 'info',
          content: trimmed
        });
      }
      // Regular text
      else {
        formattedContent.push({
          type: 'text',
          content: trimmed
        });
      }
    }
    
    return formattedContent;
  };

  const callGeminiAPI = async (prompt: string): Promise<string> => {
    try {
      if (!config.geminiApiKey) {
        throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.');
      }

      // Enhanced prompt for dermatology context with better formatting
      const dermatologyPrompt = `You are a helpful AI dermatology assistant. Please provide informative and helpful responses about skin health, skincare, and dermatology topics. 

IMPORTANT: Structure your responses with clear sections, bullet points, and helpful formatting. Use the following format when appropriate:

- Break down complex topics into sections
- Use bullet points for lists and steps
- Include tips and warnings when relevant
- Keep paragraphs concise and readable
- Use clear headings for different topics

Always remind users to consult with a dermatologist for serious concerns or medical diagnosis.

User question: ${prompt}

Please provide a helpful, informative response with good structure:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: dermatologyPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!config.geminiApiKey) {
      Alert.alert(
        'Configuration Required',
        'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.',
        [{ text: 'OK' }]
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await callGeminiAPI(text.trim());
      const formattedContent = parseAIResponse(aiResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        formattedContent: formattedContent
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API key.`,
        isUser: false,
        timestamp: new Date(),
        formattedContent: [
          {
            type: 'warning',
            content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API key.`
          }
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const renderFormattedContent = (content: FormattedContent, index: number) => {
    switch (content.type) {
      case 'section':
        return (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{content.title}</Text>
            {content.content && (
              <Text style={styles.sectionContent}>{content.content}</Text>
            )}
          </View>
        );
      
      case 'bullet':
        return (
          <View key={index} style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletText}>•</Text>
            </View>
            <Text style={styles.bulletContent}>{content.content.replace(/^[•\-\*]\s*/, '')}</Text>
          </View>
        );
      
      case 'warning':
        return (
          <View key={index} style={styles.warningContainer}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.warningText}>{content.content}</Text>
          </View>
        );
      
      case 'tip':
        return (
          <View key={index} style={styles.tipContainer}>
            <Lightbulb size={16} color="#F59E0B" />
            <Text style={styles.tipText}>{content.content}</Text>
          </View>
        );
      
      case 'info':
        return (
          <View key={index} style={styles.infoContainer}>
            <Info size={16} color="#3B82F6" />
            <Text style={styles.infoText}>{content.content}</Text>
          </View>
        );
      
      default:
        return (
          <Text key={index} style={styles.regularText}>
            {content.content}
          </Text>
        );
    }
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      <View style={[
        styles.messageAvatar,
        { backgroundColor: message.isUser ? '#14B8A6' : '#3B82F6' }
      ]}>
        {message.isUser ? (
          <User size={16} color="#FFFFFF" />
        ) : (
          <Bot size={16} color="#FFFFFF" />
        )}
      </View>
      
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
      ]}>
        {message.isUser ? (
          <Text style={styles.userMessageText}>
            {message.text}
          </Text>
        ) : (
          <View style={styles.aiMessageContent}>
            {message.formattedContent ? (
              message.formattedContent.map((content, index) => 
                renderFormattedContent(content, index)
              )
            ) : (
              <Text style={styles.aiMessageText}>
                {message.text}
              </Text>
            )}
          </View>
        )}
        <Text style={[
          styles.messageTime,
          message.isUser ? styles.userMessageTime : styles.aiMessageTime
        ]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View style={[styles.messageAvatar, { backgroundColor: '#3B82F6' }]}>
        <Bot size={16} color="#FFFFFF" />
      </View>
      <View style={[styles.messageBubble, styles.aiMessageBubble, styles.typingBubble]}>
        <View style={styles.typingIndicator}>
          <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
          <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
          <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Bot size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Dermatology Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {config.geminiApiKey ? 'Powered by Gemini' : 'Configuration Required'}
            </Text>
          </View>
        </View>
      </View>

      {!config.geminiApiKey ? (
        <View style={styles.configRequiredContainer}>
          <Text style={styles.configRequiredTitle}>Configuration Required</Text>
          <Text style={styles.configRequiredSubtitle}>
            Please set the GEMINI_API_KEY environment variable to use the chat feature.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            {isTyping && renderTypingIndicator()}
          </ScrollView>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
              <View style={styles.quickQuestionsGrid}>
                {quickQuestions.map((question, index) => {
                  const QuestionIcon = question.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.quickQuestionButton, { borderColor: question.color }]}
                      onPress={() => handleQuickQuestion(question.text)}
                      activeOpacity={0.8}
                    >
                      <QuestionIcon size={16} color={question.color} />
                      <Text style={[styles.quickQuestionText, { color: question.color }]}>
                        {question.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about skin conditions, skincare tips..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() ? '#14B8A6' : '#E5E7EB' }
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
              >
                <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <AlertTriangle size={14} color="#F59E0B" />
        <Text style={styles.disclaimerText}>
          AI responses are for educational purposes only. Consult a dermatologist for medical advice.
        </Text>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  userMessageBubble: {
    backgroundColor: '#14B8A6',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  aiMessageContent: {
    gap: 8,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageText: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 22,
  },
  regularText: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 8,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#9CA3AF',
  },
  
  // Formatted content styles
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletPoint: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    color: '#14B8A6',
    fontWeight: '600',
  },
  bulletContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#991B1B',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#92400E',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#1E40AF',
  },
  
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  quickQuestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  configRequiredContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configRequiredTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  configRequiredSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});