# DermAssist AI 🩺

A comprehensive AI-powered dermatology assistant mobile app built with React Native and Expo. DermAssist AI helps users analyze skin conditions, get personalized care advice, and track their skin health over time.


## Links

- **GitHub repository**: [https://github.com/StellaIbeh/derma_assist_project](https://github.com/StellaIbeh/derma_assist_project)
- **Demo video**: [https://youtu.be/9zBH_XndtoE]
- **Figma designs**: [https://www.figma.com/design/yV7pp569h973h74Js265mt/DermAssist-AI?node-id=0-1&t=Jd9Z8GpwXFOkbMLu-1](https://www.figma.com/design/yV7pp569h973h74Js265mt/DermAssist-AI?node-id=0-1&t=Jd9Z8GpwXFOkbMLu-1)

## ✨ Features

### 🔍 AI-Powered Skin Analysis
- **Smart Camera Integration**: Take photos with guided capture interface
- **Advanced AI Analysis**: Machine learning models trained on dermatology data
- **Instant Results**: Get immediate analysis with confidence scores
- **Condition Detection**: Identifies common skin conditions like acne, eczema, psoriasis

### 💬 Intelligent Chat Assistant
- **24/7 AI Support**: Get instant answers to skin health questions
- **Personalized Advice**: Tailored recommendations based on your concerns
- **Educational Content**: Learn about various skin conditions and treatments
- **Quick Questions**: Pre-built queries for common skin concerns

### 📊 Comprehensive History Tracking
- **Scan History**: Save and track all your skin analyses
- **Progress Monitoring**: View changes over time with detailed records
- **Smart Filtering**: Filter scans by date ranges and conditions
- **Detailed Reports**: Complete analysis reports with care recommendations

### 📚 Educational Resources
- **Interactive Learning**: Tap to explore detailed skin condition information
- **Expert Content**: Curated educational materials from dermatology experts
- **Care Tips**: Practical advice for maintaining healthy skin
- **Statistics & Insights**: Key facts and treatment success rates

### 🔐 Privacy & Security
- **Medical Privacy**: Follows strict medical privacy guidelines
- **Secure Storage**: All data processed securely with Supabase
- **User Control**: Full control over your data and privacy settings
- **End-to-End Encryption**: Secure data transmission and storage

### 🔧 Backend Features
- **User Authentication**: Secure sign up/sign in with Supabase Auth
- **Real-time Database**: PostgreSQL database with real-time subscriptions
- **User Profiles**: Complete profile management with settings
- **Data Persistence**: All scans and settings saved to the cloud
- **CRUD Operations**: Full create, read, update, delete functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dermassist-ai.git
   cd dermassist-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key to `.env`
   - Run the database migration:
     ```bash
     # In your Supabase dashboard, go to SQL Editor and run the migration file
     # supabase/migrations/001_initial_schema.sql
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run on your device**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - Or use iOS Simulator/Android Emulator

## 🏗 Backend Architecture

### Database Schema

#### Profiles Table
- User profile information (name, email, phone, etc.)
- Membership type (Free, Premium, Pro)
- Created/updated timestamps

#### User Settings Table
- App preferences (notifications, theme, language)
- Privacy settings (analytics, data sharing)
- Feature toggles (auto-save, high quality images)

#### Scans Table
- Scan results and analysis data
- Image URLs and metadata
- Care advice and treatment recommendations
- User-specific scan history

### Authentication
- **Supabase Auth**: Email/password authentication
- **Row Level Security**: Database-level security policies
- **Session Management**: Automatic token refresh and persistence
- **Profile Creation**: Automatic profile and settings creation on signup

### Real-time Features
- **Live Updates**: Real-time sync across devices
- **Offline Support**: Local storage with sync when online
- **Optimistic Updates**: Immediate UI updates with server sync

## 📱 App Structure

```
app/
├── (tabs)/                 # Main tab navigation
│   ├── index.tsx          # Home screen with quick actions
│   ├── scan.tsx           # Camera and image analysis
│   ├── chat.tsx           # AI chat assistant
│   ├── history.tsx        # Scan history and tracking
│   └── settings.tsx       # App settings and preferences
├── auth.tsx               # Authentication screen
├── onboarding.tsx         # App introduction and setup
├── results.tsx            # Analysis results display
└── _layout.tsx            # Root layout with providers

contexts/
├── AuthContext.tsx        # Authentication state management
├── SettingsContext.tsx    # User settings management
└── ScanContext.tsx        # Scan data management

lib/
└── supabase.ts           # Supabase client configuration

supabase/
└── migrations/           # Database schema migrations
```

## 🛠 Technology Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API
- **Camera**: Expo Camera
- **Icons**: Lucide React Native
- **Styling**: React Native StyleSheet
- **Platform**: Web-first with mobile support

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### API Keys Required

1. **Supabase**: For backend services (database, auth, storage)
2. **Gemini API**: For AI chat functionality

For detailed setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## 🎨 Design Philosophy

- **Apple-level Design**: Meticulous attention to detail and user experience
- **Accessibility First**: Designed for users of all abilities
- **Medical Standards**: Follows healthcare app design guidelines
- **Responsive**: Beautiful on all screen sizes and orientations

## 📋 Key Screens

### 🏠 Home Screen
- Welcome interface with quick actions
- Educational content cards
- Medical disclaimers and ethics notices
- Beautiful hero sections with interactive elements

### 📸 Scan Screen
- Professional camera interface with guided capture
- Real-time focus frame and photography tips
- Image upload from gallery option
- Analysis loading states with progress indicators

### 🤖 Chat Screen
- Conversational AI interface
- Quick question buttons for common concerns
- Message history with timestamps
- Professional medical disclaimer

### 📈 History Screen
- Dynamic scan records with filtering
- Detailed modal views for each scan
- Statistics dashboard
- Export and sharing capabilities

### ⚙️ Settings Screen
- User profile management with real-time updates
- Privacy and security controls
- App preferences and customization
- AI ethics and bias transparency

## 🔒 Privacy & Ethics

DermAssist AI is committed to:
- **Medical Privacy**: HIPAA-compliant data handling
- **AI Transparency**: Clear information about AI limitations
- **Bias Awareness**: Ongoing work to improve accuracy across all skin types
- **User Control**: Complete control over personal data
- **Secure Backend**: Enterprise-grade security with Supabase

## 🚨 Medical Disclaimer

**Important**: This app is for educational purposes only and should not replace professional medical consultation. Always consult with a qualified dermatologist for proper diagnosis and treatment of skin conditions.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct before submitting pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dermatology experts who provided medical guidance
- AI/ML researchers for skin condition detection models
- Supabase team for excellent backend services
- Open source community for amazing tools and libraries
- Beta testers who provided valuable feedback

## 📞 Support

For support, email support@dermassist.ai or join our community discussions.

---

**Made with ❤️ for better skin health**