export const templateInputOrSchema = {
  name: 'template_inputs_or',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_or (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_input_id UUID NOT NULL,
  or_input_id UUID NOT NULL,
  is_parent_a_group SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_inputs_or_parent FOREIGN KEY (parent_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_or_or FOREIGN KEY (or_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
