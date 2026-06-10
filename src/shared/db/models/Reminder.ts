import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class ReminderModel extends Model {
  static table = 'reminders';

  @field('name_enc') declare nameEnc: string;
  @field('amount_enc') declare amountEnc: string | null;
  @field('currency') declare currency: string;
  @field('due_day') declare dueDay: number;
  @field('period') declare period: string;
  @field('category') declare category: string;
  @field('notify_days_before') declare notifyDaysBefore: number;
  @field('is_active') declare isActive: boolean;
  @readonly @date('created_at') declare createdAt: Date;
}
