export const templateRecipeJoinSchema = {
    name: 'template_recipe_join',
    createStatement: `CREATE TABLE IF NOT EXISTS template_recipe_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_recipe_join_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_recipe_join_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT
);`
};
