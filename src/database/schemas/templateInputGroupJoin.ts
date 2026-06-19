export const templateInputGroupJoinSchema = {
  name: 'template_input_group_join',
  createStatement: `CREATE TABLE IF NOT EXISTS template_input_group_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_group_id UUID NOT NULL,
  template_input_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_group_join_template_input_group FOREIGN KEY (template_input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_input_group_join_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};