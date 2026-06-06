export const dropdownEntityValueSchema = {
  name: 'dropdown_entity_values',
  createStatement: `CREATE TABLE IF NOT EXISTS dropdown_entity_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_entity_id UUID NOT NULL,
  option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_dropdown_entity_values_entity FOREIGN KEY (input_entity_id) REFERENCES input_entities(id) ON DELETE CASCADE,
  CONSTRAINT fk_dropdown_entity_values_option FOREIGN KEY (option_id) REFERENCES dropdown_options(id) ON DELETE CASCADE
);`
};
