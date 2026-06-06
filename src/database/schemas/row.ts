export const rowSchema = {
  name: 'rows',
  createStatement: `CREATE TABLE IF NOT EXISTS rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'Row',
  row_order INTEGER NOT NULL DEFAULT 0,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
