export const inputValueSchema = {
  name: 'input_values',
  createStatement: `CREATE TABLE IF NOT EXISTS input_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_entity_type_id UUID NOT NULL,
  quantity_id UUID NOT NULL,
  format_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_input_values_entity FOREIGN KEY (input_entity_type_id) REFERENCES input_entities(id) ON DELETE CASCADE,
  CONSTRAINT fk_input_values_quantity FOREIGN KEY (quantity_id) REFERENCES quantities(id) ON DELETE RESTRICT,
  CONSTRAINT fk_input_values_format FOREIGN KEY (format_id) REFERENCES formats(id) ON DELETE RESTRICT
);`
};
