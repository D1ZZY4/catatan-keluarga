/**
 * ReminderWidget — widget pengingat tagihan di home screen.
 * Menampilkan tagihan yang akan jatuh tempo bulan ini.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Bell, Plus } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { ReminderSheet } from '../reminders/ReminderSheet';
import { formatCurrency } from '../../shared/utils/format';
import type { Reminder } from '../../shared/types';

export function ReminderWidget() {
  const { colors: c } = useTheme();
  const { reminders } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | undefined>();

  const now = new Date();
  const today = now.getDate();

  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((r) => r.isActive)
      .map((r) => {
        const daysUntil = r.dueDay >= today ? r.dueDay - today : 30 - today + r.dueDay;
        return { reminder: r, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);
  }, [reminders, today]);

  const openAdd = () => {
    setEditReminder(undefined);
    setSheetOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditReminder(r);
    setSheetOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Tagihan Mendatang</Text>
        <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: c.accentPrimary + '20' }]}>
          <Plus size={14} color={c.accentPrimary} />
          <Text style={[styles.addBtnText, { color: c.accentPrimary }]}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {upcomingReminders.length === 0 ? (
        <TouchableOpacity
          onPress={openAdd}
          style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.bgCard }]}
        >
          <Bell size={18} color={c.textMuted} />
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Belum ada tagihan terjadwal
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.card, { backgroundColor: c.bgCard }]}>
          {upcomingReminders.map(({ reminder, daysUntil }, i) => (
            <TouchableOpacity
              key={reminder.id}
              onPress={() => openEdit(reminder)}
              style={[
                styles.reminderRow,
                i < upcomingReminders.length - 1 && { borderBottomColor: c.bgPage, borderBottomWidth: 1 },
              ]}
            >
              <View
                style={[
                  styles.daysBox,
                  {
                    backgroundColor:
                      daysUntil <= 3 ? '#c628280F' : daysUntil <= 7 ? '#e651000F' : c.bgPage,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.daysNum,
                    { color: daysUntil <= 3 ? '#c62828' : daysUntil <= 7 ? '#e65100' : c.accentPrimary },
                  ]}
                >
                  {daysUntil}
                </Text>
                <Text style={[styles.daysLabel, { color: c.textMuted }]}>hari</Text>
              </View>
              <View style={styles.reminderInfo}>
                <Text style={[styles.reminderName, { color: c.textPrimary }]}>{reminder.name}</Text>
                <Text style={[styles.reminderSub, { color: c.textMuted }]}>
                  {reminder.category} • Tgl {reminder.dueDay}
                  {reminder.amount !== undefined && ` • ${formatCurrency(reminder.amount, reminder.currency)}`}
                </Text>
              </View>
              {daysUntil <= 3 && (
                <View style={[styles.urgentBadge, { backgroundColor: '#c6282820' }]}>
                  <Text style={{ fontSize: 10, color: '#c62828', fontFamily: 'DM-Sans-SemiBold' }}>Segera!</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ReminderSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} editReminder={editReminder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { fontSize: 12, fontFamily: 'DM-Sans-SemiBold' },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, fontFamily: 'DM-Sans' },
  card: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  daysBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  daysNum: { fontSize: 16, fontFamily: 'DM-Sans-Bold', lineHeight: 18 },
  daysLabel: { fontSize: 9, fontFamily: 'DM-Sans', letterSpacing: 0.3 },
  reminderInfo: { flex: 1 },
  reminderName: { fontSize: 13, fontFamily: 'DM-Sans-Medium', marginBottom: 2 },
  reminderSub: { fontSize: 11, fontFamily: 'DM-Sans' },
  urgentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
});
