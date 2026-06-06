export const templateSchema = {
  name: 'templates',
  createStatement: `CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);`
};
