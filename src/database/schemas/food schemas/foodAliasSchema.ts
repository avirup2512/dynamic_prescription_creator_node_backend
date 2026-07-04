export const foodAliasSchema = {
    name: 'food_aliases',
    createStatement: `CREATE TABLE IF NOT EXISTS food_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  alias VARCHAR(255) NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(food_id, alias)
);`
};