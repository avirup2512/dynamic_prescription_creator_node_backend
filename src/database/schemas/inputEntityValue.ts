export const inputEntityValueSchema = {
  name: 'input_entity_values',
  createStatement: `CREATE TABLE IF NOT EXISTS input_entity_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_entity_id UUID NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_input_entity_values_entity FOREIGN KEY (input_entity_id) REFERENCES input_entities(id) ON DELETE CASCADE
);`
};
