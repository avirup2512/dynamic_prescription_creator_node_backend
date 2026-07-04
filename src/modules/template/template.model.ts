import { BaseModel } from "../common/base.model";
import { Template } from "../../types/entities";
import { pool, query } from "../../database/client";
import { InputEntityService } from "../inputEntity/inputEntity.service";
import { FoodAndRecipeService } from "../foodAndRecipes/foodAndRecipes.service";

export class TemplateModel extends BaseModel<Template> {
  inputEntityService: InputEntityService;
  foodAndRecipeService: FoodAndRecipeService
  previousTemplateSectionInputId: Map<string, string> = new Map();
  previousTemplateSectionInputGroupId: Map<string, string> = new Map();
  constructor() {
    super(
      "templates",
      "id",
      ['name', 'created_by', 'header', 'body', 'footer', 'is_deleted'],
      ['name'],
    );
    this.inputEntityService = new InputEntityService();
    this.foodAndRecipeService = new FoodAndRecipeService();
  }
  isValidUUID(uuid: string): boolean {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return regex.test(uuid);
  }
  async createTemplate(data: Partial<any>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const templateName = data.name || "";
      const templateCreatedBy = data.user_id;
      const templateIsDeleted = data.is_deleted ?? 0;

      const templateInsertQuery = `INSERT INTO templates (name, created_by, is_deleted) VALUES ($1, $2, $3) RETURNING *`;
      const templateResult = await client.query(templateInsertQuery, [templateName, templateCreatedBy, templateIsDeleted]);
      const insertedTemplate = templateResult.rows[0];

      const inputTypeUuidCache: Record<string, string> = {};
      const processedIds = {
        rows: new Set<string>(),
        columns: new Set<string>(),
        inputs: new Set<string>(),
      };

      // FIX: forEach does not await async callbacks — replaced with for...of
      // so each section is fully inserted before the next one starts,
      // and all inserts complete before COMMIT is reached.

      if (data?.body?.length) {
        for (const section of data.body) {
          await this.insertTemplateSection(
            client, insertedTemplate.id, section.id, section, "body", inputTypeUuidCache, processedIds
          );
        }
      }

      if (data?.header?.length) {
        for (const section of data.header) {
          await this.insertTemplateSection(
            client, insertedTemplate.id, section.id, section, "header", inputTypeUuidCache, processedIds
          );
        }
      }

      if (data?.footer?.length) {
        for (const section of data.footer) {
          await this.insertTemplateSection(
            client, insertedTemplate.id, section.id, section, "footer", inputTypeUuidCache, processedIds
          );
        }
      }

      await client.query("COMMIT");
      this.previousTemplateSectionInputId.clear();
      return insertedTemplate;
    } catch (error) {
      console.error(error);
      await client.query("ROLLBACK");
      this.previousTemplateSectionInputId.clear();
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertTemplateSection(
    client: any,
    templateId: string,
    sectionId: Partial<any>,
    data: any,
    sectionType: string,
    inputTypeUuidCache: Record<string, string>,
    processedIds?: any
  ) {
    const addRowQuery = `INSERT INTO template_sections (template_id, section_id, is_header, is_body, is_footer,section_order,is_visible) VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING *`;
    const sectionResult = await client.query(addRowQuery, [
      templateId,
      sectionId,
      sectionType === "header" ? 1 : 0,
      sectionType === "body" ? 1 : 0,
      sectionType === "footer" ? 1 : 0,
      data?.SectionOrder ?? 0,
      data?.isVisible === true ? 1 : 0
    ]);
    const insertedSection = sectionResult.rows[0];

    const rows = Array.isArray(data.rows) ? data.rows : [];

    // FIX: was forEach — replaced with for...of
    for (const row of rows) {
      await this.insertSectionRow(client, insertedSection.id, row, inputTypeUuidCache, processedIds);
    }
  }

  private async insertSectionRow(
    client: any,
    sectionId: string,
    row: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
    processedIds?: any
  ) {
    const addRowQuery = `INSERT INTO template_rows (name, row_order) VALUES ($1, $2) RETURNING *`;
    const rowResult = await client.query(addRowQuery, [row?.name ?? "", row?.row_order ?? 0]);
    const insertedRow = rowResult.rows[0];
    if (processedIds) processedIds.rows.add(insertedRow.id);

    const addSectionRowsQuery = `INSERT INTO template_section_rows (section_id, row_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addSectionRowsQuery, [sectionId, insertedRow.id]);

    const columns = Array.isArray(row?.column)
      ? row.column
      : Array.isArray(row?.columns)
        ? row.columns
        : [];

    // FIX: was implicit — kept as for...of (already correct in original insertSectionRow)
    for (const col of columns) {
      await this.insertColumnWithInputs(client, insertedRow.id, col, inputTypeUuidCache, processedIds);
    }
  }

  private async insertColumnWithInputs(
    client: any,
    rowId: string,
    col: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
    processedIds?: any
  ) {
    const addColumnQuery = `INSERT INTO template_columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
    const columnResult = await client.query(addColumnQuery, [
      col?.name ?? "",
      Math.ceil(col?.width ?? 100),
      col?.column_order ?? 0,
    ]);
    const insertedColumn = columnResult.rows[0];
    if (processedIds) processedIds.columns.add(insertedColumn.id);

    const addRowColumnQuery = `INSERT INTO template_rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addRowColumnQuery, [insertedColumn.id, rowId]);

    const inputGroups = Array.isArray(col?.inputGroup) ? col.inputGroup : [];

    for (const inputGroup of inputGroups) {
      await this.insertInputGroupForColumn(client, insertedColumn.id, inputGroup, inputTypeUuidCache, processedIds);
    }
  }
  private async insertInputGroupForColumn(
    client: any,
    columnId: string,
    inputGroup: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
    processedIds?: any
  ) {
    const addInputGroupQuery = `INSERT INTO template_input_groups (template_column_id, input_group_order) VALUES ($1, $2) RETURNING *`;
    const inputGroupResult = await client.query(addInputGroupQuery, [
      columnId,
      inputGroup?.input_group_order ?? 0
    ]);
    const insertedInputGroup = inputGroupResult.rows[0];
    const addColumnInputQuery = `INSERT INTO template_column_input_group_join (template_input_group_id, column_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addColumnInputQuery, [insertedInputGroup.id, columnId]);
    if (inputGroup?.template_input_group_id) {
      this.previousTemplateSectionInputGroupId.set(inputGroup?.template_input_group_id, insertedInputGroup.id); // Store the mapping of previous input_group_id to the new inserted
    }
    if (
      inputGroup?.or_input_group_id &&
      this.previousTemplateSectionInputGroupId.has(inputGroup.or_input_group_id)
    ) {
      const template_input_group_id = this.previousTemplateSectionInputGroupId.get(inputGroup.or_input_group_id);
      const addColumnInputOrQuery = `INSERT INTO template_inputs_group_or (or_input_group_id, parent_input_group_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addColumnInputOrQuery, [insertedInputGroup.id, template_input_group_id]);
    }
    for (const input of inputGroup?.inputs ?? []) {
      await this.insertInputForColumn(client, insertedInputGroup.id, input, inputTypeUuidCache, processedIds);
    }
  }
  private async insertInputForColumn(
    client: any,
    inputGroupId: string,
    input: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
    processedIds?: any
  ) {
    console.log(input);
    const inputType = input?.type === "inputtype_1"
      ? "INPUT_TYPE_1"
      : input?.type === "inputtype_2"
        ? "INPUT_TYPE_2"
        : input?.type === "inputtype_3"
          ? "INPUT_TYPE_3"
          : input?.type === "inputtype_4"
            ? "INPUT_TYPE_4"
            : input?.type === "inputtype_5"
              ? "INPUT_TYPE_5"
              : "INPUT_TYPE_6";

    let inputTypeUUID: any = inputTypeUuidCache[inputType];
    if (!inputTypeUUID) {
      inputTypeUUID = await this.inputEntityService.getInputTypeUUIDByName(inputType ?? "");
      inputTypeUuidCache[inputType] = inputTypeUUID;
    }

    const quantityId = input?.quantity_id ?? null;

    const addInputQuery = `
    INSERT INTO template_inputs
      (type_id, label, input_entity_id, show_label, quantity_id, is_bold, font_size, extra_note, is_deleted, show_quantity, input_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
    const inputResult = await client.query(addInputQuery, [
      inputTypeUUID,
      input?.name ?? "",
      input?.input_entity_id ?? "",
      input?.show_label ?? 0,
      quantityId,
      input?.is_bold ?? 0,
      input?.font_size ?? 14,
      input?.extra_note ?? 0,
      input?.is_deleted ?? 0,
      input?.show_quantity ?? 0,
      input?.input_order ?? 0,
    ]);
    const insertedInput = inputResult.rows[0];

    if (input?.input_id != null) {
      this.previousTemplateSectionInputId.set(input.input_id, insertedInput.id);
    }

    if (processedIds) processedIds.inputs.add(insertedInput.id);

    // OR relationship
    if (
      input?.or_input_id &&
      this.previousTemplateSectionInputId.has(input.or_input_id)
    ) {
      const template_input_id = this.previousTemplateSectionInputId.get(input.or_input_id);
      const addColumnInputOrQuery = `INSERT INTO template_inputs_or (or_input_id, parent_input_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addColumnInputOrQuery, [insertedInput.id, template_input_id]);
    }

    const addInputGroupJoinQuery = `INSERT INTO template_input_group_join (template_input_group_id, template_input_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addInputGroupJoinQuery, [inputGroupId, insertedInput.id]);
    // Adding dropdown entity value if present
    if (inputType === "INPUT_TYPE_2" && input?.dropdown_option_id && input?.input_entity_id) {
      // Validate that both the input_entity_id and dropdown_option_id exist
      const entityValidationQuery = `SELECT id FROM input_entities WHERE id = $1`;
      const entityValidationResult = await client.query(entityValidationQuery, [input.input_entity_id]);

      const optionValidationQuery = `SELECT id FROM dropdown_options WHERE id = $1`;
      const optionValidationResult = await client.query(optionValidationQuery, [input.dropdown_option_id]);

      if (entityValidationResult.rows.length > 0 && optionValidationResult.rows.length > 0) {
        const addDropdownOptionQuery = `INSERT INTO template_input_dropdown_options (template_input_id, dropdown_option_id) VALUES ($1, $2) RETURNING *`;
        await client.query(addDropdownOptionQuery, [insertedInput.id, input.dropdown_option_id]);
      } else {
        console.warn(
          `Skipping dropdown entity value insertion: entity_id="${input.input_entity_id}" valid=${entityValidationResult.rows.length > 0}, option_id="${input.dropdown_option_id}" valid=${optionValidationResult.rows.length > 0}`
        );
      }
    }
    // ADDING quantity option if present
    if (input?.quantity_option_id) {
      const addQuantityOptionQuery = `INSERT INTO template_input_quantity_options (template_input_id, quantity_option_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addQuantityOptionQuery, [insertedInput.id, input.quantity_option_id ?? input?.template_input_quantity_option_id ?? null]);
    }
    // ADDING Recipe If Present
    if (inputType === "INPUT_TYPE_5" && input?.recipe_id) {
      const addRecipeQuery = `INSERT INTO template_recipe_join (template_input_id, recipe_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addRecipeQuery, [insertedInput.id, input.recipe_id]);
    }
    // ADDING Food If Present
    if (inputType === "INPUT_TYPE_6" && input?.food_id) {
      const addFoodQuery = `INSERT INTO template_food_join (template_input_id, food_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addFoodQuery, [insertedInput.id, input.food_id]);
    }
    const addInputValueQuery = `INSERT INTO template_inputs_value (template_input_id, value) VALUES ($1, $2) RETURNING *`;
    await client.query(addInputValueQuery, [insertedInput.id, input?.template_input_value ?? ""]);

    const addQuantityValueQuery = `INSERT INTO template_inputs_quantity_value (template_input_id, value) VALUES ($1, $2) RETURNING *`;
    await client.query(addQuantityValueQuery, [insertedInput.id, input?.quantityTextValue ?? input?.template_quantity_value ?? ""]);

    await this.insertTemplateInputExtranotes(client, insertedInput.id, input);
  }

  private async insertTemplateInputExtranotes(client: any, templateInputId: string, input: Partial<any>) {
    const note = typeof input?.extra_note_value === "string"
      ? input.extra_note_value.trim()
      : "";
    if (note) {
      await client.query(
        `INSERT INTO template_input_extranotes (template_input_id, note, is_deleted) VALUES ($1, $2, 0)`,
        [templateInputId, note]
      );
    }
  }

  async updateTemplate(id: string, data: Partial<any>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Verify the template exists
      const existingResult = await client.query(
        `SELECT * FROM templates WHERE id = $1 AND is_deleted = 0`,
        [id]
      );
      if (!existingResult.rows.length) {
        throw new Error(`Template with id "${id}" not found.`);
      }

      // 2. Update the template root record (only mutable fields)
      const templateName = data.name ?? existingResult.rows[0].name;
      await client.query(
        `UPDATE templates SET name = $1, updated_at = now() WHERE id = $2`,
        [templateName, id]
      );

      // 3. Delete existing sections for this template.
      //    CASCADE on template_sections propagates to:
      //      template_section_rows → template_rows_columns → template_column_inputs
      //      → template_inputs_or, template_input_quantity_options,
      //        template_inputs_value, template_inputs_quantity_value,
      //        template_input_extranotes
      //    (template_rows and template_columns themselves are NOT cascade-deleted
      //     from template_sections — they must be cleaned up explicitly via
      //     template_section_rows and template_rows_columns cascades.)
      //
      //    Deletion order that respects FK constraints:
      //      a) Collect all section IDs for this template
      //      b) Collect all row IDs linked to those sections
      //      c) Collect all column IDs linked to those rows
      //      d) Delete template_sections (cascades junction rows)
      //      e) Delete orphaned template_rows and template_columns

      const sectionIdsResult = await client.query(
        `SELECT id FROM template_sections WHERE template_id = $1`,
        [id]
      );
      const sectionIds: string[] = sectionIdsResult.rows.map((r: any) => r.id);

      let rowIds: string[] = [];
      let columnIds: string[] = [];

      if (sectionIds.length) {
        const rowIdsResult = await client.query(
          `SELECT row_id FROM template_section_rows WHERE section_id = ANY($1::uuid[])`,
          [sectionIds]
        );
        rowIds = rowIdsResult.rows.map((r: any) => r.row_id);

        if (rowIds.length) {
          const columnIdsResult = await client.query(
            `SELECT column_id FROM template_rows_columns WHERE row_id = ANY($1::uuid[])`,
            [rowIds]
          );
          columnIds = columnIdsResult.rows.map((r: any) => r.column_id);
        }

        // Delete template_sections — cascades:
        //   template_section_rows, template_rows_columns, template_column_inputs,
        //   template_inputs_or, template_input_quantity_options,
        //   template_inputs_value, template_inputs_quantity_value,
        //   template_input_extranotes
        await client.query(
          `DELETE FROM template_sections WHERE template_id = $1`,
          [id]
        );

        // Clean up orphaned rows and columns (no CASCADE from template_sections to these)
        if (rowIds.length) {
          await client.query(
            `DELETE FROM template_rows WHERE id = ANY($1::uuid[])`,
            [rowIds]
          );
        }
        if (columnIds.length) {
          const inputGroupIdsResult = await client.query(
            `SELECT template_input_group_id FROM template_column_input_group_join WHERE column_id = ANY($1::uuid[])`,
            [columnIds]
          );
          const inputGroupIds: string[] = inputGroupIdsResult.rows.map((r: any) => r.template_input_group_id);
          await client.query(
            `DELETE FROM template_columns WHERE id = ANY($1::uuid[])`,
            [columnIds]
          );
          if (inputGroupIds.length) {
            // Collect input IDs before deleting columns so we can clean up template_inputs
            const inputIdsResult = await client.query(
              `SELECT template_input_id FROM template_input_group_join WHERE template_input_group_id = ANY($1::uuid[])`,
              [inputGroupIds]
            );
            const inputIds: string[] = inputIdsResult.rows.map((r: any) => r.template_input_id);

            await client.query(
              `DELETE FROM template_input_groups WHERE id = ANY($1::uuid[])`,
              [inputGroupIds]
            );

            if (inputIds.length) {
              await client.query(
                `DELETE FROM template_inputs WHERE id = ANY($1::uuid[])`,
                [inputIds]
              );
            }
          }
        }
      }

      // 4. Re-insert sections (same logic as create)
      const inputTypeUuidCache: Record<string, string> = {};
      const processedIds = {
        rows: new Set<string>(),
        columns: new Set<string>(),
        inputs: new Set<string>(),
      };

      // NOTE: Using for...of instead of forEach to correctly await async calls.
      // The original create flow uses forEach which does NOT await — a bug that
      // causes sections to be processed after COMMIT in some cases.
      if (data?.body?.length) {
        for (const section of data.body) {
          await this.insertTemplateSection(
            client, id, section.id || section.section_id, section, "body", inputTypeUuidCache, processedIds
          );
        }
      }
      if (data?.header?.length) {
        for (const section of data.header) {
          await this.insertTemplateSection(
            client, id, section.id || section.section_id, section, "header", inputTypeUuidCache, processedIds
          );
        }
      }
      if (data?.footer?.length) {
        for (const section of data.footer) {
          await this.insertTemplateSection(
            client, id, section.id || section.section_id, section, "footer", inputTypeUuidCache, processedIds
          );
        }
      }

      await client.query("COMMIT");
      this.previousTemplateSectionInputId.clear();

      // Return the updated template record
      const updatedResult = await client.query(
        `SELECT * FROM templates WHERE id = $1`,
        [id]
      );
      return updatedResult.rows[0];
    } catch (error) {
      console.error(error);
      await client.query("ROLLBACK");
      this.previousTemplateSectionInputId.clear();
      throw error;
    } finally {
      client.release();
    }
  }
  async getAllTemplateInfoById(id: string | string[], filters: Record<string, unknown> = {}) {

    // FIX Bug 1: Added tpl_sec.id AS template_section_id to the SELECT so we
    // can key sectionMap by the actual template_section PK, not the FK section_id.
    const sql = `SELECT tpl.*,
                  tpl_sec.id AS template_section_id,
                  tpl_sec.section_id,
                  tpl_sec.template_id,
                  tpl_sec.is_header,
                  tpl_sec.is_body,
                  tpl_sec.is_footer,
                  tpl_sec.section_order,
                  tpl_sec.is_visible,
                  sec.name AS section_name,
                  tpl_row.id AS template_row_id,
                  tpl_row.name AS row_name,
                  tpl_row.row_order AS row_order,
                  tpl_row_col.column_id AS template_column_id,
                  tpl_col.id AS column_id,
                  tpl_col.name AS column_name,
                  tpl_col.width AS column_width,
                  tpl_col.column_order AS column_order,
                  tig.id AS template_input_group_id,
                  tig.input_group_order AS input_group_order,
                  tpl_i.id AS input_id,
                  tpl_i.label AS input_name,
                  tpl_i.type_id AS input_type_id,
                  tpl_i.show_label,
                  tpl_i.show_quantity,
                  tpl_i.quantity_id,
                  tpl_i.input_entity_id,
                  tpl_i.input_order AS input_order,
                  tpl_i.is_bold,
                  tpl_i.font_size,
                  tpl_i.extra_note,
                  tpl_extra.id AS template_input_extranote_id,
                  tpl_extra.note AS template_input_extranote_note,
                  ie.name AS input_entity_name,
                  ievalue.value AS input_entity_value,
                  it.name AS input_type_name,
                  dopt.value AS dropdown_option_value,
                  tido.dropdown_option_id AS dropdown_option_id,
                  trj.recipe_id AS recipe_id,
                  tfj.food_id AS food_id,
                  quantopt.value AS quantity_option_value,
                  quantopt.id AS quantity_option_id,
                  tpl_inp_qty_opt.quantity_option_id AS template_input_quantity_option_id,
                  tpl_input_val.value AS template_input_value,
                  tpl_quantity_val.value AS template_quantity_value,
                  quant.name AS quantity_name,
                  tio.parent_input_id AS or_linked_input_id,
                  tigo.parent_input_group_id AS or_linked_input_group_id
               FROM templates tpl
               LEFT JOIN template_sections tpl_sec ON tpl_sec.template_id = tpl.id
               LEFT JOIN template_section_rows tpl_sec_row ON tpl_sec_row.section_id = tpl_sec.id
               LEFT JOIN template_rows tpl_row ON tpl_sec_row.row_id = tpl_row.id
               LEFT JOIN template_rows_columns tpl_row_col ON tpl_row_col.row_id = tpl_row.id
               LEFT JOIN template_columns tpl_col ON tpl_col.id = tpl_row_col.column_id
               LEFT JOIN template_column_input_group_join tcigj ON tcigj.column_id = tpl_col.id
               LEFT JOIN template_input_groups tig ON tig.id = tcigj.template_input_group_id
               LEFT JOIN template_input_group_join tigj ON tigj.template_input_group_id = tig.id
               LEFT JOIN template_inputs tpl_i ON tpl_i.id = tigj.template_input_id
               LEFT JOIN template_input_extranotes tpl_extra ON tpl_extra.template_input_id = tpl_i.id AND tpl_extra.is_deleted = 0
               LEFT JOIN input_entities ie ON ie.id = tpl_i.input_entity_id
               LEFT JOIN template_input_dropdown_options tido ON tido.template_input_id = tpl_i.id
               LEFT JOIN template_recipe_join trj ON trj.template_input_id = tpl_i.id
               LEFT JOIN template_food_join tfj ON tfj.template_input_id = tpl_i.id
               LEFT JOIN dropdown_options dopt ON dopt.id = tido.dropdown_option_id
               LEFT JOIN input_entity_values ievalue ON ievalue.input_entity_id = ie.id
               LEFT JOIN input_types it ON it.id = ie.type_id
               LEFT JOIN template_input_quantity_options tpl_inp_qty_opt ON tpl_inp_qty_opt.template_input_id = tpl_i.id
               LEFT JOIN quantity_options quantopt ON quantopt.quantity_id = tpl_i.quantity_id
               LEFT JOIN quantities quant ON quant.id = tpl_i.quantity_id
               LEFT JOIN template_inputs_value tpl_input_val ON tpl_input_val.template_input_id = tpl_i.id
               LEFT JOIN template_inputs_quantity_value tpl_quantity_val ON tpl_quantity_val.template_input_id = tpl_i.id
               LEFT JOIN template_inputs_or tio ON tio.or_input_id = tpl_i.id
               LEFT JOIN template_inputs_group_or tigo ON tigo.or_input_group_id = tig.id
               LEFT JOIN sections sec ON tpl_sec.section_id = sec.id
               WHERE tpl.id = $1 AND tpl.is_deleted = 0
  ORDER BY tpl_sec.section_order NULLS LAST, tpl_row.row_order NULLS LAST, tpl_col.column_order NULLS LAST, tig.input_group_order NULLS LAST, tpl_i.input_order NULLS LAST`;

    const params = [id];
    const result = await query<any>(sql, params);

    if (!result.rows || result.rows.length === 0) {
      return result;
    }

    const templateData: any = {
      ...result.rows[0],
      header: [],
      body: [],
      footer: [],
      sections: [],
    };

    [
      'section_name',
      'template_section_id',
      'section_id',
      'section_order',
      'is_visible',
      'template_id',
      'is_header',
      'is_body',
      'is_footer',
      'template_row_id',
      'input_group_order',
      'row_name',
      'row_order',
      'template_column_id',
      'template_input_group_id',
      'column_id',
      'column_name',
      'column_width',
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
      'dropdown_option_value',
      'recipe_id',
      'food_id',
      'dropdown_option_id',
      'quantity_option_value',
      'quantity_option_id',
      'template_input_value',
      'template_quantity_value',
      'quantity_name',
      'template_input_extranote_id',
      'template_input_extranote_note',
      'is_bold',
      'font_size',
      'extra_note',
      'template_input_quantity_option_id',
      'or_linked_input_id',
      'or_linked_input_group_id'
    ].forEach((key) => delete templateData[key]);

    const sectionMap: Record<string, any> = {};
    // FIX Design risk: rowMap keyed by "sectionId:rowId" instead of just rowId,
    // so the same row appearing in two sections doesn't collapse into one entry.
    const rowMap: Record<string, any> = {};

    // FIX Bug 4: replaced forEach-with-flag with Array.some() for early exit
    // FIX Bug 3: changed == to === for strict UUID string comparison
    const hasOptions = (inputArr: Array<any>, option: any): boolean => {
      if (!inputArr) return false;
      return inputArr.some((existing: any) => existing.id === option.id);
    };

    for (const item of result.rows) {
      if (!item.section_id) {
        continue;
      }

      // FIX Bug 1: key sectionMap by template_section_id (the PK of template_sections),
      // not by section_id (the FK reference). This prevents two template_section rows
      // that reference the same base section from collapsing into one entry.
      const templateSectionId = item.template_section_id;

      if (!sectionMap[templateSectionId]) {
        // FIX Bug 2: section_id is now correctly set to item.section_id (the FK reference
        // to the original sections table), not item.template_row_id which is a row ID.
        sectionMap[templateSectionId] = {
          name: item.section_name,
          sectionOrder: item?.section_order,
          template_section_id: item.template_section_id,
          section_id: item.section_id,
          template_id: item.template_id,
          is_header: item.is_header,
          is_body: item.is_body,
          is_footer: item.is_footer,
          rows: [],
        };

        if (item.is_header) {
          templateData.header.push(sectionMap[templateSectionId]);
        } else if (item.is_body) {
          templateData.body.push(sectionMap[templateSectionId]);
        } else if (item.is_footer) {
          templateData.footer.push(sectionMap[templateSectionId]);
        }
      }

      const currentSection = sectionMap[templateSectionId];
      const rowId = item.template_row_id;

      if (!rowId) continue;

      // FIX Design risk: key rowMap by "templateSectionId:rowId" so the same row_id
      // in a different section gets its own entry instead of being skipped.
      const rowKey = `${templateSectionId}:${rowId}`;

      if (!rowMap[rowKey]) {
        rowMap[rowKey] = {
          template_row_id: item.template_row_id,
          row_name: item.row_name,
          row_order: item.row_order,
          is_header: item.is_header,
          is_body: item.is_body,
          is_footer: item.is_footer,
          columns: [],
        };
        currentSection.rows.push(rowMap[rowKey]);
      }

      const currentRow = rowMap[rowKey];

      let column = item.column_id
        ? currentRow.columns.find((col: any) => col.column_id === item.column_id)
        : undefined;

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
      if (column && item.template_input_group_id) {
        let inputGroup = column.inputGroup.find((existing: any) => existing.template_input_group_id === item.template_input_group_id);
        if (!inputGroup) {
          inputGroup = {
            template_input_group_id: item.template_input_group_id, input_group_order: item.input_group_order, inputs: [], or_input_group_id: item.or_linked_input_group_id
          };
          column.inputGroup.push(inputGroup);
        }

        if (column && item.input_id) {
          let inputGroupIndex = column.inputGroup.findIndex((existing: any) => existing.template_input_group_id === item.template_input_group_id);
          let input = column.inputGroup[inputGroupIndex].inputs.find((existing: any) => existing.input_id === item.input_id);
          // FIX Bug 5: guard on the actual field values before constructing the objects.
          // Previously { value: null, id: null } was always truthy, causing null entries
          // to be pushed into dropdown_option_values and quantity_option_values arrays.
          const dropdownOptionValue = item.dropdown_option_id
            ? { value: item.dropdown_option_value, id: item.dropdown_option_id }
            : null;

          const quantityOptionValue = item.quantity_option_id
            ? { value: item.quantity_option_value, id: item.quantity_option_id }
            : null;

          let quantity_option_value = '';
          if (item.template_input_quantity_option_id === item.quantity_option_id) {
            quantity_option_value = item.quantity_option_value;
          }
          if (item.recipe_id) {
            const recipeDetails = await this.foodAndRecipeService.getRecipeDetails(item.recipe_id);
            if (recipeDetails && recipeDetails.rows && recipeDetails.rows.length > 0) {
              const recipe = recipeDetails.rows[0];
              item.recipe = recipe;
            }
          }
          if (item.food_id) {
            const foodDetails = await this.foodAndRecipeService.getFoodDetailsById(item.food_id);
            if (foodDetails && foodDetails.rows && foodDetails.rows.length > 0) {
              const food = foodDetails.rows[0];
              item.food = food;
            }
          }
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
              template_input_value: item.template_input_value,
              template_quantity_value: item.template_quantity_value,
              quantity_name: item.quantity_name,
              dropdown_option_value: item.dropdown_option_value,
              dropdown_option_id: item.dropdown_option_id,
              dropdown_option_values: dropdownOptionValue ? [dropdownOptionValue] : [],
              quantity_option_values: quantityOptionValue ? [quantityOptionValue] : [],
              template_input_extranotes: item.template_input_extranote_note,
              input_order: item.input_order,
              is_bold: item.is_bold,
              font_size: item.font_size,
              extra_note: item.extra_note,
              template_input_quantity_option_id: item.template_input_quantity_option_id,
              quantity_option_value: quantity_option_value,
              isVisible: item?.is_visible ?? 1,
              // FIX Bug 6: renamed from or_input_id to or_linked_input_id and now
              // correctly holds tio.or_input_id (the child/linked input) instead of
              // tio.parent_input_id (which was the current input's own ID — redundant).
              or_input_id: item.or_linked_input_id,
              recipe_id: item.recipe_id,
              food_id: item.food_id,
              recipe: item.recipe,
              food: item.food
            };
            column.inputGroup[inputGroupIndex].inputs.push(input);
          } else {
            // Accumulate additional dropdown options for an already-seen input
            if (dropdownOptionValue && !hasOptions(input.dropdown_option_values, dropdownOptionValue)) {
              input.dropdown_option_values.push(dropdownOptionValue);
            }
            // Accumulate additional quantity options for an already-seen input
            if (quantityOptionValue && !hasOptions(input.quantity_option_values, quantityOptionValue)) {
              input.quantity_option_values.push(quantityOptionValue);
            }
          }
        }
      }
    }
    result.rows = [templateData];
    return result;
  }
  async getAllTemplates(filters: Record<string, unknown> = {}) {
    const sql = `SELECT
      t.*,
      COALESCE(MAX(ts.is_header), 0)::smallint AS is_header,
      COALESCE(MAX(ts.is_body), 0)::smallint AS is_body,
      COALESCE(MAX(ts.is_footer), 0)::smallint AS is_footer,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.name), NULL) AS section_names
    FROM templates t
    LEFT JOIN template_sections ts ON ts.template_id = t.id
    LEFT JOIN sections s ON s.id = ts.section_id
    WHERE t.created_by = $1 AND t.is_deleted = 0
    GROUP BY t.id
    ORDER BY t.created_at DESC`;
    const params = [filters.user_id];
    const result = await query<any>(sql, params);
    return result;
  }
  async createDraftTemplate(data: any) {
    const sql = `INSERT INTO templates (name, created_by, is_draft) VALUES ($1, $2, 1) RETURNING *`;
    const params = [data?.templateName, data?.user_id];
    const result = await query<any>(sql, params);
    return result;
  }
  async createAndAssignSectionToTemplate(data: any) {
    const client = await pool.connect();
    try {
      // SECTION CREATION WITH BLANK ROWS, COLUMNS, INPUT GROUPS STARTS
      await client.query("BEGIN");
      const sectionName = data.name || "untitled_section";
      const sectionCreatedBy = data.user_id;
      const sectionIsDeleted = data.is_deleted ?? 0;

      const sectionInsertQuery = `INSERT INTO sections (name, created_by, is_deleted) VALUES ($1, $2, $3) RETURNING *`;
      const sectionResult = await client.query(sectionInsertQuery, [sectionName, sectionCreatedBy, sectionIsDeleted]);
      const insertedSection = sectionResult.rows[0];
      const rows = Array.isArray(data.rows) ? data.rows : [];
      const addRowQuery = `INSERT INTO rows (name, row_order) VALUES ($1, $2) RETURNING *`;
      const rowResult = await client.query(addRowQuery, [rows[0]?.name ?? "untitled_row", rows[0]?.row_order ?? 0]);
      const insertedRow = rowResult.rows[0];
      const addSectionRowsQuery = `INSERT INTO section_rows (section_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addSectionRowsQuery, [insertedSection.id, insertedRow.id]);
      const columns = Array.isArray(rows[0]?.column) ? rows[0].column : Array.isArray(rows[0]?.columns) ? rows[0].columns : [];
      const col = columns[0];
      const addColumnQuery = `INSERT INTO columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
      const columnResult = await client.query(addColumnQuery, [col?.name ?? "untitled_column", Math.ceil(col?.width ?? 100), col?.column_order ?? 0]);
      const insertedColumn = columnResult.rows[0];
      const addRowColumnQuery = `INSERT INTO rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addRowColumnQuery, [insertedColumn.id, insertedRow.id]);
      const inputGroups = Array.isArray(col?.inputGroup) ? col.inputGroup : [];
      const inputGroup = inputGroups[0];
      const addInputGroupQuery = `INSERT INTO section_input_groups (column_id, input_group_order) VALUES ($1, $2) RETURNING *`;
      const inputResult = await client.query(addInputGroupQuery, [insertedColumn.id, inputGroup?.input_group_order ?? 0]);
      const insertedInputGroup = inputResult.rows[0];
      const addColumnInputQuery = `INSERT INTO column_inputs_group_join (section_input_group_id, column_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addColumnInputQuery, [insertedInputGroup.id, insertedColumn.id]);
      // SECTION CREATION WITH BLANK ROWS, COLUMNS, INPUT GROUPS ENDS
      const templateId = data.template_id;
      const addTemplateSectionQuery = `INSERT INTO template_sections (template_id, section_id, is_header, is_body, is_footer, section_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
      const templateSectionResult = await client.query(addTemplateSectionQuery, [templateId, insertedSection.id, data.is_header ?? 0, data.is_body ?? 0, data.is_footer ?? 0, data.section_order ?? 0]);
      const addTemplateRows = `INSERT INTO template_rows (name, row_order) VALUES ($1, $2) RETURNING *`;
      const templateRowResult = await client.query(addTemplateRows, [insertedRow.name, insertedRow.row_order]);
      const insertedTemplateRow = templateRowResult.rows[0];
      const addTemplateSectionRowsQuery = `INSERT INTO template_section_rows (section_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addTemplateSectionRowsQuery, [templateSectionResult.rows[0].id, insertedTemplateRow.id]);
      const addTemplateColumns = `INSERT INTO template_columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
      const templateColumnResult = await client.query(addTemplateColumns, [insertedColumn.name, insertedColumn.width, insertedColumn.column_order]);
      const insertedTemplateColumn = templateColumnResult.rows[0];
      const addTemplateRowsColumnsQuery = `INSERT INTO template_rows_columns (row_id, column_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addTemplateRowsColumnsQuery, [insertedTemplateRow.id, insertedTemplateColumn.id]);
      const addTemplateInputGroups = `INSERT INTO template_input_groups (template_column_id,input_group_order) VALUES ($1,$2) RETURNING *`;
      const templateInputGroupResult = await client.query(addTemplateInputGroups, [insertedTemplateColumn.id, insertedInputGroup.input_group_order]);
      const insertedTemplateInputGroup = templateInputGroupResult.rows[0];
      const addTemplateColumnInputGroupJoinQuery = `INSERT INTO template_column_input_group_join (column_id, template_input_group_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addTemplateColumnInputGroupJoinQuery, [insertedTemplateColumn.id, insertedTemplateInputGroup.id]);
      await client.query("COMMIT");
      return {
        section: insertedSection,
        row: insertedRow,
        column: insertedColumn,
        inputGroup: insertedInputGroup,
        templateSection: templateSectionResult.rows[0],
        templateRow: insertedTemplateRow,
        templateColumn: insertedTemplateColumn,
        templateInputGroup: insertedTemplateInputGroup,
      };
    } catch (error) {
      console.log(error)
    }
  }

  async searchAllTypesOfInputByKeyword(keyword: string) {
    const sql = `WITH
    input_results AS (
    SELECT
        ie.id,
        ie.name,
        it.name AS type_name,
        iev.value
    FROM input_entities ie
    JOIN input_types it
        ON ie.type_id = it.id
    LEFT JOIN input_entity_values iev
        ON iev.input_entity_id = ie.id
    WHERE
        ie.is_deleted = 0
        AND (
            ie.name ILIKE '%' || $1 || '%'
            OR iev.value ILIKE '%' || $1 || '%'
        )
),

dropdown_results AS (
    SELECT
        ie.id,
        ie.name,
        it.name AS type_name,
        json_agg(
            json_build_object(
                'id', dopt.id,
                'value', dopt.value
            )
        ) AS options
    FROM input_entities ie
    JOIN input_types it
        ON ie.type_id = it.id
    JOIN dropdown_entity_values dev
        ON dev.input_entity_id = ie.id
    JOIN dropdown_options dopt
        ON dopt.id = dev.option_id
    WHERE
        ie.is_deleted = 0
        AND (
            ie.name ILIKE '%' || $1 || '%'
            OR dopt.value ILIKE '%' || $1 || '%'
        )
    GROUP BY
        ie.id,
        ie.name,
        it.name
),

food_results AS (
    SELECT
        id,
        food_code,
        name,
        scientific_name,
        category_id,
        'INPUT_TYPE_3' AS type_name
    FROM foods
    WHERE
        is_deleted = 0
        AND (
            name ILIKE '%' || $1 || '%'
            OR food_code ILIKE '%' || $1 || '%'
            OR scientific_name ILIKE '%' || $1 || '%'
        )
),

recipe_results AS (
    SELECT
        r.id,
        r.recipe_code,
        r.name,
        r.category,
        r.description,
        'INPUT_TYPE_4' AS type_name,
        COALESCE(
            json_agg(DISTINCT rt.category_id)
                FILTER (WHERE rt.category_id IS NOT NULL),
            '[]'
        ) AS recipe_tag_category_ids
    FROM recipes r
    LEFT JOIN recipe_tags_join rtj
        ON rtj.recipe_id = r.id
        AND rtj.is_deleted = 0
    LEFT JOIN recipe_tags rt
        ON rt.id = rtj.tag_id
        AND rt.is_deleted = 0
    WHERE
        r.is_deleted = 0
        AND (
            r.name ILIKE '%' || $1 || '%'
            OR r.recipe_code ILIKE '%' || $1 || '%'
            OR r.category ILIKE '%' || $1 || '%'
            OR r.description ILIKE '%' || $1 || '%'
            OR r.instructions ILIKE '%' || $1 || '%'
        )
    GROUP BY
        r.id,
        r.recipe_code,
        r.name,
        r.category,
        r.description
)
  SELECT
    COALESCE((SELECT json_agg(input_results) FROM input_results), '[]') AS input_entities,

    COALESCE((SELECT json_agg(dropdown_results) FROM dropdown_results), '[]') AS dropdowns,

    COALESCE((SELECT json_agg(food_results) FROM food_results), '[]') AS foods,

    COALESCE((SELECT json_agg(recipe_results) FROM recipe_results), '[]') AS recipes;`;
    const params = [`%${keyword}%`];
    const result = await query<any>(sql, params);
    return result.rows[0];
  }

  async addIndividualRowToTemplateSection(templateSectionId: string, rowData: any) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let columnIds;
      const addRowQuery = `INSERT INTO template_rows (name, row_order) VALUES ($1, $2) RETURNING *`;
      const rowResult = await client.query(addRowQuery, [rowData.name ?? "untitled_row", rowData.row_order ?? 0]);
      const insertedRow = rowResult.rows[0];
      const addTemplateSectionRowsQuery = `INSERT INTO template_section_rows (section_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addTemplateSectionRowsQuery, [templateSectionId, insertedRow.id]);
      const columns = Array.isArray(rowData?.column)
        ? rowData.column
        : Array.isArray(rowData?.columns)
          ? rowData.columns
          : [];

      // FIX: was implicit — kept as for...of (already correct in original insertSectionRow)
      for (const col of columns) {
        columnIds = await this.addIndividualColumnToTemplateRow(client, insertedRow.id, col);
      }
      await client.query("COMMIT");
      return { rowIds: insertedRow, ...columnIds };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async addIndividualColumnToTemplateRow(client: any, templateRowId: string, columnData: any) {
    let inputGroupIds;
    const addColumnQuery = `INSERT INTO template_columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
    const columnResult = await client.query(addColumnQuery, [
      columnData?.name ?? "",
      Math.ceil(columnData?.width ?? 100),
      columnData?.column_order ?? 0,
    ]);
    const insertedColumn = columnResult.rows[0];

    const addRowColumnQuery = `INSERT INTO template_rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addRowColumnQuery, [insertedColumn.id, templateRowId]);

    const inputGroups = Array.isArray(columnData?.inputGroup) ? columnData.inputGroup : [];

    for (const inputGroup of inputGroups) {
      inputGroupIds = await this.insertIndividualInputGroupForColumn(client, insertedColumn.id, inputGroup);
    }
    return { columnIds: { id: insertedColumn.id }, inputGroupIds };
  }
  private async insertIndividualInputGroupForColumn(
    client: any,
    columnId: string,
    inputGroup: Partial<any>
  ) {
    const addInputGroupQuery = `INSERT INTO template_input_groups (template_column_id, input_group_order) VALUES ($1, $2) RETURNING *`;
    const inputGroupResult = await client.query(addInputGroupQuery, [
      columnId,
      inputGroup?.input_group_order ?? 0
    ]);
    const insertedInputGroup = inputGroupResult.rows[0];
    const addColumnInputQuery = `INSERT INTO template_column_input_group_join (template_input_group_id, column_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addColumnInputQuery, [insertedInputGroup.id, columnId]);
    return { id: insertedInputGroup.id };
  }

  async addColumnToRow(templateRowId: string, columnData: any) {
    const client = await pool.connect();
    try {
      let inputGroupIds;
      const addColumnQuery = `INSERT INTO template_columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
      const columnResult = await client.query(addColumnQuery, [
        columnData?.name ?? "",
        Math.ceil(columnData?.width ?? 100),
        columnData?.column_order ?? 0,
      ]);
      const insertedColumn = columnResult.rows[0];

      const addRowColumnQuery = `INSERT INTO template_rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addRowColumnQuery, [insertedColumn.id, templateRowId]);

      const inputGroups = Array.isArray(columnData?.inputGroup) ? columnData.inputGroup : [];

      for (const inputGroup of inputGroups) {
        inputGroupIds = await this.insertIndividualInputGroupForColumn(client, insertedColumn.id, inputGroup);
      }
      return { columnIds: { id: insertedColumn.id }, inputGroupIds };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  }
}
