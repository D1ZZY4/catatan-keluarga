import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class BudgetModel extends Model {
  static table = 'budgets';

  @field('category_id') declare categoryId: string;
  @field('amount_enc') declare amountEnc: string;
  @field('currency') declare currency: string;
  @field('period') declare period: string;
  @field('month') declare month: number | null;
  @field('year') declare year: number | null;
  @field('notify_at') declare notifyAt: number;
  @readonly @date('created_at') declare createdAt: Date;
}
