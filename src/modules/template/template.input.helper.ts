import { InputEntityService } from "../inputEntity/inputEntity.service";
import { TEMPLATE_OPERATION } from "./type";
export class TemplateInputHelper {
    async getConditionIdFromName(client: any, conditionName: string) {
        if (!conditionName) return null;
        const result = await client.query(
            `
          SELECT id
          FROM input_conditions
          WHERE name = $1
          `,
            [conditionName]
        );

        return result.rows[0]?.id || null;
    }
    public async saveInput(
        client: any,
        inputGroupId: string,
        UpdatedInputs: any[]
    ) {
        const results = [];
        for (const change of UpdatedInputs) {

            switch (change.type) {

                case TEMPLATE_OPERATION.INPUT_ADD:
                    results.push(await this.upsertInput(
                        client,
                        inputGroupId ? inputGroupId : change?.template_input_group_id,
                        change.input
                    ));
                    break;

                case TEMPLATE_OPERATION.INPUT_UPDATE:
                    results.push(await this.upsertInput(
                        client,
                        inputGroupId ? inputGroupId : change?.template_input_group_id,
                        change.input
                    ))
                    break;

                case TEMPLATE_OPERATION.INPUT_REMOVE:
                    results.push(await this.removeInput(
                        client,
                        change.template_input_id
                    ));
                    break;

                default:
                    throw new Error(
                        `Unsupported Section Operation : ${change.type}`
                    );
            }
        }
        return results;
    }
    private async removeInput(
        client: any,
        templateInputId: string
    ) {

        await client.query(
            `
        DELETE FROM template_inputs
        WHERE id = $1
        `,
            [
                templateInputId
            ]
        );
    }
    private async upsertInput(
        client: any,
        templateInputGroupId: string,
        input: any
    ) {
        let inputTypeId = input.input_type_id || input?.type_id;

        if (!inputTypeId && (input.input_type_name || input.type_name)) {
            inputTypeId = await new InputEntityService().getInputTypeUUIDByName(
                (input.input_type_name || input.type_name) ?? ""
            );
        }
        const inputResult = await client.query(
            `INSERT INTO template_inputs
            (
                id,
                type_id,
                label,
                show_label,
                show_quantity,
                quantity_id,
                is_bold,
                font_size,
                extra_note,
                input_order,
                is_deleted,
                input_entity_id,
                is_visible,
                is_quantity_type_single
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
                type_id         = EXCLUDED.type_id,
                label           = EXCLUDED.label,
                show_label      = EXCLUDED.show_label,
                show_quantity   = EXCLUDED.show_quantity,
                quantity_id     = EXCLUDED.quantity_id,
                is_bold         = EXCLUDED.is_bold,
                font_size       = EXCLUDED.font_size,
                extra_note      = EXCLUDED.extra_note,
                input_order     = EXCLUDED.input_order,
                is_deleted      = EXCLUDED.is_deleted,
                input_entity_id = EXCLUDED.input_entity_id,
                is_visible      = EXCLUDED.is_visible,
                is_quantity_type_single = EXCLUDED.is_quantity_type_single,
                updated_at      = NOW()
                RETURNING id
                    `,
            [
                input.template_input_id,
                inputTypeId,
                (input.input_name || input?.name) ?? "",
                input.show_label ? 1 : 0,
                input.show_quantity ? 1 : 0,
                input.quantity_id ?? null,
                input.is_bold ?? 0,
                input.font_size ?? 14,
                input.extra_note ?? 0,
                input.input_order ?? 0,
                input.is_deleted ?? 0,
                input.input_entity_id ?? null,
                input.is_visible ?? 1,
                input.template_quantity_type_single ?? 1,
            ]
        );
        await client.query(
            `
                INSERT INTO template_input_group_join
                (
                    template_input_group_id,
                    template_input_id
                )
                VALUES
                (
                    $1,
                    $2
                )
                ON CONFLICT
                (
                    template_input_group_id,
                    template_input_id
                )
                DO NOTHING
                RETURNING id
                `,
            [
                templateInputGroupId,
                input.template_input_id,
            ]
        );
        const inputId = input.template_input_id;
        await this.syncInputStyle(client, inputId, input);
        if (input?.input_type_name === "INPUT_TYPE_2" || input?.type_name === "INPUT_TYPE_2") {
            await this.syncDropdownOption(client, inputId, input);
        }
        await this.syncRecipe(client, inputId, input);
        await this.syncFood(client, inputId, input);
        await this.syncInputValue(client, inputId, input);
        await this.syncQuantityValue(client, inputId, input);
        await this.syncQuantityValueOption(client, inputId, input);
        await this.syncQuantityId(client, inputId, input);
        await this.syncExtraNote(client, inputId, input);
        await this.syncInputCondition(client, inputId, input);
        return { template_input_id: inputResult.rows[0].id };
    }
    private async syncInputStyle(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `
        INSERT INTO template_input_styles
        (
            template_input_id,
    
            font_family,
            font_size,
            font_weight,
            font_style,
            text_decoration,
    
            text_color,
            background_color,
    
            text_align,
    
            line_height,
            letter_spacing,
    
            padding_top,
            padding_right,
            padding_bottom,
            padding_left,
    
            margin_top,
            margin_right,
            margin_bottom,
            margin_left,
    
            border_width,
            border_color,
            border_radius,
    
            width,
            height,
    
            updated_at
        )
        VALUES
        (
            $1,
    
            $2,$3,$4,$5,$6,
    
            $7,$8,
    
            $9,
    
            $10,$11,
    
            $12,$13,$14,$15,
    
            $16,$17,$18,$19,
    
            $20,$21,$22,
    
            $23,$24,
    
            NOW()
        )
        ON CONFLICT (template_input_id)
        DO UPDATE SET
    
            font_family = EXCLUDED.font_family,
            font_size = EXCLUDED.font_size,
            font_weight = EXCLUDED.font_weight,
            font_style = EXCLUDED.font_style,
            text_decoration = EXCLUDED.text_decoration,
    
            text_color = EXCLUDED.text_color,
            background_color = EXCLUDED.background_color,
    
            text_align = EXCLUDED.text_align,
    
            line_height = EXCLUDED.line_height,
            letter_spacing = EXCLUDED.letter_spacing,
    
            padding_top = EXCLUDED.padding_top,
            padding_right = EXCLUDED.padding_right,
            padding_bottom = EXCLUDED.padding_bottom,
            padding_left = EXCLUDED.padding_left,
    
            margin_top = EXCLUDED.margin_top,
            margin_right = EXCLUDED.margin_right,
            margin_bottom = EXCLUDED.margin_bottom,
            margin_left = EXCLUDED.margin_left,
    
            border_width = EXCLUDED.border_width,
            border_color = EXCLUDED.border_color,
            border_radius = EXCLUDED.border_radius,
    
            width = EXCLUDED.width,
            height = EXCLUDED.height,
    
            updated_at = NOW()
        `,
            [
                templateInputId,

                input.font_family ?? "Arial",
                input.font_size ?? 14,
                input.font_weight ?? 400,
                input.font_style ?? 0,
                input.text_decoration ?? 0,

                input.text_color ?? "#000000",
                input.background_color ?? null,

                input.text_align ?? 0,

                input.line_height ?? 1.2,
                input.letter_spacing ?? 0,

                input.padding_top ?? 0,
                input.padding_right ?? 0,
                input.padding_bottom ?? 0,
                input.padding_left ?? 0,

                input.margin_top ?? 0,
                input.margin_right ?? 0,
                input.margin_bottom ?? 0,
                input.margin_left ?? 0,

                input.border_width ?? 0,
                input.border_color ?? null,
                input.border_radius ?? 0,

                input.width ?? null,
                input.height ?? null
            ]
        );
    }
    private async syncDropdownOption(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_input_dropdown_options
         WHERE template_input_id = $1`,
            [templateInputId]
        );

        if (!input.dropdown_option_id) return;

        await client.query(
            `
        INSERT INTO template_input_dropdown_options
        (
          template_input_id,
          dropdown_option_id
        )
        VALUES ($1,$2)
        `,
            [
                templateInputId,
                input.dropdown_option_id,
            ]
        );
    }
    private async syncRecipe(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_recipe_join
         WHERE template_input_id = $1`,
            [templateInputId]
        );

        if (!input.recipe_id) return;

        await client.query(
            `
        INSERT INTO template_recipe_join
        (
          template_input_id,
          recipe_id
        )
        VALUES($1,$2)
        `,
            [
                templateInputId,
                input.recipe_id,
            ]
        );
    }
    private async syncFood(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_food_join
         WHERE template_input_id = $1`,
            [templateInputId]
        );

        if (!input.food_id) return;

        await client.query(
            `
        INSERT INTO template_food_join
        (
          template_input_id,
          food_id
        )
        VALUES($1,$2)
        `,
            [
                templateInputId,
                input.food_id,
            ]
        );
    }
    private async syncInputValue(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        const value = input.template_input_value || input?.value;
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return;
        }

        await client.query(
            `
        INSERT INTO template_inputs_value
        (
          template_input_id,
          value
        )
        VALUES($1,$2)
        ON CONFLICT (template_input_id)
        DO UPDATE SET value = EXCLUDED.value
        `,
            [
                templateInputId,
                value,
            ]
        );
    }
    private async syncQuantityValue(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_inputs_quantity_value
         WHERE template_input_id = $1`,
            [templateInputId]
        );

        if (
            input.template_quantity_valueFrom === undefined ||
            input.template_quantity_valueFrom === null ||
            input.template_quantity_valueFrom === ""
        ) {
            return;
        }

        await client.query(
            `
        INSERT INTO template_inputs_quantity_value
        (
          template_input_id,
          valueFrom,
          valueTo
        )
        VALUES($1,$2,$3)
        `,
            [
                templateInputId,
                input.template_quantity_valueFrom,
                input.template_quantity_valueTo ?? input.template_quantity_valueFrom,
            ]
        );
    }

    private async syncQuantityValueOption(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_input_quantity_options
         WHERE template_input_id = $1`,
            [templateInputId]
        );
        if (
            input.template_quantity_optionId === undefined ||
            input.template_quantity_optionId === null ||
            input.template_quantity_optionId === ""
        ) {
            return;
        }
        await client.query(
            `
        INSERT INTO template_input_quantity_options
        (
          template_input_id,
          quantity_option_id
        )
        VALUES($1,$2)
        `,
            [
                templateInputId,
                input.template_quantity_optionId,
            ]
        );
    }

    private async syncQuantityId(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_inputs_quantity
         WHERE template_input_id = $1`,
            [templateInputId]
        );
        if (
            input.template_input_quantity_id === undefined ||
            input.template_input_quantity_id === null ||
            input.template_input_quantity_id === ""
        ) {
            return;
        }
        await client.query(
            `
        INSERT INTO template_inputs_quantity
        (
          template_input_id,
          quantity_id
        )
        VALUES($1,$2)
        `,
            [
                templateInputId,
                input.template_input_quantity_id,
            ]
        );
    }

    private async syncExtraNote(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {
        await client.query(
            `DELETE FROM template_input_extranotes
         WHERE template_input_id = $1`,
            [templateInputId]
        );

        if (
            input.template_input_extranotes === undefined ||
            input.template_input_extranotes === null ||
            input.template_input_extranotes === ""
        ) {
            return;
        }

        await client.query(
            `
        INSERT INTO template_input_extranotes
        (
          template_input_id,
          note,
          is_deleted
        )
        VALUES($1,$2,0)
        `,
            [
                templateInputId,
                input.template_input_extranotes,
            ]
        );
    }
    private async syncInputCondition(
        client: any,
        templateInputId: string,
        input: Partial<any>
    ) {

        if (!input.previous_related_input_id || !input.condition_with_previous_input_name) return;

        const condition_id = await this.getConditionIdFromName(client, input.condition_with_previous_input_name);

        await client.query(
            `
        INSERT INTO template_inputs_condition
        (
          input_id,
          previous_input_id,
          condition_id
        )
        VALUES($1,$2,$3)
        ON CONFLICT (input_id, previous_input_id)
        DO UPDATE SET condition_id = EXCLUDED.condition_id
        RETURNING id
        `,
            [
                templateInputId,
                input.previous_related_input_id,
                condition_id,
            ]
        );
    }
}