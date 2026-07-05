export const templateInputGroupOrSchema = {
  name: 'template_inputs_group_or',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_group_or (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_input_group_id UUID NOT NULL,
  or_input_group_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_input_group_or UNIQUE (parent_input_group_id, or_input_group_id),
  CONSTRAINT fk_template_inputs_group_or_parent FOREIGN KEY (parent_input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_group_or_or FOREIGN KEY (or_input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE
);`
};
