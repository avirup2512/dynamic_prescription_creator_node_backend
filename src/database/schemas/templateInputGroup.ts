export const templateInputGroupSchema = {
  name: 'template_input_groups',
  createStatement: `CREATE TABLE IF NOT EXISTS template_input_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'INPUT GROUP', 
  template_column_id UUID NOT NULL,
  input_group_order INT NOT NULL,
  is_visible SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_groups_template FOREIGN KEY (template_column_id) REFERENCES template_columns(id) ON DELETE CASCADE
);`
};