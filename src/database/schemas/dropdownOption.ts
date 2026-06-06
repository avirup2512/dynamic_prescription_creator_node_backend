export const dropdownOptionSchema = {
  name: 'dropdown_options',
  createStatement: `CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
