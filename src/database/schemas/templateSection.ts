export const templateSectionSchema = {
  name: 'template_sections',
  createStatement: `CREATE TABLE IF NOT EXISTS template_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL,
  section_id UUID NOT NULL,
  is_header SMALLINT NOT NULL DEFAULT 0,
  is_body SMALLINT NOT NULL DEFAULT 0,
  is_footer SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_template_section_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);`
};
