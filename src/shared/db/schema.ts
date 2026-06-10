import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'wallets',
      columns: [
        { name: 'name_enc', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'currency', type: 'string' },
        { name: 'balance_enc', type: 'string' },
        { name: 'initial_balance_enc', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'is_archived', type: 'boolean' },
        { name: 'show_in_dashboard', type: 'boolean' },
        { name: 'include_in_total', type: 'boolean' },
        { name: 'sort_order', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'wallet_id', type: 'string', isIndexed: true },
        { name: 'to_wallet_id', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'amount_enc', type: 'string' },
        { name: 'currency', type: 'string' },
        { name: 'note_enc', type: 'string', isOptional: true },
        { name: 'person_name_enc', type: 'string', isOptional: true },
        { name: 'person_phone_enc', type: 'string', isOptional: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'is_default', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'budgets',
      columns: [
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'amount_enc', type: 'string' },
        { name: 'currency', type: 'string' },
        { name: 'period', type: 'string' },
        { name: 'month', type: 'number', isOptional: true },
        { name: 'year', type: 'number', isOptional: true },
        { name: 'notify_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'reminders',
      columns: [
        { name: 'name_enc', type: 'string' },
        { name: 'amount_enc', type: 'string', isOptional: true },
        { name: 'currency', type: 'string' },
        { name: 'due_day', type: 'number' },
        { name: 'period', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'notify_days_before', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transaction_templates',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'category_id', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'template_data', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tags',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transaction_tags',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'tag_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'price_cache',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'fetched_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'usage_patterns',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value_enc', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'recurring_transactions',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'template_data', type: 'string' },
        { name: 'frequency', type: 'string' },
        { name: 'next_due_date', type: 'number', isIndexed: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
