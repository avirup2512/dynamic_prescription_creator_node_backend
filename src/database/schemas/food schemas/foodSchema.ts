export const foodSchema = {
    name: 'foods',
    createStatement: `CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_code VARCHAR(50) NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES food_categories(id),
  name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};