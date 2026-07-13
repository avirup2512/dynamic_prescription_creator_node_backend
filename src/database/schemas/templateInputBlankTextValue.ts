export const templateInputBlankTextValueSchema = {
    name: 'template_input_blank_text_value',
    createStatement: `CREATE TABLE IF NOT EXISTS template_input_blank_text_value (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  value VARCHAR(255) NOT NULL,
  CONSTRAINT uq_template_input_blank_text_value UNIQUE(template_input_id),
  CONSTRAINT fk_template_input_blank_text_value_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
