export const columnInputSchema = {
  name: 'column_inputs_group_join',
  createStatement: `CREATE TABLE IF NOT EXISTS column_inputs_group_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL,
  section_input_group_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_column_inputs_column FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
  CONSTRAINT fk_column_inputs_input FOREIGN KEY (section_input_group_id) REFERENCES section_input_groups(id) ON DELETE CASCADE
);`
};
