export const templateInputConditionSchema = {
  name: 'template_inputs_condition',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_condition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_id UUID NOT NULL,
  previous_input_id UUID NOT NULL,
  condition_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_input_condition UNIQUE (input_id, previous_input_id),
  CONSTRAINT fk_template_inputs_condition_parent FOREIGN KEY (input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_condition_child FOREIGN KEY (previous_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_condition_condition FOREIGN KEY (condition_id) REFERENCES input_conditions(id) ON DELETE CASCADE
);`
};
