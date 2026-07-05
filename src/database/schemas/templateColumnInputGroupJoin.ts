export const templateColumnInputGroupJoinSchema = {
  name: 'template_column_input_group_join',
  createStatement: `CREATE TABLE IF NOT EXISTS template_column_input_group_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL,
  template_input_group_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_column_input_group UNIQUE (column_id, template_input_group_id),
  CONSTRAINT fk_template_column_input_group_join_column FOREIGN KEY (column_id) REFERENCES template_columns(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_column_input_group_join_input_group FOREIGN KEY (template_input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE
);`
};
