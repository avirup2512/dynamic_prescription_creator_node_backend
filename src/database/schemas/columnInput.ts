export const columnInputSchema = {
  name: 'column_inputs',
  createStatement: `CREATE TABLE IF NOT EXISTS column_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL,
  input_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_column_inputs_column FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
  CONSTRAINT fk_column_inputs_input FOREIGN KEY (input_id) REFERENCES inputs(id) ON DELETE CASCADE
);`
};
