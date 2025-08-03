import 'dotenv/config';

export default {
  expo: {
    name: "derm-assist",
    slug: "derm-assist",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/favicon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.adaobi.dermassist"
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "932970b7-e0c1-4f05-9906-41e9c5bd5ef9"
      },
      geminiApiKey: process.env.GEMINI_API_KEY
    },
    android: {
      package: "com.jefftrojan.dermassist"
    }
  }
}; 