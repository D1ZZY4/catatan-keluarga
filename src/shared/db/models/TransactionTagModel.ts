import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class TransactionTagModel extends Model {
  static table = 'transaction_tags';

  @field('transaction_id') transactionId!: string;
  @field('tag_id') tagId!: string;
}
