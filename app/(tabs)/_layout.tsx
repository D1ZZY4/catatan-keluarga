import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, TrendingUp, BarChart2, Wallet, Settings } from 'lucide-react-native';
import { AppLabels } from '../../src/shared/config/labels';
import { useTheme } from '../../src/shared/context/ThemeContext';

function TabIcon({
  Icon,
  color,
  focused,
  size = 22,
  accentColor,
}: {
  Icon: React.ElementType;
  color: string;
  focused: boolean;
  size?: number;
  accentColor: string;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 1.75} />
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: focused ? accentColor : 'transparent',
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

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
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: AppLabels.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} accentColor={colors.accentPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: AppLabels.tabs.transaction,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={TrendingUp} color={color} focused={focused} accentColor={colors.accentPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: AppLabels.tabs.stats,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={BarChart2} color={color} focused={focused} size={28} accentColor={colors.accentPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: AppLabels.tabs.wallet,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Wallet} color={color} focused={focused} accentColor={colors.accentPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: AppLabels.tabs.settings,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Settings} color={color} focused={focused} accentColor={colors.accentPrimary} />
          ),
        }}
      />
    </Tabs>
  );
}
