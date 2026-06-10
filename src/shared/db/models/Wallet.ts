import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export class WalletModel extends Model {
  static table = "wallets";

  @field("name_enc") nameEnc!: string;
  @field("icon") icon!: string;
  @field("color") color!: string;
  @field("currency") currency!: string;
  @field("balance_enc") balanceEnc!: string;
  @field("initial_balance_enc") initialBalanceEnc!: string;
  @field("type") type!: string;
  @field("is_archived") isArchived!: boolean;
  @field("show_in_dashboard") showInDashboard!: boolean;
  @field("include_in_total") includeInTotal!: boolean;
  @field("sort_order") sortOrder!: number;
  @readonly @date("created_at") createdAt!: Date;
}
