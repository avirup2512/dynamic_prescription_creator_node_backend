import { BaseModel } from "../common/base.model";
import { Template } from "../../types/entities";
import { pool, query } from "../../database/client";
import { InputEntityService } from "../inputEntity/inputEntity.service";
import { FoodAndRecipeService } from "../foodAndRecipes/foodAndRecipes.service";
import { v4 as uuidv4 } from "uuid";
import { TemplateSectionHelper } from "./template.section.helper";
import { TemplateRowHelper } from "./template.row.helper";
import { TemplateColumnHelper } from "./template.column.helper";
import { TemplateInputGroupHelper } from "./template.input.group.helper";
import { TemplateInputHelper } from "./template.input.helper";
export class TemplateModel extends BaseModel<Template> {
  inputEntityService: InputEntityService;
  foodAndRecipeService: FoodAndRecipeService;
  private sectionHelper = new TemplateSectionHelper();
  private rowHelper = new TemplateRowHelper();
  private columnHelper = new TemplateColumnHelper();
  private inputGroupHelper = new TemplateInputGroupHelper();
  private inputHelper = new TemplateInputHelper();
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
  async updateTemplate(templateId: string, data: Partial<any>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const sectionResult = await this.sectionHelper.saveSections(client, templateId, data.UpdatedSections);
      await this.rowHelper.saveRows(client, '', data.UpdatedRows);
      await this.columnHelper.saveColumns(client, '', data.UpdatedColumns);
      await this.inputGroupHelper.saveInputGroup(client, '', data.UpdatedInputGroups);
      await this.inputHelper.saveInput(client, '', data.UpdatedInputs);
      await client.query("COMMIT");
      return { success: true, data: sectionResult };
    } catch (error) {
      console.error(error);
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async getConditionIdFromName(conditionName: string) {
    if (!conditionName) return null;
    const result = await pool.query(
      `
      SELECT id
      FROM input_conditions
      WHERE name = $1
      `,
      [conditionName]
    );

    return result.rows[0]?.id || null;
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
                  tig.name AS template_input_group_name,
                  tig.input_group_order AS input_group_order,
                  tig.is_visible as input_group_visibility,
                  tpl_i.id AS input_id,
                  tpl_i.label AS input_name,
                  tpl_i.type_id AS input_type_id,
                  tpl_i.show_label,
                  tpl_i.show_quantity,
                  tpl_i.quantity_id,
                  tpl_i.input_entity_id,
                  tpl_i.input_order AS input_order,
                  tpl_i.extra_note,
                  tpl_i.is_visible as input_visibility,
                  tpl_i.is_quantity_type_single,
                  tpl_extra.id AS template_input_extranote_id,
                  tpl_extra.note AS template_input_extranote_note,
                  tis.font_family,
                  tis.font_size,
                  tis.font_weight,
                  tis.font_style,
                  tis.text_decoration,

                  tis.text_color,
                  tis.background_color,

                  tis.text_align,

                  tis.line_height,
                  tis.letter_spacing,

                  tis.padding_top,
                  tis.padding_right,
                  tis.padding_bottom,
                  tis.padding_left,

                  tis.margin_top,
                  tis.margin_right,
                  tis.margin_bottom,
                  tis.margin_left,

                  tis.border_width,
                  tis.border_color,
                  tis.border_radius,

                  tis.width,
                  tis.height,

                  ie.name AS input_entity_name,
                  ievalue.value AS input_entity_value,
                  it.name AS input_type_name,
                  dopt.value AS dropdown_option_value,
                  tido.dropdown_option_id AS dropdown_option_id,
                  trj.recipe_id AS recipe_id,
                  tfj.food_id AS food_id,
                  quantopt.value AS quantity_option_value,
                  quantopt.id AS quantity_option_id,
                  quantities.name AS template_quantity_name,
                  tpl_inp_qty.quantity_id AS template_input_quantity_id,
                  tpl_inp_qty_opt.quantity_option_id AS template_input_quantity_option_id,
                  tpl_input_val.value AS template_input_value,
                  tpl_blank_input_val.value AS template_blank_input_value,
                  tpl_quantity_val.valueFrom AS template_quantity_valueFrom,
                  tpl_quantity_val.valueTo AS template_quantity_valueTo,
                  quant.name AS quantity_name,
                  tio.previous_input_id AS previous_related_input_id,
                  tigo.previous_input_group_id AS previous_related_input_group_id,
                  icfg.name AS condition_with_previous_input_group_name,
                  icfi.name AS condition_with_previous_input_name
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
               LEFT JOIN input_types it ON it.id = tpl_i.type_id
               LEFT JOIN template_inputs_quantity tpl_inp_qty ON tpl_inp_qty.template_input_id = tpl_i.id
               LEFT JOIN quantities ON quantities.id = tpl_inp_qty.quantity_id
               LEFT JOIN template_input_quantity_options tpl_inp_qty_opt ON tpl_inp_qty_opt.template_input_id = tpl_i.id
               LEFT JOIN quantity_options quantopt ON quantopt.quantity_id = tpl_i.quantity_id
               LEFT JOIN quantities quant ON quant.id = tpl_i.quantity_id
               LEFT JOIN template_inputs_value tpl_input_val ON tpl_input_val.template_input_id = tpl_i.id
               LEFT JOIN template_input_blank_text_value tpl_blank_input_val ON tpl_blank_input_val.template_input_id = tpl_i.id
              LEFT JOIN template_input_styles tis
              ON tis.template_input_id = tpl_i.id
               LEFT JOIN template_inputs_quantity_value tpl_quantity_val ON tpl_quantity_val.template_input_id = tpl_i.id
               LEFT JOIN template_inputs_condition tio ON tio.input_id = tpl_i.id
               LEFT JOIN template_inputs_group_conditions tigo ON tigo.input_group_id = tig.id
               LEFT JOIN input_conditions icfg ON icfg.id = tigo.condition_id
               LEFT JOIN input_conditions icfi ON icfi.id = tio.condition_id
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
      'template_input_group_name',
      'previous_related_input_group_id',
      'column_id',
      'column_name',
      'column_width',
      'input_id',
      'input_name',
      'input_type_id',
      'show_label',
      'input_visibility',
      'is_quantity_type_single',
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
      'template_quantity_name',
      'template_input_quantity_id',
      'template_input_value',
      'template_blank_input_value',
      'template_quantity_valueFrom',
      'template_quantity_valueTo',
      'quantity_name',
      'template_input_extranote_id',
      'template_input_extranote_note',
      'is_bold',
      'font_size',
      'extra_note',
      'template_input_quantity_option_id',
      'previous_input_group_id',
      'condition_linked_input_id',
      'condition_with_previous_input_group_name',
      'input_group_visibility',
      'condition_with_previous_input_name',
      'font_family',
      'font_size',
      'font_weight',
      'font_style',
      'text_decoration',
      'text_color',
      'background_color',
      'text_align',
      'line_height',
      'letter_spacing',
      'padding_top',
      'padding_right',
      'padding_bottom',
      'padding_left',
      'margin_top',
      'margin_right',
      'margin_bottom',
      'margin_left',
      'border_width',
      'border_color',
      'border_radius',
      'width',
      'height'
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
      if (!item.template_section_id) {
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
          section_order: item?.section_order,
          template_section_id: item.template_section_id,
          section_id: item.section_id,
          template_id: item.template_id,
          is_header: item.is_header,
          is_body: item.is_body,
          is_footer: item.is_footer,
          is_visible: item?.is_visible ?? 1,
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

      let column = item.template_column_id
        ? currentRow.columns.find((col: any) => col.template_column_id === item.template_column_id)
        : undefined;

      if (!column && item.column_id) {
        column = {
          template_column_id: item.column_id,
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
            template_input_group_id: item.template_input_group_id, input_group_name: item?.template_input_group_name, input_group_order: item.input_group_order, inputs: [], previous_related_input_group_id: item.previous_related_input_group_id, condition_with_previous_input_group_name: item.condition_with_previous_input_group_name, input_group_visibility: item?.input_group_visibility
          };
          column.inputGroup.push(inputGroup);
        }

        if (column && item.input_id) {
          let inputGroupIndex = column.inputGroup.findIndex((existing: any) => existing.template_input_group_id === item.template_input_group_id);
          let input = column.inputGroup[inputGroupIndex].inputs.find((existing: any) => existing.template_input_id === item.input_id);
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
              template_input_id: item.input_id,
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
              template_blank_input_value: item?.template_blank_input_value,
              template_quantity_valueFrom: item.template_quantity_valueFrom,
              template_quantity_valueTo: item.template_quantity_valueTo,
              quantity_name: item.quantity_name,
              dropdown_option_value: item.dropdown_option_value,
              dropdown_option_id: item.dropdown_option_id,
              dropdown_option_values: dropdownOptionValue ? [dropdownOptionValue] : [],
              quantity_option_values: quantityOptionValue ? [quantityOptionValue] : [],
              template_input_extranotes: item.template_input_extranote_note,
              input_order: item.input_order,
              style: {
                font_family: item.font_family,
                font_size: item.font_size,
                font_weight: item.font_weight,
                font_style: item.font_style,
                text_decoration: item.text_decoration,

                text_color: item.text_color,
                background_color: item.background_color,

                text_align: item.text_align,

                line_height: item.line_height,
                letter_spacing: item.letter_spacing,

                padding: {
                  top: item.padding_top,
                  right: item.padding_right,
                  bottom: item.padding_bottom,
                  left: item.padding_left,
                },

                margin: {
                  top: item.margin_top,
                  right: item.margin_right,
                  bottom: item.margin_bottom,
                  left: item.margin_left,
                },

                border: {
                  width: item.border_width,
                  color: item.border_color,
                  radius: item.border_radius,
                },

                width: item.width,
                height: item.height,
              },
              extra_note: item.extra_note,
              template_input_quantity_option_id: item.template_input_quantity_option_id,
              quantity_option_value: quantity_option_value,
              // FIX Bug 6: renamed from or_input_id to condition_linked_input_group_id and now
              // correctly holds tio.child_input_id (the child/linked input) instead of
              // tio.parent_input_id (which was the current input's own ID — redundant).
              condition_linked_input_id: item.condition_linked_input_id,
              recipe_id: item.recipe_id,
              food_id: item.food_id,
              recipe: item.recipe,
              food: item.food,
              is_visible: item?.input_visibility ?? 1,
              template_quantity_type_single: item?.is_quantity_type_single ?? 1,
              template_quantity_name: item.template_quantity_name,
              template_input_quantity_id: item.template_input_quantity_id,
              condition_with_previous_input_name: item?.condition_with_previous_input_name,
              previous_related_input_id: item?.previous_related_input_id
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
    const sql = `SELECT t.* FROM templates t
    WHERE t.created_by = $1 AND t.is_deleted = 0
    ORDER BY t.created_at DESC`;
    const params = [filters.user_id];
    const result = await query<any>(sql, params);

    if (!result.rows || result.rows.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const templates = [];
    for (const template of result.rows) {
      // const detailResult = await this.getAllTemplateInfoById(template.id, filters);
      const detailResult = { rows: [{ header: [template.header], body: [], footer: [] }] }
      if (detailResult.rows && detailResult.rows.length > 0) {
        const templateDetail = detailResult.rows[0];
        const response = {
          id: template.id,
          name: template.name,
          show_header: templateDetail.header && templateDetail.header.length > 0,
          show_body: templateDetail.body && templateDetail.body.length > 0,
          show_footer: templateDetail.footer && templateDetail.footer.length > 0,
          header: templateDetail.header || [],
          body: templateDetail.body || [],
          footer: templateDetail.footer || [],
          created_at: template.created_at,
          updated_at: template.updated_at
        };
        templates.push(response);
      }
    }

    return {
      success: true,
      data: templates
    };
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
      const sql = `INSERT INTO templates (name, created_by, is_draft) VALUES ($1, $2, 1) RETURNING *`;
      const params = [data?.templateName, data?.user_id];
      const result = await query<any>(sql, params);
      const templateId = result.rows[0].id;
      for (let x = 0; x < 3; x++) {
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
        // ADDING INITIAL TEMPLATE SECTION STARTS
        const addTemplateSectionQuery = `INSERT INTO template_sections (template_id, section_id, is_header, is_body, is_footer, section_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const templateSectionResult = await client.query(addTemplateSectionQuery, [templateId, insertedSection.id, (x == 0 ? 1 : 0), (x == 1 ? 1 : 0), (x == 2 ? 1 : 0), data.section_order ?? 0]);
        const addTemplateRows = `INSERT INTO template_rows (name, row_order) VALUES ($1, $2) RETURNING *`;
        const templateRowResult = await client.query(addTemplateRows, [insertedRow.name, insertedRow.row_order]);
        const insertedTemplateRow = templateRowResult.rows[0];
        const addTemplateSectionRowsQuery = `INSERT INTO template_section_rows (section_id, row_id,row_order) VALUES ($1, $2, $3) RETURNING *`;
        await client.query(addTemplateSectionRowsQuery, [templateSectionResult.rows[0].id, insertedTemplateRow.id, 0]);
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
        // ADDING INITIAL TEMPLATE SECTION ENDS
      }
      await client.query("COMMIT");
      return {
        templateId
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
