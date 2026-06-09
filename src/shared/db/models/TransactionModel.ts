import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class TransactionModel extends Model {
  static table = 'transactions';

  @field('type') type!: string;
  @field('wallet_id') walletId!: string;
  @field('to_wallet_id') toWalletId!: string | null;
  @field('category_id') categoryId!: string;
  @field('amount') amount!: number;
  @field('currency') currency!: string;
  @field('note') note!: string | null;
  @field('person_name') personName!: string | null;
  @field('person_phone') personPhone!: string | null;
  @field('date') date!: number;
  @readonly @date('created_at') createdAt!: Date;
}
