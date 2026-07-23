import { TemplateInputGroupHelper } from "./template.input.group.helper";
import { TemplateInputHelper } from "./template.input.helper";
import { TEMPLATE_OPERATION } from "./type";
export class TemplateColumnHelper {
    public async saveColumns(
        client: any,
        rowId: string,
        updatedColumns: any[]
    ) {
        const results = [];
        for (const change of updatedColumns) {

            switch (change.type) {

                case TEMPLATE_OPERATION.COLUMN_ADD:
                    results.push(await this.insertColumnTree(
                        client,
                        rowId,
                        change.column
                    ));
                    break;

                case TEMPLATE_OPERATION.COLUMN_UPDATE:
                    await this.updateColumn(
                        client,
                        change.column,
                    );
                    break;

                case TEMPLATE_OPERATION.COLUMN_REMOVE:
                    await this.removeColumn(
                        client,
                        change.template_column_id
                    );
                    break;

                default:
                    throw new Error(
                        `Unsupported Section Operation : ${change.type}`
                    );
            }
        }
        return results;
    }
    private async updateColumn(
        client: any,
        column: any
    ) {

        await client.query(
            `
        UPDATE template_columns
        SET
            width = $2,
            column_order = $3
        WHERE id = $1
        `,
            [
                column.template_column_id,
                column.width,
                column.column_order
            ]
        );

    }
    private async removeColumn(
        client: any,
        templateColumnId: string
    ) {

        await client.query(
            `
        DELETE FROM template_columns
        WHERE id = $1
        `,
            [
                templateColumnId
            ]
        );

    }
    private async insertColumnTree(
        client: any,
        templateRowId: string,
        column: any
    ) {

        const columnResult = await client.query(
            `
        INSERT INTO template_columns
        (
            id,
            name,
            width,
            column_order
        )
        VALUES
        (
            $1,$2,$3,$4
        )
            RETURNING id
        `,
            [
                column.template_column_id,
                column.name ?? "Untitled Column",
                column.width ?? 12,
                column.column_order
            ]
        );
        await client.query(
            `
        INSERT INTO template_rows_columns
        (
            row_id,
            column_id
        )
        VALUES
        (
            $1,$2
        )
        ON CONFLICT (row_id,column_id)
        DO NOTHING
      `,
            [
                templateRowId,
                column.template_column_id,
            ]
        );
        column.inputGroup.forEach((inputGroup: any, i: number) => {
            column.inputGroup[i] = { type: TEMPLATE_OPERATION.GROUP_ADD, inputGroup };
        });
        const inputGroupResult = await new TemplateInputGroupHelper().saveInputGroup(
            client,
            column.template_column_id,
            column.inputGroup ?? []
        );
        return { template_column_id: columnResult.rows[0].id, inputGroupResult };
    }
}