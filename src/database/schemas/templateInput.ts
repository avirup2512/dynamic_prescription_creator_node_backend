export const templateInputSchema = {
  name: 'template_inputs',
  createStatement: `CREATE TABLE IF NOT EXISTS template_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_id UUID NOT NULL,
  label VARCHAR(255) NOT NULL,
  show_label SMALLINT NOT NULL DEFAULT 1,
  show_quantity SMALLINT NOT NULL DEFAULT 0,
  is_quantity_type_single SMALLINT NOT NULL DEFAULT 1,
  is_bold SMALLINT NOT NULL DEFAULT 0,
  font_size INTEGER NOT NULL DEFAULT 14,
  extra_note SMALLINT NOT NULL DEFAULT 0,
  input_order INTEGER NOT NULL DEFAULT 0,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  is_visible SMALLINT NOT NULL DEFAULT 1,
  input_entity_id UUID,
  quantity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_template_input_type FOREIGN KEY (type_id) REFERENCES input_types(id) ON DELETE RESTRICT,
  CONSTRAINT fk_input_entities FOREIGN KEY (input_entity_id) REFERENCES input_entities(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quantities FOREIGN KEY (quantity_id) REFERENCES quantities(id) ON DELETE RESTRICT
);`
};
