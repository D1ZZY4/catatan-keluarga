import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class RecurringTransactionModel extends Model {
  static table = 'recurring_transactions';

  @field('type') type!: string;
  @field('template_data') templateData!: string;
  @field('frequency') frequency!: string;
  @field('next_due_date') nextDueDate!: number;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}
