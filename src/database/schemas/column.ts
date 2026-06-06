export const columnSchema = {
  name: 'columns',
  createStatement: `CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'Input List',
  width INTEGER NOT NULL DEFAULT 12,
  column_order INTEGER NOT NULL DEFAULT 0,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
