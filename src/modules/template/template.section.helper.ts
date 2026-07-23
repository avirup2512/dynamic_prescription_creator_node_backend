import { TemplateRowHelper } from "./template.row.helper";
import { TEMPLATE_OPERATION } from "./type";
export class TemplateSectionHelper {
    public async saveSections(
        client: any,
        templateId: string,
        updatedSections: any[]
    ) {
        const results = [];
        for (const change of updatedSections) {

            switch (change.type) {

                case TEMPLATE_OPERATION.SECTION_ADD:
                    results.push(await this.insertSectionTree(
                        client,
                        templateId,
                        change.section,
                        change.sectionType
                    ));
                    break;

                case TEMPLATE_OPERATION.SECTION_UPDATE:
                    await this.updateSection(
                        client,
                        change.section,
                        change.sectionType
                    );
                    break;

                case TEMPLATE_OPERATION.SECTION_REMOVE:
                    await this.removeSection(
                        client,
                        change.template_section_id
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

    private async updateSection(
        client: any,
        section: any,
        sectionType: "header" | "body" | "footer"
    ) {
        await client.query(
            `
        UPDATE template_sections
        SET
            section_id=$2,
            section_order=$3,
            is_visible=$4,
            is_header=$5,
            is_body=$6,
            is_footer=$7
        WHERE id=$1
        `,
            [
                section.template_section_id,
                section.section_id,
                section.section_order,
                section.is_visible ?? 1,
                sectionType === "header" ? 1 : 0,
                sectionType === "body" ? 1 : 0,
                sectionType === "footer" ? 1 : 0,
            ]
        );
    }
    private async removeSection(
        client: any,
        sectionId: string
    ) {

        await client.query(
            `
        DELETE FROM template_sections
        WHERE id=$1
        `,
            [sectionId]
        );

    }

    private async insertSectionTree(
        client: any,
        templateId: string,
        section: any,
        sectionType: "header" | "body" | "footer"
    ) {

        const sectionResult = await client.query(
            `
        INSERT INTO template_sections
        (
            id,
            template_id,
            section_id,
            is_header,
            is_body,
            is_footer,
            section_order,
            is_visible
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8
        )
            RETURNING id
        `,
            [
                section.template_section_id,
                templateId,
                null,
                sectionType === "header" ? 1 : 0,
                sectionType === "body" ? 1 : 0,
                sectionType === "footer" ? 1 : 0,
                section.section_order,
                section.is_visible ?? 1
            ]
        );

        section.rows.forEach((row: any, i: number) => {
            section.rows[i] = { type: TEMPLATE_OPERATION.ROW_ADD, row };
        });
        const rowResult = await new TemplateRowHelper().saveRows(client,
            section.template_section_id,
            section.rows ?? []);
        return { template_section_id: sectionResult.rows[0].id, rowResult };
    }
}