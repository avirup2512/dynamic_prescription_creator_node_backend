export const quantitySchema = {
  name: 'quantity',
  createStatement: `CREATE TABLE IF NOT EXISTS quantities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  user_id UUID,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_quantity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);`
};
