export const templateInputDropdownOptionsSchema = {
  name: 'template_input_dropdown_options',
  createStatement: `CREATE TABLE IF NOT EXISTS template_input_dropdown_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  dropdown_option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_dropdown_option_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_input_dropdown_option_dropdown_option FOREIGN KEY (dropdown_option_id) REFERENCES dropdown_options(id) ON DELETE RESTRICT
);`
};
