import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ArrowUpDown, BarChart3, Wallet, Settings } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { FAB } from '@/shared/components/FAB';

const TAB_CONFIG = [
  { name: 'beranda',     label: 'Beranda',    Icon: Home,        size: 22 },
  { name: 'transaksi',   label: 'Transaksi',  Icon: ArrowUpDown, size: 22 },
  { name: 'statistik',   label: 'Statistik',  Icon: BarChart3,   size: 26 },
  { name: 'dompet',      label: 'Dompet',     Icon: Wallet,      size: 22 },
  { name: 'pengaturan',  label: 'Pengaturan', Icon: Settings,    size: 22 },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom + 8 }]}>
      <View
        style={[
          styles.tabBarContainer,
          { backgroundColor: colors.bgCard },
          shadows.float,
        ]}
      >
        {(state.routes as Array<{ key: string; name: string }>).map((route, index) => {
          const isFocused = state.index === index;
          const tabConf = TAB_CONFIG[index];
          if (!tabConf) return null;
          const { Icon, label, size } = tabConf;
          const color = isFocused ? colors.accentPrimary : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityLabel={label}
              accessibilityRole="button"
            >
              <Icon size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.8} />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontFamily: isFocused ? 'DMSans-SemiBold' : 'DMSans-Regular',
                  },
                ]}
              >
                {label}
              </Text>
              {isFocused && (
                <View style={[styles.activeDot, { backgroundColor: colors.accentPrimary }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="beranda" />
        <Tabs.Screen name="transaksi" />
        <Tabs.Screen name="statistik" />
        <Tabs.Screen name="dompet" />
        <Tabs.Screen name="pengaturan" />
      </Tabs>
      <FAB />
    </>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 480,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 44,
    minWidth: 44,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
