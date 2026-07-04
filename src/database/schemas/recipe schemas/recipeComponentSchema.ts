export const recipeComponentSchema = {
    name: 'recipe_components',
    createStatement: `CREATE TABLE IF NOT EXISTS recipe_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  component_type VARCHAR(20) NOT NULL
    CHECK (component_type IN ('food', 'recipe')),

  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,

  child_recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,

  quantity NUMERIC(10,2) NOT NULL,

  unit VARCHAR(50) NOT NULL,

  display_order INTEGER NOT NULL DEFAULT 0,

  is_optional BOOLEAN NOT NULL DEFAULT FALSE,

  remarks VARCHAR(255),

  is_deleted SMALLINT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (
    (
      component_type = 'food'
      AND food_id IS NOT NULL
      AND child_recipe_id IS NULL
    )
    OR
    (
      component_type = 'recipe'
      AND child_recipe_id IS NOT NULL
      AND food_id IS NULL
    )
  )
);`
};