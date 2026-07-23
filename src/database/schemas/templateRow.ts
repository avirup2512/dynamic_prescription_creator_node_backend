export const templateRowSchema = {
  name: 'template_rows',
  createStatement: `CREATE TABLE IF NOT EXISTS template_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  row_order INTEGER NOT NULL DEFAULT 0,
  is_visible SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
