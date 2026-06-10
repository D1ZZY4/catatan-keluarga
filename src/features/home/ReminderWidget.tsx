import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { formatCurrency } from '../../shared/utils/format';

export function ReminderWidget() {
  const { colors: c } = useTheme();
  const { reminders } = useAppData();

  const today = new Date();

  const upcoming = useMemo(() => {
    return reminders
      .filter((r) => r.isActive)
      .map((r) => {
        let dueDate: Date;
        if (r.period === 'bulanan') {
          dueDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
          if (dueDate.getTime() < Date.now()) {
            dueDate = new Date(today.getFullYear(), today.getMonth() + 1, r.dueDay);
          }
        } else {
          const diff = (r.dueDay - today.getDay() + 7) % 7;
          dueDate = new Date(today);
          dueDate.setDate(today.getDate() + diff);
        }
        const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
        return { reminder: r, dueDate, daysLeft };
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 3);
  }, [reminders]);

  if (upcoming.length === 0) return null;

  return (
    <View style={s.section}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Bell size={14} color="#e65100" />
          <Text style={[s.title, { color: c.textPrimary }]}>Pengingat Tagihan</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings' as any)}>
          <Text style={[s.linkText, { color: c.textMuted }]}>Lihat semua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {upcoming.map(({ reminder, daysLeft }) => {
          const isUrgent = daysLeft <= 3;
          const cardBg = isUrgent ? 'rgba(230,81,0,0.08)' : c.bgCard;
          const borderColor = isUrgent ? 'rgba(230,81,0,0.28)' : 'transparent';
          const badgeBg = isUrgent ? 'rgba(230,81,0,0.18)' : c.bgSurface;
          const badgeColor = isUrgent ? '#e65100' : c.textMuted;

          return (
            <View
              key={reminder.id}
              style={[s.card, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}
            >
              <View style={[s.badge, { backgroundColor: badgeBg }]}>
                <Text style={[s.badgeText, { color: badgeColor }]}>
                  {daysLeft === 0
                    ? 'Hari ini!'
                    : daysLeft === 1
                    ? 'Besok'
                    : `${daysLeft} hari lagi`}
                </Text>
              </View>

              <Text style={[s.reminderName, { color: c.textPrimary }]} numberOfLines={1}>
                {reminder.name}
              </Text>

              {reminder.amount !== undefined && (
                <Text style={[s.reminderAmount, { color: c.textPrimary }]}>
                  {formatCurrency(reminder.amount, reminder.currency)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  section: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  linkText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    width: 160,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'DM-Sans-SemiBold',
  },
  reminderName: {
    fontSize: 12,
    fontFamily: 'DM-Sans-SemiBold',
  },
  reminderAmount: {
    fontSize: 14,
    fontFamily: 'Instrument-Serif',
    letterSpacing: -0.5,
  },
});
