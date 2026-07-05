export const templateRowsColumnSchema = {
  name: 'template_rows_columns',
  createStatement: `CREATE TABLE IF NOT EXISTS template_rows_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_id UUID NOT NULL,
  column_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_row_column UNIQUE (row_id, column_id),
  CONSTRAINT fk_template_rows_columns_row FOREIGN KEY (row_id) REFERENCES template_rows(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_rows_columns_column FOREIGN KEY (column_id) REFERENCES template_columns(id) ON DELETE CASCADE
);`
};
