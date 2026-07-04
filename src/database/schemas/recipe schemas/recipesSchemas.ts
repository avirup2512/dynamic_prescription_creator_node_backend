export const recipeSchema = {
  name: 'recipes',
  createStatement: `CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  serving_size NUMERIC(10,2),
  serving_unit VARCHAR(50),
  preparation_time INTEGER,
  instructions TEXT,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};