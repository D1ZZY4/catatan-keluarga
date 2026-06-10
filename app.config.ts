import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Catat Artha',
  slug: 'catat-artha',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/icons/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFF9D2',
  },
  android: {
    package: 'id.catartha.app',
    adaptiveIcon: {
      foregroundImage: './assets/icons/adaptive-icon.png',
      backgroundColor: '#FFF9D2',
    },
    permissions: [
      'CAMERA',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
    ],
    versionCode: 1,
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-local-authentication',
    'expo-notifications',
    ['expo-camera', { cameraPermission: 'Izinkan kamera untuk scan struk.' }],
    ['expo-secure-store'],
    ['expo-dev-client'],
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    buildDate: new Date().toISOString().split('T')[0],
    eas: {
      projectId: 'catat-artha',
    },
  },
});
