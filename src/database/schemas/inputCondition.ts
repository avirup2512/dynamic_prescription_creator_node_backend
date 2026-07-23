export const inputConditionSchema = {
    name: 'input_conditions',
    createStatement: `CREATE TABLE IF NOT EXISTS input_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};
