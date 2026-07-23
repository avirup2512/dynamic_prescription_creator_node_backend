export const templateInputGroupConditionSchema = {
  name: 'template_inputs_group_conditions',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_group_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_group_id UUID NOT NULL,
  previous_input_group_id UUID,
  condition_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_input_group_conditions UNIQUE (input_group_id,previous_input_group_id),
  CONSTRAINT fk_template_inputs_group_conditions_main_input_group FOREIGN KEY (input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_group_conditions_previous_input_group FOREIGN KEY (previous_input_group_id) REFERENCES template_input_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_group_conditions_condition FOREIGN KEY (condition_id) REFERENCES input_conditions(id) ON DELETE CASCADE
);`
};
