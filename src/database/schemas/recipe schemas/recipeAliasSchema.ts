export const recipeAliasSchema = {
    name: 'recipe_aliases',
    createStatement: `CREATE TABLE IF NOT EXISTS recipe_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  alias VARCHAR(255) NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, alias)
);`
};