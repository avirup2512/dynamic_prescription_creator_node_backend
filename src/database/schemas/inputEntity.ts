export const inputEntitySchema = {
  name: 'input_entities',
  createStatement: `CREATE TABLE IF NOT EXISTS input_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type_id UUID NOT NULL,
  user_id UUID,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_input_entities_type FOREIGN KEY (type_id) REFERENCES input_types(id) ON DELETE RESTRICT,
  CONSTRAINT fk_input_entities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);`
};
