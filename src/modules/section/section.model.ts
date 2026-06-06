import { BaseModel } from "../common/base.model";
import { Section } from "../../types/entities";
import { pool,query } from "../../database/client";
import { InputEntityService } from "../inputEntity/inputEntity.service";

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

  async createSection(data: Partial<any>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const sectionName = data.name || "";
      const sectionCreatedBy = data.user_id ?? "9a6246f4-be76-4eda-9eef-f26e5c40a300";
      const sectionIsDeleted = data.is_deleted ?? 0;

      const sectionInsertQuery = `INSERT INTO sections (name, created_by, is_deleted) VALUES ($1, $2, $3) RETURNING *`;
      const sectionResult = await client.query(sectionInsertQuery, [sectionName, sectionCreatedBy, sectionIsDeleted]);
      const insertedSection = sectionResult.rows[0];

      const inputTypeUuidCache: Record<string, string> = {};
      const rows = Array.isArray(data.rows) ? data.rows : [];
      for (const row of rows) {
        await this.insertSectionRow(client, insertedSection.id, row, inputTypeUuidCache);
      }

      await client.query("COMMIT");
      return insertedSection;
    } catch (error) {
      console.error(error);
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertSectionRow(
    client: any,
    sectionId: string,
    row: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
  ) {
    const addRowQuery = `INSERT INTO rows (name, row_order) VALUES ($1, $2) RETURNING *`;
    const rowResult = await client.query(addRowQuery, [row?.name ?? "", row?.row_order ?? 0]);
    const insertedRow = rowResult.rows[0];

    const addSectionRowsQuery = `INSERT INTO section_rows (section_id, row_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addSectionRowsQuery, [sectionId, insertedRow.id]);

    const columns = Array.isArray(row?.column)
      ? row.column
      : Array.isArray(row?.columns)
        ? row.columns
        : [];
    for (const col of columns) {
      await this.insertColumnWithInputs(client, insertedRow.id, col, inputTypeUuidCache);
    }
  }

  private async insertColumnWithInputs(
    client: any,
    rowId: string,
    col: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
  ) {
    const addColumnQuery = `INSERT INTO columns (name, width, column_order) VALUES ($1, $2, $3) RETURNING *`;
    const columnResult = await client.query(addColumnQuery, [col?.name ?? "", Math.ceil(col?.width ?? 100), col?.column_order ?? 0]);
    const insertedColumn = columnResult.rows[0];

    const addRowColumnQuery = `INSERT INTO rows_columns (column_id, row_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addRowColumnQuery, [insertedColumn.id, rowId]);

    const inputs = Array.isArray(col?.inputs) ? col.inputs : [];
    for (const input of inputs) {
      await this.insertInputForColumn(client, insertedColumn.id, input, inputTypeUuidCache);
    }
  }

  private async insertInputForColumn(
    client: any,
    columnId: string,
    input: Partial<any>,
    inputTypeUuidCache: Record<string, string>,
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
    let quantityId = input?.quantity_id ?? null;
    const addInputQuery = `INSERT INTO inputs (type_id, label, input_entity_id, show_label,quantity_id, show_quantity,input_order,is_bold,font_size,extra_note,is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11) RETURNING *`;
    const inputResult = await client.query(addInputQuery, [
      inputTypeUUID,
      input?.name ?? "",
      input?.input_entity_id ?? "",
      input?.show_label ? 1 : 0,
      quantityId,
      (input?.show_quantity ? 1 : 0),
      input?.input_order ?? 0,
      input?.is_bold ?? 0,
      input?.font_size ?? 16,
      input?.extra_note ?? 0,
      input?.is_deleted ?? 0,
    ]);
    const insertedInput = inputResult.rows[0];

    const addColumnInputQuery = `INSERT INTO column_inputs (column_id, input_id) VALUES ($1, $2) RETURNING *`;
    await client.query(addColumnInputQuery, [columnId, insertedInput.id]);
  }
  async getAllSections(filters: Record<string, unknown> = {}) {
    try {
      const sql = `SELECT * FROM sections ie  WHERE (created_by IS NULL OR ie.created_by = $1) AND ie.is_deleted = 0 ORDER BY created_at DESC`;
      const params = [filters.user_id || "9a6246f4-be76-4eda-9eef-f26e5c40a300"];
      console.log(sql, params);
      const result = await query<any>(sql, params);
      return result;
    } catch (error) {
      console.error("Error fetching sections:", error);
      throw error;
    }
  }
  async updateSection(sectionId: string, data: Partial<any>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update section basic info
    const sectionUpdateQuery = `UPDATE sections SET name = $1, is_deleted = $2 WHERE id = $3 RETURNING *`;
    const sectionResult = await client.query(sectionUpdateQuery, [
      data.name || "",
      data.is_deleted ?? 0,
      sectionId,
    ]);
    const updatedSection = sectionResult.rows[0];

    // Get existing rows for this section
    const existingRowsQuery = `SELECT row_id FROM section_rows WHERE section_id = $1`;
    const existingRowsResult = await client.query(existingRowsQuery, [sectionId]);
    const existingRowIds = new Set(existingRowsResult.rows.map((r: any) => r.row_id));

    const inputTypeUuidCache: Record<string, string> = {};
    const incomingRowIds = new Set<string>();
    const rows = Array.isArray(data.rows) ? data.rows : [];

    // Process incoming rows
    for (const row of rows) {
      if (row.row_id && existingRowIds.has(row.row_id)) {
        // Update existing row
        await this.updateSectionRow(client, sectionId, row, inputTypeUuidCache);
        incomingRowIds.add(row.row_id);
      } else if (!row.row_id) {
        // Insert new row
        await this.insertSectionRow(client, sectionId, row, inputTypeUuidCache);
      }
    }

    // Delete rows that are no longer in the data
    for (const existingRowId of existingRowIds) {
      if (existingRowId && !incomingRowIds.has(existingRowId)) {
        await this.deleteSectionRow(client, existingRowId);
      }
    }

    await client.query("COMMIT");
    return updatedSection;
  } catch (error) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  }

private async updateSectionRow(
  client: any,
  sectionId: string,
  row: Partial<any>,
  inputTypeUuidCache: Record<string, string>,
) {
  // Update row basic info
  const updateRowQuery = `UPDATE rows SET name = $1, row_order = $2 WHERE id = $3 RETURNING *`;
  const rowResult = await client.query(updateRowQuery, [
    row?.name ?? "",
    row?.row_order ?? 0,
    row.row_id,
  ]);
  const updatedRow = rowResult.rows[0];

  // Get existing columns for this row
  const existingColumnsQuery = `SELECT column_id FROM rows_columns WHERE row_id = $1`;
  const existingColumnsResult = await client.query(existingColumnsQuery, [row.row_id]);
  const existingColumnIds = new Set(existingColumnsResult.rows.map((c: any) => c.column_id as string));

  const incomingColumnIds = new Set<string>();
  const columns = Array.isArray(row?.column)
    ? row.column
    : Array.isArray(row?.columns)
      ? row.columns
      : [];

  // Process incoming columns
  for (const col of columns) {
    if (col.column_id && existingColumnIds.has(col.column_id)) {
      // Update existing column
      await this.updateColumnWithInputs(client, col.column_id, col, inputTypeUuidCache);
      incomingColumnIds.add(col.column_id);
    } else if (!col.column_id) {
      // Insert new column
      await this.insertColumnWithInputs(client, updatedRow.id, col, inputTypeUuidCache);
    }
  }

  // Delete columns that are no longer in the data
  for (const existingColumnId of existingColumnIds) {
    if (existingColumnId && !incomingColumnIds.has(existingColumnId.toString())) {
      await this.deleteColumn(client, existingColumnId.toString());
    }
  }
}

private async updateColumnWithInputs(
  client: any,
  columnId: string,
  col: Partial<any>,
  inputTypeUuidCache: Record<string, string>,
) {
  // Update column basic info
  const updateColumnQuery = `UPDATE columns SET name = $1, width = $2, column_order = $3 WHERE id = $4 RETURNING *`;
  const columnResult = await client.query(updateColumnQuery, [
    col?.name ?? "",
    Math.ceil(col?.width ?? 100),
    col?.column_order ?? 0,
    columnId,
  ]);
  const updatedColumn = columnResult.rows[0];

  // Get existing inputs for this column
  const existingInputsQuery = `SELECT input_id FROM column_inputs WHERE column_id = $1`;
  const existingInputsResult = await client.query(existingInputsQuery, [columnId]);
  const existingInputIds = new Set(existingInputsResult.rows.map((i: any) => i.input_id));

  const incomingInputIds = new Set<string>();
  const inputs = Array.isArray(col?.inputs) ? col.inputs : [];

  // Process incoming inputs
  for (const input of inputs) {
    if (input.input_id && existingInputIds.has(input.input_id)) {
      // Update existing input
      await this.updateInputForColumn(client, input.input_id, input, inputTypeUuidCache);
      incomingInputIds.add(input.input_id);
    } else if (!input.input_id) {
      // Insert new input
      await this.insertInputForColumn(client, columnId, input, inputTypeUuidCache);
    }
  }

  // Delete inputs that are no longer in the data
  for (const existingInputId of existingInputIds) {
    if (existingInputId && !incomingInputIds.has(existingInputId.toString())) {
      await this.deleteInput(client, existingInputId.toString());
    }
  }
}

private async updateInputForColumn(
  client: any,
  inputId: string,
  input: Partial<any>,
  inputTypeUuidCache: Record<string, string>,
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

  const updateInputQuery = `UPDATE inputs SET type_id = $1, label = $2, input_entity_id = $3, show_label = $4, quantity_id = $5, show_quantity = $6, input_order = $7, is_bold = $8, font_size = $9, extra_note = $10, is_deleted = $11 WHERE id = $12 RETURNING *`;
  const inputResult = await client.query(updateInputQuery, [
    inputTypeUUID,
    input?.name ?? "",
    input?.input_entity_id ?? null,
    input?.show_label ? 1 : 0,
    input?.quantity_id ?? null,
    (input?.show_quantity ? 1 : 0),
    input?.input_order ?? 0,
    input?.is_bold ?? 0,
    input?.font_size ?? 16,
    input?.extra_note ?? "",
    input?.is_deleted ?? 0,
    inputId,
  ]);
  return inputResult.rows[0];
}

private async deleteSectionRow(client: any, rowId: string) {
  // Delete all inputs and column_inputs for this row
  const deleteInputsQuery = `
    DELETE FROM column_inputs
    WHERE input_id IN (
      SELECT i.id FROM inputs i
      LEFT JOIN column_inputs ci ON ci.input_id = i.id
      LEFT JOIN columns c ON c.id = ci.column_id
      LEFT JOIN rows_columns rc ON rc.column_id = c.id
      WHERE rc.row_id = $1
    )
  `;
  await client.query(deleteInputsQuery, [rowId]);

  // Delete all columns for this row
  const deleteColumnsQuery = `
    DELETE FROM rows_columns
    WHERE row_id = $1
  `;
  await client.query(deleteColumnsQuery, [rowId]);

  // Delete the row itself
  const deleteRowQuery = `
    DELETE FROM rows WHERE id = $1
  `;
  await client.query(deleteRowQuery, [rowId]);

  // Delete section_rows association
  const deleteSectionRowQuery = `
    DELETE FROM section_rows WHERE row_id = $1
  `;
  await client.query(deleteSectionRowQuery, [rowId]);
}

private async deleteColumn(client: any, columnId: string) {
  // Delete all inputs associated with this column
  const deleteInputsQuery = `
    DELETE FROM column_inputs
    WHERE input_id IN (
      SELECT i.id FROM inputs i
      LEFT JOIN column_inputs ci ON ci.input_id = i.id
      WHERE ci.column_id = $1
    )
  `;
  await client.query(deleteInputsQuery, [columnId]);

  // Delete rows_columns association
  const deleteRowColumnQuery = `
    DELETE FROM rows_columns WHERE column_id = $1
  `;
  await client.query(deleteRowColumnQuery, [columnId]);

  // Delete the column itself
  const deleteColumnQuery = `
    DELETE FROM columns WHERE id = $1
  `;
  await client.query(deleteColumnQuery, [columnId]);
}

private async deleteInput(client: any, inputId: string) {
  // Delete column_inputs association
  const deleteColumnInputQuery = `
    DELETE FROM column_inputs WHERE input_id = $1
  `;
  await client.query(deleteColumnInputQuery, [inputId]);

  // Delete the input itself
  const deleteInputQuery = `
    DELETE FROM inputs WHERE id = $1
  `;
  await client.query(deleteInputQuery, [inputId]);
}
  async getAllSectionInformationById(id: string | string[] , filters: Record<string, unknown> = {}) {
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
                 LEFT JOIN column_inputs col_input ON col_input.column_id = col.id
                 LEFT JOIN inputs i ON col_input.input_id = i.id
                 LEFT JOIN input_entities ie ON ie.id = i.input_entity_id
                 LEFT JOIN dropdown_entity_values dev ON dev.input_entity_id = ie.id
                 LEFT JOIN dropdown_options dopt ON dopt.id = dev.option_id
                 LEFT JOIN input_entity_values ievalue ON ievalue.input_entity_id = ie.id
                 LEFT JOIN input_types it ON it.id = ie.type_id
                 LEFT JOIN quantity_options quantopt ON quantopt.quantity_id = i.quantity_id
                 LEFT JOIN quantities quant ON quant.id = i.quantity_id
                 WHERE sec.id = $1 AND sec.is_deleted = 0
                 ORDER BY row.row_order NULLS LAST, col.column_order NULLS LAST, i.input_order NULLS LAST`;
    const params = [id];
    console.log(sql)
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
          inputs: [],
        };
        currentRow.columns.push(column);
      }

      if (column && item.input_id) {
        let input = column.inputs.find((existing: any) => existing.input_id === item.input_id);
        const dropdownOptionValue = { value: item.dropdown_option_value, id: item.dropdown_option_id };
        const quantityOptionValue = { value: item.quantity_option_value, id: item.quantity_option_id };
        const hasOptions = (input:Array<any>, options:any) => {
          if (!input) return false;
          let hasOption: Boolean = false;
          input.forEach((existing: any) => {
            if(existing.id == options.id) {
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
          column.inputs.push(input);
        } else{
          if(dropdownOptionValue && !hasOptions(input.dropdown_option_values, dropdownOptionValue)) {
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
