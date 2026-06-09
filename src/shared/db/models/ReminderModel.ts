import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class ReminderModel extends Model {
  static table = 'reminders';

  @field('name') name!: string;
  @field('amount') amount!: number | null;
  @field('currency') currency!: string;
  @field('due_day') dueDay!: number;
  @field('period') period!: string;
  @field('category') category!: string;
  @field('notify_days_before') notifyDaysBefore!: number;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}
