export const foodNutrientSchema = {
    name: 'food_nutrients',
    createStatement: `CREATE TABLE IF NOT EXISTS food_nutrients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID NOT NULL UNIQUE REFERENCES foods(id) ON DELETE CASCADE,

  energy NUMERIC(10,2),
  protein NUMERIC(10,2),
  fat NUMERIC(10,2),
  carbohydrate NUMERIC(10,2),
  fiber NUMERIC(10,2),

  calcium NUMERIC(10,2),
  iron NUMERIC(10,2),
  magnesium NUMERIC(10,2),
  phosphorus NUMERIC(10,2),
  potassium NUMERIC(10,2),
  sodium NUMERIC(10,2),
  zinc NUMERIC(10,2),

  vitamin_a NUMERIC(10,2),
  vitamin_b1 NUMERIC(10,2),
  vitamin_b2 NUMERIC(10,2),
  vitamin_b3 NUMERIC(10,2),
  vitamin_b6 NUMERIC(10,2),
  vitamin_b12 NUMERIC(10,2),
  vitamin_c NUMERIC(10,2),
  vitamin_d NUMERIC(10,2),
  vitamin_e NUMERIC(10,2),
  folate NUMERIC(10,2),

  cholesterol NUMERIC(10,2),
  saturated_fat NUMERIC(10,2),
  monounsaturated_fat NUMERIC(10,2),
  polyunsaturated_fat NUMERIC(10,2),

  moisture NUMERIC(10,2),
  ash NUMERIC(10,2),

  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};