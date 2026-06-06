export const quantityOptionSchema = {
  name: 'quantity_options',
  createStatement: `CREATE TABLE IF NOT EXISTS quantity_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity_id UUID NOT NULL,
  value VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_quantity_options_quantity FOREIGN KEY (quantity_id) REFERENCES quantities(id) ON DELETE CASCADE
);`
};
