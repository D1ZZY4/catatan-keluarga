import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class UsagePatternModel extends Model {
  static table = 'usage_patterns';

  @field('key') key!: string;
  @field('value') value!: string;
}
