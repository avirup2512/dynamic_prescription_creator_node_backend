export const templateInputQuantityOptionSchema = {
  name: 'template_input_quantity_options',
  createStatement: `CREATE TABLE IF NOT EXISTS template_input_quantity_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  quantity_option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_quantity_option_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_input_quantity_option_quantity_option FOREIGN KEY (quantity_option_id) REFERENCES quantity_options(id) ON DELETE RESTRICT
);`
};
