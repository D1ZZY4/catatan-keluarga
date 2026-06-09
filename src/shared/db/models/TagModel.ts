import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class TagModel extends Model {
  static table = 'tags';

  @field('name') name!: string;
  @readonly @date('created_at') createdAt!: Date;
}
