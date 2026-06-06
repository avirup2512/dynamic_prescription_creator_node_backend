export const sectionRowSchema = {
  name: 'section_rows',
  createStatement: `CREATE TABLE IF NOT EXISTS section_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL,
  row_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_section_row_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_section_row_row FOREIGN KEY (row_id) REFERENCES rows(id) ON DELETE CASCADE
);`
};
