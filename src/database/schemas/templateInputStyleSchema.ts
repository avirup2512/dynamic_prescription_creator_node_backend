export const templateInputStyleSchema = {
    name: "template_input_styles",
    createStatement: `
CREATE TABLE IF NOT EXISTS template_input_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    template_input_id UUID NOT NULL UNIQUE,

    font_family VARCHAR(100) DEFAULT 'Arial',
    font_size INTEGER NOT NULL DEFAULT 14,

    font_weight SMALLINT NOT NULL DEFAULT 400,
    font_style SMALLINT NOT NULL DEFAULT 0,
    text_decoration SMALLINT NOT NULL DEFAULT 0,

    text_color VARCHAR(20) DEFAULT '#000000',
    background_color VARCHAR(20),

    text_align SMALLINT NOT NULL DEFAULT 0,

    line_height NUMERIC(4,2) DEFAULT 1.2,
    letter_spacing NUMERIC(5,2) DEFAULT 0,

    padding_top INTEGER DEFAULT 0,
    padding_right INTEGER DEFAULT 0,
    padding_bottom INTEGER DEFAULT 0,
    padding_left INTEGER DEFAULT 0,

    margin_top INTEGER DEFAULT 0,
    margin_right INTEGER DEFAULT 0,
    margin_bottom INTEGER DEFAULT 0,
    margin_left INTEGER DEFAULT 0,

    border_width INTEGER DEFAULT 0,
    border_color VARCHAR(20),
    border_radius INTEGER DEFAULT 0,

    width INTEGER,
    height INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_template_input_styles
        FOREIGN KEY (template_input_id)
        REFERENCES template_inputs(id)
        ON DELETE CASCADE
);
`
};