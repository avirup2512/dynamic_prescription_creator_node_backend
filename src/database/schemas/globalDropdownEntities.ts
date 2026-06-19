export const globalDropdownEntities = {
  name: 'global_dropdown_entities',
  createStatement: `CREATE TABLE IF NOT EXISTS global_dropdown_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type_id UUID NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_global_dropdown_entities_type FOREIGN KEY (type_id) REFERENCES input_types(id) ON DELETE RESTRICT,
  CONSTRAINT fk_global_dropdown_entities_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);`
};
