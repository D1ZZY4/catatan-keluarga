import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class CategoryModel extends Model {
  static table = 'categories';

  @field('name') declare name: string;
  @field('icon') declare icon: string;
  @field('color') declare color: string;
  @field('type') declare type: string;
  @field('is_default') declare isDefault: boolean;
  @readonly @date('created_at') declare createdAt: Date;
}
