import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class TransactionModel extends Model {
  static table = 'transactions';

  @field('type') declare type: string;
  @field('wallet_id') declare walletId: string;
  @field('to_wallet_id') declare toWalletId: string | null;
  @field('category_id') declare categoryId: string;
  @field('amount_enc') declare amountEnc: string;
  @field('currency') declare currency: string;
  @field('note_enc') declare noteEnc: string | null;
  @field('person_name_enc') declare personNameEnc: string | null;
  @field('person_phone_enc') declare personPhoneEnc: string | null;
  @field('date') declare date: number;
  @readonly @date('created_at') declare createdAt: Date;
  @field('updated_at') declare updatedAt: number;
}
