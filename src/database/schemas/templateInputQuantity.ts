export const templateInputQuantitySchema = {
  name: 'template_inputs_quantity',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs_quantity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  quantity_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_id FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_quantity_id FOREIGN KEY (quantity_id) REFERENCES quantities(id) ON DELETE RESTRICT
);`
};
