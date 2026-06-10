import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class TransactionModel extends Model {
  static table = 'transactions';

  @field('type') type!: string;
  @field('wallet_id') walletId!: string;
  @field('to_wallet_id') toWalletId!: string | null;
  @field('category_id') categoryId!: string;
  @field('amount_enc') amountEnc!: string;
  @field('currency') currency!: string;
  @field('note_enc') noteEnc!: string | null;
  @field('person_name_enc') personNameEnc!: string | null;
  @field('person_phone_enc') personPhoneEnc!: string | null;
  @field('date') date!: number;
  @readonly @date('created_at') createdAt!: Date;
  @field('updated_at') updatedAt!: number;
}
