import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class PriceCacheModel extends Model {
  static table = 'price_cache';

  @field('key') key!: string;
  @field('value') value!: string;
  @field('fetched_at') fetchedAt!: number;
}
