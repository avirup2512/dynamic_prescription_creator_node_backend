export const templateFoodJoinSchema = {
    name: 'template_food_join',
    createStatement: `CREATE TABLE IF NOT EXISTS template_food_join (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  food_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_food_join_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_food_join_food FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
);`
};