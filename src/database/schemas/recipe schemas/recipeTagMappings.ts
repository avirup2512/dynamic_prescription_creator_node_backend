export const recipeTagJoinSchema = {
    name: 'recipe_tags_join',
    createStatement: `CREATE TABLE IF NOT EXISTS recipe_tags_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, tag_id)
);`
};