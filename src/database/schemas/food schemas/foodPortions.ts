export const foodPortionSchema = {
    name: 'food_portions',
    createStatement: `CREATE TABLE IF NOT EXISTS food_portions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    portion_name VARCHAR(100) NOT NULL,
    grams NUMERIC(10, 2) NOT NULL,
    is_deleted SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
};