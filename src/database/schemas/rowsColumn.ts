export const rowsColumnSchema = {
  name: 'rows_columns',
  createStatement: `CREATE TABLE IF NOT EXISTS rows_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_id UUID NOT NULL,
  column_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_rows_columns_row FOREIGN KEY (row_id) REFERENCES rows(id) ON DELETE CASCADE,
  CONSTRAINT fk_rows_columns_column FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);`
};
