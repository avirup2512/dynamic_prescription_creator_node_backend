export const templateInputsQuantityValueSchema = {
  name: 'template_inputs_quantity_value',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_quantity_value (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  value VARCHAR(255) NOT NULL,
  CONSTRAINT fk_template_inputs_quantity_value_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
