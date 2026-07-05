export const templateInputExtranoteSchema = {
  name: 'template_input_extranotes',
  createStatement: `CREATE TABLE IF NOT EXISTS template_input_extranotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_input_id UUID NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_template_input_extranotes UNIQUE (template_input_id),
  CONSTRAINT fk_template_input_extranote_template_input FOREIGN KEY (template_input_id) REFERENCES template_inputs(id) ON DELETE CASCADE
);`
};
