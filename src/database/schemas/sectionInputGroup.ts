export const sectionInputGroupSchema = {
  name: 'section_input_groups',
  createStatement: `CREATE TABLE IF NOT EXISTS section_input_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL,
  input_group_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_section_input_groups_section FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);`
};