export const templateColumnSchema = {
  name: 'template_columns',
  createStatement: `CREATE TABLE IF NOT EXISTS template_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  width INTEGER NOT NULL DEFAULT 12,
  column_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
