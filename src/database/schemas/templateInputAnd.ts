export const templateInputAndSchema = {
  name: 'template_inputs_and',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_and (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  and_input_id UUID NOT NULL,
  parent_input_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_inputs_and_parent FOREIGN KEY (parent_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_inputs_and_and FOREIGN KEY (and_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
