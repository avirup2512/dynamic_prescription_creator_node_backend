import { BaseModel } from "../common/base.model";
import { Template } from "../../types/entities";
import { pool, query } from "../../database/client";
import { InputEntityService } from "../inputEntity/inputEntity.service";

export class TemplateModel extends BaseModel<Template> {
  inputEntityService:InputEntityService
  constructor() {
    super(
      "templates",
      "id",
      ['name', 'created_by', 'header', 'body', 'footer', 'is_deleted'],
      ['name'],
    );
    this.inputEntityService = new InputEntityService();
  }
    async createTemplate(data: Partial<any>) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
  
        const templateName = data.name || "";
        const templateCreatedBy = data.user_id ?? "9a6246f4-be76-4eda-9eef-f26e5c40a300";
        const templateIsDeleted = data.is_deleted ?? 0;
  
        const templateInsertQuery = `INSERT INTO templates (name, created_by, is_deleted) VALUES ($1, $2, $3) RETURNING *`;
        const templateResult = await client.query(templateInsertQuery, [templateName, templateCreatedBy, templateIsDeleted]);
        const insertedTemplate = templateResult.rows[0];
        const inputTypeUuidCache: Record<string, string> = {};
        const processedIds = { rows: new Set<string>(), columns: new Set<string>(), inputs: new Set<string>() };
        for (let x in data)
        {
          if (data[x].id)
          {
            await this.insertTemplateSection(client,insertedTemplate.id,data[x].id,data[x],x,inputTypeUuidCache,processedIds)
          }
        }
        await client.query("COMMIT");
        return insertedTemplate;
      } catch (error) {
        console.error(error);
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
    private async insertTemplateSection(client: any,
        templateId: string,
        sectionId: Partial<any>,
        data: any,
        sectionType:string,
        inputTypeUuidCache: Record<string, string>,
        processedIds?: any)
    {
        console.log(data)
        const addRowQuery = `INSERT INTO template_sections (template_id, section_id, is_header,is_body, is_footer) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const sectionResult = await client.query(addRowQuery, [templateId, sectionId, (sectionType == "header" ? 1 : 0), (sectionType == "body" ? 1 : 0), (sectionType == "footer" ? 1 : 0)]);
        const insertedSection = sectionResult.rows[0];
        const rows = Array.isArray(data.rows) ? data.rows : [];
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
      const columnResult = await client.query(addColumnQuery, [col?.name ?? "", Math.ceil(col?.width ?? 100), col?.column_order ?? 0]);
      const insertedColumn = columnResult.rows[0];
      if (processedIds) processedIds.columns.add(insertedColumn.id);
  
      const addRowColumnQuery = `INSERT INTO template_rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addRowColumnQuery, [insertedColumn.id, rowId]);
  
      const inputs = Array.isArray(col?.inputs) ? col.inputs : [];
      for (const input of inputs) {
        await this.insertInputForColumn(client, insertedColumn.id, input, inputTypeUuidCache, processedIds);
      }
    }
    private async insertInputForColumn(
      client: any,
      columnId: string,
      input: Partial<any>,
      inputTypeUuidCache: Record<string, string>,
      processedIds?: any
    ) {
      const inputType = input?.type == "inputtype_1"
        ? 'INPUT_TYPE_1'
        : input?.type == "inputtype_2"
          ? "INPUT_TYPE_2"
          : "INPUT_TYPE_3";
  
      let inputTypeUUID: any = inputTypeUuidCache[inputType];
      if (!inputTypeUUID) {
        inputTypeUUID = await this.inputEntityService.getInputTypeUUIDByName(inputType ?? "");
        inputTypeUuidCache[inputType] = inputTypeUUID;
      }
      console.log("Input Type UUID:", inputTypeUUID);
      console.log(input);
      let quantityId = input?.quantity_id ?? null;
      const addInputQuery = `INSERT INTO template_inputs (type_id, label, input_entity_id, show_label,quantity_id,is_bold,font_size,extra_note, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
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
      ]);
      const insertedInput = inputResult.rows[0];
      if (processedIds) processedIds.inputs.add(insertedInput.id);
  
      const addColumnInputQuery = `INSERT INTO template_column_inputs (column_id, input_id) VALUES ($1, $2) RETURNING *`;
      await client.query(addColumnInputQuery, [columnId, insertedInput.id]);
      if (input?.dropdown_option_id)
      {
        const addDropdownOptionQuery = `INSERT INTO dropdown_entity_values (input_entity_id, option_id) VALUES ($1, $2) RETURNING *`;
        await client.query(addDropdownOptionQuery, [input?.input_entity_id ?? "", input?.dropdown_option_id]);
      }
      if(input?.quantity_option_id)
      {
        const addQuantityOptionQuery = `INSERT INTO template_input_quantity_options (template_input_id, quantity_option_id) VALUES ($1, $2) RETURNING *`;
        await client.query(addQuantityOptionQuery, [insertedInput.id, input?.quantity_option_id]);
      }
      const addInputValueQuery = `INSERT INTO template_inputs_value (template_input_id, value) VALUES ($1, $2) RETURNING *`;
      await client.query(addInputValueQuery, [insertedInput.id, input?.input_entity_value ?? ""]);
      const addQuantityValueQuery = `INSERT INTO template_inputs_quantity_value (template_input_id, value) VALUES ($1, $2) RETURNING *`;
      await client.query(addQuantityValueQuery, [insertedInput.id, input?.quantityTextValue ?? ""]);
      await this.insertTemplateInputExtranotes(client, insertedInput.id, input);
    }

    private async insertTemplateInputExtranotes(client: any, templateInputId: string, input: Partial<any>) {
      const note = typeof input?.extra_note_value === "string"
        ? input.extra_note_value.trim() : "";
      console.log(note);
      console.log(templateInputId);
      if (note) {
        await client.query(
          `INSERT INTO template_input_extranotes (template_input_id, note, is_deleted) VALUES ($1, $2, 0)`,
          [templateInputId, note],
        );
      }
    }

  async updateTemplate(id: string, data: Partial<any>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateData: Record<string, any> = {};
      if (typeof data.name === "string") updateData.name = data.name;
      if (typeof data.user_id === "string") updateData.created_by = data.user_id;
      if (typeof data.created_by === "string") updateData.created_by = data.created_by;
      if (typeof data.is_deleted === "number") updateData.is_deleted = data.is_deleted;
      const templateUpdateQuery = `UPDATE templates SET name = $1, created_by = $2, is_deleted = $3 WHERE id = $4 RETURNING *`;
      const templateResult = await client.query(templateUpdateQuery, [updateData.name, updateData.created_by, updateData.is_deleted, id]);
      const updatedTemplate = templateResult.rows[0];
      const processedIds = { rows: new Set<string>(), columns: new Set<string>(), inputs: new Set<string>() };
      const inputTypeUuidCache: Record<string, string> = {};
      for (let x in data) {
        if (data[x].id) {
          await this.updateTemplateSection(client, updatedTemplate.id, data[x].id, data[x], x, inputTypeUuidCache, processedIds);
        }
      }
      await client.query("COMMIT");
      return updatedTemplate;
      }
      catch (error) {
        console.error(error);
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
        private async updateTemplateSection(client: any,
        templateId: string,
        sectionId: Partial<any>,
        data: any,
        sectionType:string,
        inputTypeUuidCache: Record<string, string>,
        processedIds: any)
    {
        console.log(data)
        const updateRowQuery = `UPDATE template_sections SET is_header = $3, is_body = $4, is_footer = $5 WHERE template_id = $1 AND section_id = $2 RETURNING *`;
        const sectionResult = await client.query(updateRowQuery, [templateId, sectionId, (sectionType == "header" ? 1 : 0), (sectionType == "body" ? 1 : 0), (sectionType == "footer" ? 1 : 0)]);
        const insertedSection = sectionResult.rows[0];
        const rows = Array.isArray(data.rows) ? data.rows : [];
        for (const row of rows) {
          await this.updateSectionRow(client, insertedSection.id, row,inputTypeUuidCache, processedIds);
        }
  }
  private async updateSectionRow(
      client: any,
      sectionId: string,
      row: Partial<any>,
      inputTypeUuidCache: Record<string, string>,
      processedIds:any
    ) {
      const updateRowQuery = `UPDATE template_rows SET name = $1, row_order = $2 WHERE id = $3 RETURNING *`;
      const rowResult = await client.query(updateRowQuery, [row?.name ?? "", row?.row_order ?? 0, row?.id]);
      const insertedRow = rowResult.rows[0];
      if (processedIds) processedIds.rows.add(insertedRow.id);
  
      const updateSectionRowsQuery = `UPDATE template_section_rows SET section_id = $1, row_id = $2 WHERE section_id = $3 AND row_id = $4 RETURNING *`;
      await client.query(updateSectionRowsQuery, [sectionId, insertedRow.id, sectionId, row?.id]);
  
      const columns = Array.isArray(row?.column)
        ? row.column
        : Array.isArray(row?.columns)
          ? row.columns
          : [];
      for (const col of columns) {
        await this.updateColumnWithInputs(client, insertedRow.id, col,inputTypeUuidCache, processedIds);
      }
  }
  private async updateColumnWithInputs(
      client: any,
      rowId: string,
      col: Partial<any>,
      inputTypeUuidCache: Record<string, string>,
      processedIds?: any
    ) {
      const updateColumnQuery = `UPDATE template_columns SET name = $1, width = $2, column_order = $3 WHERE id = $4 RETURNING *`;
      const columnResult = await client.query(updateColumnQuery, [col?.name ?? "", Math.ceil(col?.width ?? 100), col?.column_order ?? 0, col?.id]);
      const insertedColumn = columnResult.rows[0];
      if (processedIds) processedIds.columns.add(insertedColumn.id);
  
      const updateRowColumnQuery = `UPDATE template_rows_columns SET column_id = $1, row_id = $2 WHERE column_id = $3 AND row_id = $4 RETURNING *`;
      await client.query(updateRowColumnQuery, [insertedColumn.id, rowId, col?.id, rowId]);
  
      const inputs = Array.isArray(col?.inputs) ? col.inputs : [];
      for (const input of inputs) {
        await this.updateInputForColumn(client, insertedColumn.id, input,inputTypeUuidCache, processedIds);
      }
  }
  private async updateInputForColumn(
      client: any,
      columnId: string,
      input: Partial<any>,
      inputTypeUuidCache: Record<string, string>,
      processedIds?: any
    ) {
      const inputType = input?.type == "inputtype_1"
        ? 'INPUT_TYPE_1'
        : input?.type == "inputtype_2"
          ? "INPUT_TYPE_2"
          : "INPUT_TYPE_3";
  
      let inputTypeUUID: any = inputTypeUuidCache[inputType];
      if (!inputTypeUUID) {
        inputTypeUUID = await this.inputEntityService.getInputTypeUUIDByName(inputType ?? "");
        inputTypeUuidCache[inputType] = inputTypeUUID;
      }
      console.log("Input Type UUID:", inputTypeUUID);
      console.log(input);
      let quantityId = input?.quantity_id ?? null;
      const updateInputQuery = `UPDATE template_inputs SET type_id = $1, label = $2, input_entity_id = $3, show_label = $4, quantity_id = $5, is_bold = $6, font_size = $7, extra_note = $8, is_deleted = $9 WHERE id = $10 RETURNING *`;
      const inputResult = await client.query(updateInputQuery, [
        inputTypeUUID,
        input?.name ?? "",
        input?.input_entity_id ?? "",
        input?.show_label ?? 0,
        quantityId,
        input?.is_bold ?? 0,
        input?.font_size ?? 14,
        input?.extra_note ?? 0,
        input?.is_deleted ?? 0,
        input?.id
      ]);
      const insertedInput = inputResult.rows[0];
      if (processedIds) processedIds.inputs.add(insertedInput.id);
  
      const updateColumnInputQuery = `UPDATE template_column_inputs SET column_id = $1, input_id = $2 WHERE column_id = $3 AND input_id = $4 RETURNING *`;
      await client.query(updateColumnInputQuery, [columnId, insertedInput.id, columnId, insertedInput.id]);
      const updateInputValueQuery = `UPDATE template_inputs_value SET value = $2 WHERE template_input_id = $1 RETURNING *`;
    await client.query(updateInputValueQuery, [insertedInput.id, input?.input_entity_value ?? ""]);
      if (input?.dropdown_option_id)
      {
        const updateDropdownOptionQuery = `UPDATE dropdown_entity_values SET input_entity_id = $1, option_id = $2 WHERE input_entity_id = $3 AND option_id = $4 RETURNING *`;
        await client.query(updateDropdownOptionQuery, [input?.input_entity_id ?? "", input?.dropdown_option_id, input?.input_entity_id ?? "", input?.dropdown_option_id]);
    }
    if(input?.quantity_option_id)
    {
      const updateQuantityOptionQuery = `UPDATE template_input_quantity_options SET template_input_id = $1,quantity_option_id = $2 WHERE template_input_id = $1 AND quantity_option_id = $2 RETURNING *`;
      await client.query(updateQuantityOptionQuery, [insertedInput.id, input?.quantity_option_id]);
    }
      const updateQuantityValueQuery = `UPDATE template_inputs_quantity_value SET value = $2 WHERE template_input_id = $1 RETURNING *`;
      await client.query(updateQuantityValueQuery, [insertedInput.id, input?.quantityTextValue ?? ""]);
      await this.updateTemplateInputExtranotes(client, insertedInput.id, input);
  }
  private async updateTemplateInputExtranotes(client: any, templateInputId: string, input: Partial<any>) {
      const note = typeof input?.extra_note_value === "string"
        ? input.extra_note_value.trim() : "";
      console.log(note);
      console.log(templateInputId);
      if (note) {
        await client.query(
          `UPDATE template_input_extranotes SET note = $2, is_deleted = 0 WHERE template_input_id = $1 RETURNING *`,
          [templateInputId, note],
        );
      }
    }
  async getAllTemplateInfoById(id: string | string[], filters: Record<string, unknown> = {}) {
    const sql = `SELECT tpl.*,
                    tpl_sec.section_id,
                    tpl_sec.template_id,
                    tpl_sec.is_header,
                    tpl_sec.is_body,
                    tpl_sec.is_footer,
                    tpl_row.id AS template_row_id,
                    tpl_row.name AS row_name,
                    tpl_row.row_order AS row_order,
                    tpl_row_col.column_id AS template_column_id,
                    tpl_col.id AS column_id,
                    tpl_col.name AS column_name,
                    tpl_col.width AS column_width,
                    tpl_col.column_order AS column_order,
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
                    dev.option_id AS dropdown_option_id,
                    quantopt.value AS quantity_option_value,
                    quantopt.id AS quantity_option_id,
                    tpl_inp_qty_opt.quantity_option_id AS template_input_quantity_option_id,
                    tpl_input_val.value AS template_input_value,
                    tpl_quantity_val.value AS template_quantity_value,
                    quant.name AS quantity_name
                 FROM templates tpl
                 LEFT JOIN template_sections tpl_sec ON tpl_sec.template_id = tpl.id
                 LEFT JOIN template_section_rows tpl_sec_row ON tpl_sec_row.section_id = tpl_sec.id
                 LEFT JOIN template_rows tpl_row ON tpl_sec_row.row_id = tpl_row.id
                 LEFT JOIN template_rows_columns tpl_row_col ON tpl_row_col.row_id = tpl_row.id
                 LEFT JOIN template_columns tpl_col ON tpl_col.id = tpl_row_col.column_id
                 LEFT JOIN template_column_inputs tpl_col_input ON tpl_col_input.column_id = tpl_col.id
                 LEFT JOIN template_inputs tpl_i ON tpl_col_input.input_id = tpl_i.id
                 LEFT JOIN template_input_extranotes tpl_extra ON tpl_extra.template_input_id = tpl_i.id AND tpl_extra.is_deleted = 0
                 LEFT JOIN input_entities ie ON ie.id = tpl_i.input_entity_id
                 LEFT JOIN dropdown_entity_values dev ON dev.input_entity_id = ie.id
                 LEFT JOIN dropdown_options dopt ON dopt.id = dev.option_id
                 LEFT JOIN input_entity_values ievalue ON ievalue.input_entity_id = ie.id
                 LEFT JOIN input_types it ON it.id = ie.type_id
                 LEFT JOIN template_input_quantity_options tpl_inp_qty_opt ON tpl_inp_qty_opt.template_input_id = tpl_i.id
                 LEFT JOIN quantity_options quantopt ON quantopt.quantity_id = tpl_i.quantity_id
                 LEFT JOIN quantities quant ON quant.id = tpl_i.quantity_id
                 LEFT JOIN template_inputs_value tpl_input_val ON tpl_input_val.template_input_id = tpl_i.id
                 LEFT JOIN template_inputs_quantity_value tpl_quantity_val ON tpl_quantity_val.template_input_id = tpl_i.id
                 WHERE tpl.id = $1 AND tpl.is_deleted = 0
                 ORDER BY tpl_row.row_order NULLS LAST, tpl_col.column_order NULLS LAST, tpl_i.input_order NULLS LAST`;
    const params = [id];
    const result = await query<any>(sql, params);

    if (!result.rows || result.rows.length === 0) {
      return result;
    }

    const templateData: any = { ...result.rows[0], header:{rows:[]}, body:{rows:[]}, footer:{rows:[]}, sections: [] };
    [
      'section_id',
      'template_id',
      'is_header',
      'is_body',
      'is_footer',
      'template_row_id',
      'row_name',
      'row_order',
      'template_column_id',
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
      'template_input_quantity_option_id'
    ].forEach((key) => delete templateData[key]);

    const rowMap: Record<string, any> = {};

    for (const item of result.rows) {
      if (!item.template_row_id) {
        continue;
      }

      const rowId = item.template_row_id;
      if (!rowMap[rowId]) {
        rowMap[rowId] = {
          template_row_id: item.template_row_id,
          row_name: item.row_name,
          row_order: item.row_order,
          is_header: item.is_header,
          is_body: item.is_body,
          is_footer: item.is_footer,
          columns: [],
        };
        if(item.is_header) {
          templateData.header.rows.push(rowMap[rowId]);
        } else if(item.is_body) {
          templateData.body.rows.push(rowMap[rowId]);
        } else if(item.is_footer) {
          templateData.footer.rows.push(rowMap[rowId]);
        }
        // templateData.sections.push(rowMap[rowId]);
      }

      const currentRow = rowMap[rowId];
      let column = item.column_id ? currentRow.columns.find((col: any) => col.column_id === item.column_id) : undefined;
      if (!column && item.column_id) {
        column = {
          column_id: item.column_id,
          column_name: item.column_name,
          width: item.column_width,
          column_order: item.column_order,
          inputs: [],
        };
        currentRow.columns.push(column);
      }

      if (column && item.input_id) {
        let input = column.inputs.find((existing: any) => existing.input_id === item.input_id);
        const dropdownOptionValue = { value: item.dropdown_option_value, id: item.dropdown_option_id };
        const quantityOptionValue = { value: item.quantity_option_value, id: item.quantity_option_id };
        let quantity_option_value = '';
        if(item.template_input_quantity_option_id == item.quantity_option_id) {
          quantity_option_value = item.quantity_option_value;
        }
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
            quantity_option_value: quantity_option_value
          };
          column.inputs.push(input);
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
    console.log(templateData)
    result.rows = [templateData];
    return result;
  }
  async getAllTemplates(filters: Record<string, unknown> = {}) {
    const sql = `SELECT * FROM templates ie  WHERE (created_by IS NULL OR ie.created_by = $1) AND ie.is_deleted = 0 ORDER BY created_at DESC`;
    const params = [filters.user_id || "9a6246f4-be76-4eda-9eef-f26e5c40a300"];
    const result = await query<any>(sql, params);
    return result;
  }
}
