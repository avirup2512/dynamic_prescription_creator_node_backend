export const templateColumnInputSchema = {
  name: 'template_column_inputs',
  createStatement: `CREATE TABLE IF NOT EXISTS template_column_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL,
  input_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_column_inputs_column FOREIGN KEY (column_id) REFERENCES template_columns(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_column_inputs_input FOREIGN KEY (input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
