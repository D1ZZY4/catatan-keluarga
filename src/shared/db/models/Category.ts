import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class CategoryModel extends Model {
  static table = 'categories';

  @field('name') name!: string;
  @field('icon') icon!: string;
  @field('color') color!: string;
  @field('type') type!: string;
  @field('is_default') isDefault!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}
