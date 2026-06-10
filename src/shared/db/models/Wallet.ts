import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export class WalletModel extends Model {
  static table = "wallets";

  @field("name_enc") declare nameEnc: string;
  @field("icon") declare icon: string;
  @field("color") declare color: string;
  @field("currency") declare currency: string;
  @field("balance_enc") declare balanceEnc: string;
  @field("initial_balance_enc") declare initialBalanceEnc: string;
  @field("type") declare type: string;
  @field("is_archived") declare isArchived: boolean;
  @field("show_in_dashboard") declare showInDashboard: boolean;
  @field("include_in_total") declare includeInTotal: boolean;
  @field("sort_order") declare sortOrder: number;
  @readonly @date("created_at") declare createdAt: Date;
}
