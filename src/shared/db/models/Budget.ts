import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class BudgetModel extends Model {
  static table = 'budgets';

  @field('category_id') categoryId!: string;
  @field('amount_enc') amountEnc!: string;
  @field('currency') currency!: string;
  @field('period') period!: string;
  @field('month') month!: number | null;
  @field('year') year!: number | null;
  @field('notify_at') notifyAt!: number;
  @readonly @date('created_at') createdAt!: Date;
}
