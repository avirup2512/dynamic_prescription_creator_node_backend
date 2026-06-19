export const sectionInputGroupJoinSchema = {
  name: 'section_input_group_join',
  createStatement: `CREATE TABLE IF NOT EXISTS section_input_group_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_input_group_id UUID NOT NULL,
  input_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_section_input_group_join_section_input_group FOREIGN KEY (section_input_group_id) REFERENCES section_input_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_section_input_group_join_section_input FOREIGN KEY (input_id) REFERENCES inputs(id) ON DELETE CASCADE
);`
};