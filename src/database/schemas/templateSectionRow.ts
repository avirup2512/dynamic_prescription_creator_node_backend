export const templateSectionRowSchema = {
  name: 'template_section_rows',
  createStatement: `CREATE TABLE IF NOT EXISTS template_section_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL,
  row_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_section_rows_section FOREIGN KEY (section_id) REFERENCES template_sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_section_rows_row FOREIGN KEY (row_id) REFERENCES template_rows(id) ON DELETE CASCADE
);`
};
