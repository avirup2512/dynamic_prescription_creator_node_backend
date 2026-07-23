import { TemplateColumnHelper } from "./template.column.helper";
import { TEMPLATE_OPERATION } from "./type";
export class TemplateRowHelper {
    public async saveRows(
        client: any,
        sectionId: string,
        updatedRows: any[]
    ) {
        const results = [];
        for (const change of updatedRows) {

            switch (change.type) {

                case TEMPLATE_OPERATION.ROW_ADD:
                    results.push(await this.insertRowTree(
                        client,
                        sectionId ? sectionId : change?.template_section_id,
                        change.row
                    ));
                    break;

                case TEMPLATE_OPERATION.ROW_UPDATE:
                    results.push(await this.updateRow(
                        client,
                        change.row,
                    ));
                    break;

                case TEMPLATE_OPERATION.ROW_REMOVE:
                    results.push(await this.removeRow(
                        client,
                        change.template_row_id
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
    private async updateRow(
        client: any,
        row: any
    ) {

        await client.query(
            `
        UPDATE template_rows
        SET
            row_order = $2,
            is_visible = $3
        WHERE id = $1
        `,
            [
                row.template_row_id,
                row.row_order,
                row.is_visible ?? 1
            ]
        );

    }
    private async removeRow(
        client: any,
        templateRowId: string
    ) {

        await client.query(
            `
        DELETE FROM template_rows
        WHERE id = $1
        `,
            [
                templateRowId
            ]
        );

    }
    private async insertRowTree(
        client: any,
        templateSectionId: string,
        row: any
    ) {
        const rowResult = await client.query(
            `
        INSERT INTO template_rows
        (
            id,
            name,
            row_order,
            is_visible
        )
        VALUES
        (
            $1,$2,$3,$4
        )
            RETURNING id
        `,
            [
                row.template_row_id,
                row.name ?? "Uptitled Row",
                row.row_order,
                row.is_visible ?? 1
            ]
        );
        await client.query(
            `
                INSERT INTO template_section_rows
                (
                    section_id,
                    row_id,
                    row_order
                )
                VALUES
                (
                    $1,$2,$3
                )
                ON CONFLICT (section_id,row_id)
                DO NOTHING
            `,
            [
                templateSectionId,
                row.template_row_id,
                row.row_order ?? 1
            ]
        );
        row.columns.forEach((col: any, i: number) => {
            row.columns[i] = { type: TEMPLATE_OPERATION.COLUMN_ADD, column: col };
        });
        const columnResult = await new TemplateColumnHelper().saveColumns(
            client,
            row.template_row_id,
            row.columns ?? []
        );
        return { template_row_id: rowResult.rows[0].id, columnResult };
    }
}