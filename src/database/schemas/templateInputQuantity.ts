export const templateInputQuantitySchema = {
  name: 'template_column_inputs',
  createStatement: `CREATE TABLE IF NOT EXISTS template_column_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  quantity_id UUID NOT NULL,
  quantity_option_id UUID NOT NULL,
  quantity_values Varchar,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_id FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_quantity_id FOREIGN KEY (quantity_id) REFERENCES quantities(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quantity_option_id FOREIGN KEY (quantity_option_id) REFERENCES quantity_options(id) ON DELETE RESTRICT
);`
};
