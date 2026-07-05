import { BaseModel } from "../common/base.model";
import { Section } from "../../types/entities";
import { pool, query } from "../../database/client";
import { InputEntityService } from "../inputEntity/inputEntity.service";
import { SectionInput, UUID, UpsertContext, RowInput, ColumnInput, InputGroupInput, InputInput } from "./section-types";

export class SectionModel extends BaseModel<Section> {
  inputEntityService: InputEntityService;
  constructor() {
    super(
      "sections",
      "id",
      ['name', 'created_by', 'is_deleted'],
      ['name'],
    );
    this.inputEntityService = new InputEntityService();
  }
  async upsertSection(data: SectionInput, userId: UUID) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ctx: UpsertContext = { client, userId, inputTypeUuidCache: new Map() };

      const { rows } = await ctx.client.query(
        `INSERT INTO sections (id, name, created_by, is_deleted)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           is_deleted = EXCLUDED.is_deleted,
           updated_at = now()
         WHERE sections.created_by = $3
         RETURNING *`,
        [data.id, data.name ?? '', userId, data.is_deleted ?? 0],
      );

      const section = rows[0];
      if (!section) {
        // Either this id belongs to another user's section, or the WHERE
        // filtered out the update. Either way, don't silently no-op.
        throw new Error(`Section ${data.id} not found or not owned by user ${userId}`);
      }

      await this.syncRows(ctx, section.id, data.rows ?? []);

      await client.query('COMMIT');
      return section;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[SectionService.upsertSection]', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /* ---------------- Rows ---------------- */

  private getColumns(row: RowInput): ColumnInput[] {
    return Array.isArray(row.columns) ? row.columns : Array.isArray(row.column) ? row.column : [];
  }

  private async syncRows(ctx: UpsertContext, sectionId: UUID, incomingRows: RowInput[]) {
    const { rows: existing } = await ctx.client.query(
      `SELECT row_id FROM section_rows WHERE section_id = $1`,
      [sectionId],
    );
    const existingIds = new Set<UUID>(existing.map((r: any) => r.row_id));
    const incomingIds = new Set<UUID>();

    for (const row of incomingRows) {
      incomingIds.add(row.id);
      await this.upsertRow(ctx, sectionId, row, existingIds.has(row.id));
    }

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    for (const rowId of toDelete) await this.deleteRow(ctx, rowId);
  }

  private async upsertRow(ctx: UpsertContext, sectionId: UUID, row: RowInput, isExisting: boolean) {
    const { rows } = await ctx.client.query(
      `INSERT INTO rows (id, name, row_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         row_order = EXCLUDED.row_order,
         updated_at = now()
       RETURNING *`,
      [row.id, row.name ?? '', row.row_order ?? 0],
    );
    const upserted = rows[0];

    if (!isExisting) {
      // Junction table has no unique constraint to ON CONFLICT against, so
      // only link it the first time this row shows up under this section.
      await ctx.client.query(`INSERT INTO section_rows (section_id, row_id) VALUES ($1, $2)`, [
        sectionId,
        upserted.id,
      ]);
    }

    await this.syncColumns(ctx, upserted.id, this.getColumns(row));
    return upserted;
  }

  private async deleteRow(ctx: UpsertContext, rowId: UUID) {
    const { rows: cols } = await ctx.client.query(
      `SELECT column_id FROM rows_columns WHERE row_id = $1`,
      [rowId],
    );
    for (const { column_id } of cols) await this.deleteColumn(ctx, column_id);

    await ctx.client.query(`DELETE FROM section_rows WHERE row_id = $1`, [rowId]);
    await ctx.client.query(`DELETE FROM rows WHERE id = $1`, [rowId]);
  }

  /* ---------------- Columns ---------------- */

  private async syncColumns(ctx: UpsertContext, rowId: UUID, incomingColumns: ColumnInput[]) {
    const { rows: existing } = await ctx.client.query(
      `SELECT column_id FROM rows_columns WHERE row_id = $1`,
      [rowId],
    );
    const existingIds = new Set<UUID>(existing.map((c: any) => c.column_id));
    const incomingIds = new Set<UUID>();

    for (const col of incomingColumns) {
      incomingIds.add(col.id);
      await this.upsertColumn(ctx, rowId, col, existingIds.has(col.id));
    }

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    for (const columnId of toDelete) await this.deleteColumn(ctx, columnId);
  }

  private async upsertColumn(ctx: UpsertContext, rowId: UUID, col: ColumnInput, isExisting: boolean) {
    const { rows } = await ctx.client.query(
      `INSERT INTO columns (id, name, width, column_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         width = EXCLUDED.width,
         column_order = EXCLUDED.column_order,
         updated_at = now()
       RETURNING *`,
      [col.id, col.name ?? '', Math.ceil(col.width ?? 100), col.column_order ?? 0],
    );
    const upserted = rows[0];

    if (!isExisting) {
      await ctx.client.query(`INSERT INTO rows_columns (row_id, column_id) VALUES ($1, $2)`, [
        rowId,
        upserted.id,
      ]);
    }

    await this.syncInputGroups(ctx, upserted.id, col.inputGroup ?? []);
    return upserted;
  }

  private async deleteColumn(ctx: UpsertContext, columnId: UUID) {
    const { rows: groups } = await ctx.client.query(
      `SELECT section_input_group_id FROM column_inputs_group_join WHERE column_id = $1`,
      [columnId],
    );
    for (const { section_input_group_id } of groups) {
      await this.deleteInputGroup(ctx, section_input_group_id);
    }

    await ctx.client.query(`DELETE FROM rows_columns WHERE column_id = $1`, [columnId]);
    await ctx.client.query(`DELETE FROM columns WHERE id = $1`, [columnId]);
  }

  /* ---------------- Input Groups ---------------- */

  private async syncInputGroups(ctx: UpsertContext, columnId: UUID, incomingGroups: InputGroupInput[]) {
    const { rows: existing } = await ctx.client.query(
      `SELECT section_input_group_id FROM column_inputs_group_join WHERE column_id = $1`,
      [columnId],
    );
    const existingIds = new Set<UUID>(existing.map((g: any) => g.section_input_group_id));
    const incomingIds = new Set<UUID>();

    for (const group of incomingGroups) {
      incomingIds.add(group.id);
      await this.upsertInputGroup(ctx, columnId, group, existingIds.has(group.id));
    }

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    for (const groupId of toDelete) await this.deleteInputGroup(ctx, groupId);
  }

  private async upsertInputGroup(
    ctx: UpsertContext,
    columnId: UUID,
    group: InputGroupInput,
    isExisting: boolean,
  ) {
    const { rows } = await ctx.client.query(
      `INSERT INTO section_input_groups (id, column_id, input_group_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         input_group_order = EXCLUDED.input_group_order,
         updated_at = now()
       RETURNING *`,
      [group.id, columnId, group.input_group_order ?? 0],
    );
    const upserted = rows[0];

    if (!isExisting) {
      await ctx.client.query(
        `INSERT INTO column_inputs_group_join (column_id, section_input_group_id) VALUES ($1, $2)`,
        [columnId, upserted.id],
      );
    }

    await this.syncInputs(ctx, upserted.id, group.inputs ?? []);
    return upserted;
  }

  private async deleteInputGroup(ctx: UpsertContext, groupId: UUID) {
    const { rows: joins } = await ctx.client.query(
      `SELECT input_id FROM section_input_group_join WHERE section_input_group_id = $1`,
      [groupId],
    );
    for (const { input_id } of joins) await this.deleteInput(ctx, input_id);

    await ctx.client.query(
      `DELETE FROM column_inputs_group_join WHERE section_input_group_id = $1`,
      [groupId],
    );
    await ctx.client.query(`DELETE FROM section_input_groups WHERE id = $1`, [groupId]);
  }

  /* ---------------- Inputs ---------------- */

  private async syncInputs(ctx: UpsertContext, groupId: UUID, incomingInputs: InputInput[]) {
    const { rows: existing } = await ctx.client.query(
      `SELECT input_id FROM section_input_group_join WHERE section_input_group_id = $1`,
      [groupId],
    );
    const existingIds = new Set<UUID>(existing.map((i: any) => i.input_id));
    const incomingIds = new Set<UUID>();

    for (const input of incomingInputs) {
      incomingIds.add(input.id);
      await this.upsertInput(ctx, groupId, input, existingIds.has(input.id));
    }

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    for (const inputId of toDelete) await this.deleteInput(ctx, inputId);
  }

  private async upsertInput(ctx: UpsertContext, groupId: UUID, input: InputInput, isExisting: boolean) {
    const typeUuid = await this.resolveInputTypeUuid(ctx, input.type);
    const { rows } = await ctx.client.query(
      `INSERT INTO inputs
         (id, type_id, label, input_entity_id, show_label, quantity_id, show_quantity,
          input_order, is_bold, font_size, extra_note, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         type_id = EXCLUDED.type_id,
         label = EXCLUDED.label,
         input_entity_id = EXCLUDED.input_entity_id,
         show_label = EXCLUDED.show_label,
         quantity_id = EXCLUDED.quantity_id,
         show_quantity = EXCLUDED.show_quantity,
         input_order = EXCLUDED.input_order,
         is_bold = EXCLUDED.is_bold,
         font_size = EXCLUDED.font_size,
         extra_note = EXCLUDED.extra_note,
         is_deleted = EXCLUDED.is_deleted,
         updated_at = now()
       RETURNING *`,
      [
        input.id,
        typeUuid,
        input.name ?? '',
        input.input_entity_id ?? null,
        input.show_label ? 1 : 0,
        input.quantity_id ?? null,
        input.show_quantity ? 1 : 0,
        input.input_order ?? 0,
        input.is_bold ? 1 : 0,
        input.font_size ?? 16,
        input.extra_note ?? 0,
        input.is_deleted ?? 0,
      ],
    );
    const upserted = rows[0];

    if (!isExisting) {
      await ctx.client.query(
        `INSERT INTO section_input_group_join (section_input_group_id, input_id) VALUES ($1, $2)`,
        [groupId, upserted.id],
      );
    }
    return upserted;
  }

  private async deleteInput(ctx: UpsertContext, inputId: UUID) {
    await ctx.client.query(`DELETE FROM section_input_group_join WHERE input_id = $1`, [inputId]);
    await ctx.client.query(`DELETE FROM inputs WHERE id = $1`, [inputId]);
  }

  /* ---------------- Input type UUID resolution ---------------- */

  private async resolveInputTypeUuid(ctx: UpsertContext, type?: string): Promise<UUID> {
    const inputType =
      type === 'inputtype_1' ? 'INPUT_TYPE_1' : type === 'inputtype_2' ? 'INPUT_TYPE_2' : 'INPUT_TYPE_3';

    let uuid = ctx.inputTypeUuidCache.get(inputType) as UUID;
    if (!uuid) {
      uuid = await this.inputEntityService.getInputTypeUUIDByName(inputType) as UUID;
      ctx.inputTypeUuidCache.set(inputType, uuid);
    }
    return uuid;
  }

  async getAllSections(filters: Record<string, unknown> = {}) {
    try {
      const sql = `SELECT * FROM sections ie  WHERE (created_by IS NULL OR ie.created_by = $1) AND ie.is_deleted = 0 ORDER BY created_at DESC`;
      const params = [filters.user_id];
      console.log(sql, params);
      const result = await query<any>(sql, params);
      return result;
    } catch (error) {
      console.error("Error fetching sections:", error);
      throw error;
    }
  }
  async getAllSectionInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
    const sql = `SELECT sec.*,
                    sec_row.section_id,
                    sec_row.row_id AS section_row_id,
                    row.id AS row_id,
                    row.name AS row_name,
                    row.row_order AS row_order,
                    row_col.column_id AS row_column_id,
                    col.id AS column_id,
                    col.name AS column_name,
                    col.width AS column_width,
                    col.column_order AS column_order,
                    sig.id AS section_input_group_id,
                    sig.input_group_order,
                    i.id AS input_id,
                    i.label AS input_name,
                    i.type_id AS input_type_id,
                    i.show_label,
                    i.show_quantity,
                    i.quantity_id,
                    i.input_entity_id,
                    i.is_bold,
                    i.font_size,
                    i.extra_note,
                    i.input_order AS input_order,
                    ie.name AS input_entity_name,
                    ievalue.value AS input_entity_value,
                    it.name AS input_type_name,
                    dopt.value AS dropdown_option_value,
                    dopt.id AS dropdown_option_id,
                    quantopt.value AS quantity_option_value,
                    quantopt.id AS quantity_option_id,
                    quant.name AS quantity_name
                 FROM sections sec
                 LEFT JOIN section_rows sec_row ON sec_row.section_id = sec.id
                 LEFT JOIN rows row ON sec_row.row_id = row.id
                 LEFT JOIN rows_columns row_col ON row_col.row_id = row.id
                 LEFT JOIN columns col ON col.id = row_col.column_id
                 LEFT JOIN section_input_groups sig ON sig.column_id = col.id
                 LEFT JOIN section_input_group_join sigj ON sigj.section_input_group_id = sig.id
                 LEFT JOIN inputs i ON i.id = sigj.input_id
                 LEFT JOIN input_entities ie ON ie.id = i.input_entity_id
                 LEFT JOIN dropdown_entity_values dev ON dev.input_entity_id = ie.id
                 LEFT JOIN dropdown_options dopt ON dopt.id = dev.option_id
                 LEFT JOIN input_entity_values ievalue ON ievalue.input_entity_id = ie.id
                 LEFT JOIN input_types it ON it.id = ie.type_id
                 LEFT JOIN quantity_options quantopt ON quantopt.quantity_id = i.quantity_id
                 LEFT JOIN quantities quant ON quant.id = i.quantity_id
                 WHERE sec.id = $1 AND sec.is_deleted = 0 AND sec.created_by=$2
                 ORDER BY row.row_order NULLS LAST, col.column_order NULLS LAST, sig.input_group_order NULLS LAST, i.input_order NULLS LAST`;
    const params = [id, filters?.user_id];
    // console.log(sql)
    const result = await query<any>(sql, params);

    if (!result.rows || result.rows.length === 0) {
      return result;
    }

    const sectionData: any = { ...result.rows[0], rows: [] };
    [
      'section_row_id',
      'row_id',
      'row_name',
      'row_column_id',
      'column_id',
      'column_name',
      'column_width',
      'section_input_group_id',
      'input_group_order',
      'input_id',
      'input_name',
      'input_type_id',
      'show_label',
      'show_quantity',
      'input_entity_id',
      'input_entity_name',
      'input_type_name',
      'input_entity_value',
      'column_order',
      'input_order',
      'row_order',
      'dropdown_option_value',
      'dropdown_option_id',
      'quantity_option_value',
      'quantity_option_id',
      'quantity_name',
      'is_bold',
      'font_size',
      'extra_note',
    ].forEach((key) => delete sectionData[key]);

    const rowMap: Record<string, any> = {};

    for (const item of result.rows) {
      console.log(item)
      if (!item.row_id) {
        continue;
      }

      const rowId = item.row_id;
      if (!rowMap[rowId]) {
        rowMap[rowId] = {
          row_id: item.row_id,
          row_name: item.row_name,
          row_order: item.row_order,
          columns: [],
        };
        sectionData.rows.push(rowMap[rowId]);
      }

      const currentRow = rowMap[rowId];
      let column = item.column_id ? currentRow.columns.find((col: any) => col.column_id === item.column_id) : undefined;
      if (!column && item.column_id) {
        column = {
          column_id: item.column_id,
          column_name: item.column_name,
          width: item.column_width,
          column_order: item.column_order,
          inputGroup: [],
        };
        currentRow.columns.push(column);
      }
      if (column && item.section_input_group_id) {
        let inputGroup = column.inputGroup.find((existing: any) => existing.section_input_group_id === item.section_input_group_id);
        if (!inputGroup) {
          inputGroup = {
            section_input_group_id: item.section_input_group_id,
            input_group_order: item?.input_group_order,
            inputs: [],
          };
          column.inputGroup.push(inputGroup);
        }
      }
      if (column && item.input_id) {
        let inputGroupIndex = column.inputGroup.findIndex((existing: any) => existing.section_input_group_id === item.section_input_group_id);
        let input = column.inputGroup[inputGroupIndex].inputs.find((existing: any) => existing.input_id === item.input_id);
        const dropdownOptionValue = { value: item.dropdown_option_value, id: item.dropdown_option_id };
        const quantityOptionValue = { value: item.quantity_option_value, id: item.quantity_option_id };
        const hasOptions = (input: Array<any>, options: any) => {
          if (!input) return false;
          let hasOption: Boolean = false;
          input.forEach((existing: any) => {
            if (existing.id == options.id) {
              hasOption = true;
            }
          });
          return hasOption;
        };
        if (!input) {
          input = {
            input_id: item.input_id,
            input_name: item.input_name,
            input_type_id: item.input_type_id,
            show_label: item.show_label,
            show_quantity: item.show_quantity,
            quantity_id: item.quantity_id,
            input_entity_id: item.input_entity_id,
            input_entity_name: item.input_entity_name,
            input_entity_value: item.input_entity_value,
            input_type_name: item.input_type_name,
            quantity_name: item.quantity_name,
            dropdown_option_values: dropdownOptionValue ? [dropdownOptionValue] : [],
            quantity_option_values: quantityOptionValue ? [quantityOptionValue] : [],
            input_order: item.input_order,
            is_bold: item.is_bold,
            font_size: item.font_size,
            extra_note: item.extra_note,
          };
          column.inputGroup[inputGroupIndex].inputs.push(input);
        } else {
          if (dropdownOptionValue && !hasOptions(input.dropdown_option_values, dropdownOptionValue)) {
            input.dropdown_option_values.push(dropdownOptionValue);
          }
          if (quantityOptionValue && !hasOptions(input.quantity_option_values, quantityOptionValue)) {
            input.quantity_option_values.push(quantityOptionValue);
          }
        }
      }
    }

    result.rows = [sectionData];
    return result;
  }
}