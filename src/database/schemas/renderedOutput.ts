export const renderedOutputSchema = {
  name: 'rendered_outputs',
  createStatement: `CREATE TABLE IF NOT EXISTS rendered_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_rendered_outputs_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);`
};
