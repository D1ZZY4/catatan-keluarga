import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class TransactionTemplateModel extends Model {
  static table = 'transaction_templates';

  @field('type') type!: string;
  @field('category_id') categoryId!: string;
  @field('label') label!: string;
  @field('template_data') templateData!: string;
  @readonly @date('created_at') createdAt!: Date;
}
