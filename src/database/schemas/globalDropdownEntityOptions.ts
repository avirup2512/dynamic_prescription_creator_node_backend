export const globalDropdownEntityOptionsSchema = {
  name: 'global_dropdown_entity_options',
  createStatement: `CREATE TABLE IF NOT EXISTS global_dropdown_entity_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dropdown_entity_id UUID NOT NULL,
  option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_global_dropdown_entity_options_entity FOREIGN KEY (dropdown_entity_id) REFERENCES global_dropdown_entities(id) ON DELETE CASCADE,
  CONSTRAINT fk_global_dropdown_entity_options_option FOREIGN KEY (option_id) REFERENCES global_dropdown_options(id) ON DELETE CASCADE
);`
};
