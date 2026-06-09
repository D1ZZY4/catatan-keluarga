import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class WalletModel extends Model {
  static table = 'wallets';

  @field('name') name!: string;
  @field('icon') icon!: string;
  @field('color') color!: string;
  @field('currency') currency!: string;
  @field('balance') balance!: number;
  @field('initial_balance') initialBalance!: number;
  @field('type') type!: string;
  @field('is_archived') isArchived!: boolean;
  @field('show_in_dashboard') showInDashboard!: boolean;
  @field('include_in_total') includeInTotal!: boolean;
  @field('sort_order') sortOrder!: number;
  @readonly @date('created_at') createdAt!: Date;
}
