import { TemplateInputHelper } from "./template.input.helper";
import { TEMPLATE_OPERATION } from "./type";
export class TemplateInputGroupHelper {
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
    public async saveInputGroup(
        client: any,
        columnId: string,
        updatedInputGroups: any[]
    ) {
        const results = [];
        for (const change of updatedInputGroups) {

            switch (change.type) {

                case TEMPLATE_OPERATION.GROUP_ADD:
                    results.push(await this.insertGroupTree(
                        client,
                        columnId ? columnId : change?.template_column_id,
                        change.inputGroup
                    ));
                    break;

                case TEMPLATE_OPERATION.GROUP_UPDATE:
                    results.push(await this.insertGroupTree(
                        client,
                        columnId ? columnId : change?.template_column_id,
                        change.inputGroup
                    ));
                    break;

                case TEMPLATE_OPERATION.GROUP_REMOVE:
                    results.push(await this.removeInputGroup(
                        client,
                        change.template_input_group_id
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
    private async removeInputGroup(
        client: any,
        templateInputGroupId: string
    ) {

        await client.query(
            `
        DELETE FROM template_input_groups
        WHERE id = $1
        `,
            [
                templateInputGroupId
            ]
        );

    }
    private async insertGroupTree(
        client: any,
        templateColumnId: string,
        group: any
    ) {
        const inputGroupResult = await client.query(
            `
            INSERT INTO template_input_groups
            (
                id,
                name,
                template_column_id,
                input_group_order,
                is_visible
            )
            VALUES
            (
                $1,$2,$3,$4,$5
            )
                ON CONFLICT (id)
                DO UPDATE SET
                name = EXCLUDED.name,
                input_group_order = EXCLUDED.input_group_order,
                is_visible = EXCLUDED.is_visible
                RETURNING id
            `,
            [
                group.template_input_group_id,
                group.input_group_name,
                templateColumnId,
                group.input_group_order,
                group.is_visible ?? 1
            ]
        );
        await client.query(
            `
            INSERT INTO template_column_input_group_join
            (
                column_id,
                template_input_group_id
            )
            VALUES
            (
                $1,$2
            )
            ON CONFLICT (column_id, template_input_group_id)
            DO NOTHING
        `,
            [
                templateColumnId,
                group.template_input_group_id,
            ]
        );
        group.inputs.forEach((input: any, i: number) => {
            group.inputs[i] = { type: TEMPLATE_OPERATION.INPUT_ADD, input };
        });
        const inputResult = await new TemplateInputHelper().saveInput(
            client,
            group.template_input_group_id,
            group.inputs ?? []
        );
        await this.syncInputGroupCondition(client, inputGroupResult.rows[0].id, group);
        return { template_input_group_id: inputGroupResult.rows[0].id, inputResult };
    }
    private async syncInputGroupCondition(
        client: any,
        inputGroupId: string,
        inputGroup: Partial<any>
    ) {
        if (!inputGroup.previous_related_input_group_id || !inputGroup.condition_with_previous_input_group_name) return;
        const condition_id = await this.getConditionIdFromName(client, inputGroup.condition_with_previous_input_group_name);
        await client.query(
            `
        INSERT INTO template_inputs_group_conditions
        (
          input_group_id,
          previous_input_group_id,
          condition_id
        )
        VALUES($1,$2,$3)
        ON CONFLICT (input_group_id, previous_input_group_id)
        DO UPDATE SET condition_id = EXCLUDED.condition_id
        RETURNING id
        `,
            [
                inputGroupId,
                inputGroup.previous_related_input_group_id,
                condition_id,
            ]
        );
    }
}

