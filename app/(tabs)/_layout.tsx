import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, TrendingUp, BarChart2, Wallet, Settings } from 'lucide-react-native';
import { AppColorsLight, AppColorsDark } from '../../src/shared/config/colors';
import { AppLabels } from '../../src/shared/config/labels';

// TODO: Connect to ThemeContext
const isDark = false;
const colors = isDark ? AppColorsDark : AppColorsLight;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 28,
          backgroundColor: `${colors.bgCard}DD`,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: AppLabels.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: AppLabels.tabs.transaction,
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: AppLabels.tabs.stats,
          tabBarIcon: ({ color, focused }) => (
            <BarChart2
              size={28}
              color={color}
              strokeWidth={focused ? 2.5 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: AppLabels.tabs.wallet,
          tabBarIcon: ({ color, focused }) => (
            <Wallet
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: AppLabels.tabs.settings,
          tabBarIcon: ({ color, focused }) => (
            <Settings
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.75}
            />
          ),
        }}
      />
    </Tabs>
  );
}
