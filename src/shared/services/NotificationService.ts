/**
 * NotificationService — wrapper expo-notifications untuk reminder & budget alert.
 * Semua schedule via local notifications (offline-first).
 */

import * as Notifications from 'expo-notifications';
import type { Reminder, Budget } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /** Minta izin notifikasi. Return true jika granted. */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /** Schedule notifikasi untuk sebuah reminder tagihan. */
  async scheduleReminder(reminder: Reminder): Promise<string | null> {
    try {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return null;

      const now = new Date();
      const triggerDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        reminder.dueDay - reminder.notifyDaysBefore,
        8, 0, 0,
      );

      if (triggerDate <= now) {
        triggerDate.setMonth(triggerDate.getMonth() + 1);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Tagihan: ${reminder.name}`,
          body: `Jatuh tempo ${reminder.dueDay} hari lagi. Jangan lupa bayar!`,
          data: { reminderId: reminder.id, type: 'reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      return id;
    } catch {
      return null;
    }
  },

  /** Schedule notifikasi budget alert ketika spending mendekati batas. */
  async scheduleBudgetAlert(
    categoryName: string,
    spent: number,
    limit: number,
    currency: string,
  ): Promise<void> {
    try {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return;

      const pct = Math.round((spent / limit) * 100);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ Budget ${categoryName} ${pct}%`,
          body: `Pengeluaran ${currency} ${spent.toLocaleString('id-ID')} dari batas ${currency} ${limit.toLocaleString('id-ID')}`,
          data: { type: 'budget_alert', category: categoryName },
        },
        trigger: null,
      });
    } catch {
      // silent fail
    }
  },

  /** Kirim immediate notifikasi (langsung muncul). */
  async sendImmediate(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: data ?? {} },
        trigger: null,
      });
    } catch {
      // silent
    }
  },

  /** Cancel semua notifikasi terjadwal. */
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /** Cancel notifikasi by ID. */
  async cancelById(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  },

  /** Get semua pending notifications. */
  async getPending(): Promise<Notifications.NotificationRequest[]> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled;
  },
};
