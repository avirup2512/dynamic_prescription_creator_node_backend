import { BaseModel } from "../common/base.model";
import { InputEntity } from "../../types/entities";
import {redisClient} from "../../database/redis";
import { query, pool } from "../../database/client";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

dotenv.config();
export class InputEntityModel extends BaseModel<InputEntity> {
  groqClient;
  openRouterClient;
  constructor() {
    super(
      "input_entities",
      "id",
      ['name', 'type_id', 'is_deleted'],
      ['name'],
    );
    this.groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });
    this.openRouterClient = new OpenAI({
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1"
    });
  }
  sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async createInputEntity(data: Partial<any>) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const inputTypeUUID = await this.getInputTypeUUIDByName(data.type);
      if (!inputTypeUUID) {
        throw new Error("Invalid input type");
      }
      const insertSql = `INSERT INTO input_entities (name, type_id, user_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *`;
      const params = [data.name, inputTypeUUID, data.user_id, data.user_id];
      const insertResult = client.query(insertSql, params);
      const insertedEntity = (await insertResult).rows[0];
      const addValurQuery = `INSERT INTO input_entity_values (input_entity_id, value) VALUES ($1, $2) RETURNING *`;
      const addValueResult = await client.query(addValurQuery, [insertedEntity.id, data.value || ""]);
      const insertedValue = (await addValueResult).rows[0];
      await client.query("COMMIT");
      return { entity: insertedEntity, value: insertedValue };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
  async getInputTypeUUIDByName(name: string) {
    const cachedInputId = await redisClient.get(`inputType:${name}`);
    if(cachedInputId) {
      return cachedInputId;
    }
    const result = await this.findOneByField("name", name, "input_types");
    if(result) {
      await redisClient.set(`inputType:${name}`, result.id, {EX: 3600}); // Cache for 1 hour
      return result.id;
    }
    return null;
  }
  async findAllInputEntity( filters: Record<string, unknown> = {}) {
    const cacheKey = `inputEntity:join:${JSON.stringify(filters)}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    const sql = `SELECT ie.*, it.name as type_name FROM input_entities ie JOIN input_types it ON ie.type_id = it.id WHERE (ie.created_by = $1) AND ie.is_deleted = 0 AND (it.name = $2) ORDER BY ie.created_at DESC`;
    const params = [filters.user_id, filters.type_name ?? null];
    const result = await query<any>(sql, params);
    // await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
    return result;
  }
  async getAllInputInformationById(id: string | string[] , filters: Record<string, unknown> = {}) {
    const cacheKey = `inputEntity:join:id:${id}:${JSON.stringify(filters)}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    console.log(id);
    const sql = `SELECT ie.*, it.name as type_name, iev.id as input_entities_value_id, iev.value FROM input_entities ie JOIN input_types it ON ie.type_id = it.id JOIN input_entity_values as iev ON ie.id = iev.input_entity_id WHERE ie.id = $1 AND (ie.user_id = $2) AND ie.is_deleted = 0 AND (it.name = $3)`;
    const params = [id, filters.user_id, filters.type_name ?? null];
    const result = await query<any>(sql, params);
    // await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
    return result;
  }
  async updateInputEntity(id: string | string[], data: Partial<any>) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const fields: string[] = [];
      let paramIndex = 1;
      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
      }
      if (fields.length === 0) {
        throw new Error("No valid fields to update");
      }
      const updateInputNameQuery = `UPDATE input_entities SET ${fields.join(", ")} WHERE id = $1 AND created_by=$2 RETURNING *`;
      const updateInputNameResult = await client.query(updateInputNameQuery, [id,data.user_id]);
      const updatedEntity = (await updateInputNameResult).rows[0];
      const updateValueQuery = `UPDATE input_entity_values SET value = $1 WHERE input_entity_id = $2 RETURNING *`;
      const updateValueResult = await client.query(updateValueQuery, [data.value || "", id]);
      const updatedValue = (await updateValueResult).rows[0];
      await client.query("COMMIT");
      return { entity: updatedEntity, value: updatedValue };
    } catch (error) {
      console.log(error)
      await client.query("ROLLBACK");
      throw error;
    }
  }
  async deleteInputEntity(id: string | string[], user_id:string) {
    try {
      const deleteValueQuery = `UPDATE input_entities SET is_deleted = $1 WHERE id = $2 AND created_by=$3 RETURNING *`;
      const deletedResult = await query(deleteValueQuery, [1, id,user_id]);
      return deletedResult;
    } catch (error) {
      throw error;
    }
  }
  async getAllDropdownInputInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
    const cacheKey = `dropdownInputEntity:join:id:${id}:${JSON.stringify(filters)}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    const sql = `SELECT ie.*, it.name as type_name, dopt.id as dropdown_option_id, dopt.value FROM input_entities ie JOIN input_types it ON ie.type_id = it.id JOIN dropdown_entity_values dev ON ie.id = dev.input_entity_id JOIN dropdown_options dopt ON dev.option_id = dopt.id WHERE ie.id = $1 AND ( ie.user_id = $2) AND ie.is_deleted = 0`;
    const params = [id, filters.user_id];
    const result = await query<any>(sql, params);
    if (result && result.rows.length > 0) {
      result.rows[0].dropdown_options = result.rows.map((row: any) => ({ id: row.dropdown_option_id, value: row.value }));
    }
    // await redisClient.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    return result;
  }
  async createDropdownEntity(data: Partial<any>,isGlobal:number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inputTypeUUID = await this.getInputTypeUUIDByName(data.type);
      if (!inputTypeUUID) {
        throw new Error("Invalid input type");
      }
      const insertSql = `INSERT INTO input_entities (name, type_id, user_id, created_by, is_global) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      const params = [data.name, inputTypeUUID, data.user_id,data.user_id,isGlobal ?? 0];
      const insertResult = await client.query(insertSql, params);
      const insertedEntity = (await insertResult).rows[0];
      let options: Array<any> = [];
      const insertedValue:Array<any> = [];
      if (data.value && data.value.length)
      {
        options = await Promise.all(
        data.value.map(async (value: any) => {
          const query =
            `INSERT INTO dropdown_options (value)
            VALUES ($1)
            RETURNING *`;

          const result = await client.query(query, [value.value || ""]);
          return result.rows[0];
        })
      );
      };
      if(options.length === 0) {
        throw new Error("No valid dropdown options provided");
      }
      if (options.length > 0) {
        {
          for (let x = 0; x < options.length; x++)
          {
            const addDropdownOptionsJoinTableQuery = `INSERT INTO dropdown_entity_values (input_entity_id, option_id) VALUES ($1, $2)`;
            const
              addDropdownOptionsJoinTableResult = await client.query(addDropdownOptionsJoinTableQuery, [insertedEntity.id, options[x].id])
            insertedValue.push((await addDropdownOptionsJoinTableResult).rows[0]);
          }
        }
        await client.query("COMMIT");
        return { entity: insertedEntity, value: options };
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }finally {
      client.release();
    }
  }
  async updateDropdownEntity(id: string | string[], data: Partial<any>) {
    const client = await pool.connect();
    const inputEntityId = Array.isArray(id) ? id[0] : id;
    console.log(inputEntityId)
    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      let paramIndex = 1;
      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
      }
      let updatedEntity: any;
       if (fields.length > 0) {
        const updateInputNameQuery = `UPDATE input_entities SET name=$1 WHERE id = $2 AND created_by = $3 RETURNING *`;
        const updateInputNameResult = await client.query(updateInputNameQuery, [data.name,inputEntityId,data.user_id]);
        updatedEntity = updateInputNameResult.rows[0];
      } else {
        const entityResult = await client.query(`SELECT * FROM input_entities WHERE id = $1`, [inputEntityId]);
        updatedEntity = entityResult.rows[0];
      }

      if (!updatedEntity) {
        throw new Error("Input entity not found");
      }

      const updatedOptions: any[] = [];
      const insertedOptions: any[] = [];
      const deletedOptionIds = Array.isArray(data.removedOptionIds) ? data.removedOptionIds : [];

      if (Array.isArray(data.existingOptions) && data.existingOptions.length > 0) {
        const updatePromises = data.existingOptions.map((option: any) =>
          client.query(`UPDATE dropdown_options SET value = $1 WHERE id = $2 RETURNING *`, [option.value || "", option.id])
        );
        const results = await Promise.all(updatePromises);
        results.forEach((result) => updatedOptions.push(...result.rows));
      }

      if (Array.isArray(data.newAddedOptions) && data.newAddedOptions.length > 0) {
        const insertPromises = data.newAddedOptions.map((option: any) =>
          client.query(`INSERT INTO dropdown_options (value) VALUES ($1) RETURNING *`, [option.value || ""])
        );
        const insertResults = await Promise.all(insertPromises);
        const newOptionRows = insertResults.flatMap((result) => result.rows);
        insertedOptions.push(...newOptionRows);

        const joinPromises = newOptionRows.map((option: any) =>
          client.query(`INSERT INTO dropdown_entity_values (input_entity_id, option_id) VALUES ($1, $2) RETURNING *`, [inputEntityId, option.id])
        );
        await Promise.all(joinPromises);
      }

      if (deletedOptionIds.length > 0) {
        await client.query(
          `DELETE FROM dropdown_entity_values WHERE input_entity_id = $1 AND option_id = ANY($2::uuid[])`,
          [inputEntityId, deletedOptionIds],
        );
        await client.query(`DELETE FROM dropdown_options WHERE id = ANY($1::uuid[])`, [deletedOptionIds]);
      }

      await client.query("COMMIT");
      return {
        entity: updatedEntity,
        updatedOptions,
        insertedOptions,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async AddSingleDropdownEntity(id: string | string[], data: Partial<any>) {
    const client = await pool.connect();
    const inputEntityId = id;

    try {
      await client.query("BEGIN");

      if (data.option) {
        const newOption = await client.query(`INSERT INTO dropdown_options (value) VALUES ($1) RETURNING *`, [data.option?.value || ""])
        const newOptionRow = (await newOption).rows[0];
        if(newOptionRow?.id)
        {
          const newOptionAdded = await client.query(`INSERT INTO dropdown_entity_values (input_entity_id, option_id) VALUES ($1, $2) RETURNING *`, [inputEntityId, newOptionRow.id])
        }
        await client.query("COMMIT");
        return {
          newOption
        };
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async callGroq(messages:any) {
  const response = await this.groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: {
      type: "json_object"
    },
    messages
  });

  return response.choices[0].message.content;
  }
  async callOpenRouter(messages:any) {
    const response = await this.openRouterClient.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },
      messages
    });

    return response.choices[0].message.content;
  }
  async getDropdownContentFromAI(messages: any, retries = 3) {
  const content = `I will provide you with the name of an item, usually a food/medicine item. Your task is to identify its common food category and suggest at least 10 other commonly used, everyday items belonging to the same category.
            For example:
            - Input: "Jeera"
            - Category: "Spices"
            - Suggested items: Methi, Coriander, Turmeric, Black Pepper, Cardamom, Clove, Cinnamon, Fennel, Mustard Seeds, Bay Leaf, etc.
            Requirements:
            1. Suggestions must be common and used in daily life.
            2. All suggested items should belong to the same food group as the input item.
            3. Return only valid JSON.
            4. "name" should contain the food group/category name.
            5. "type_name" should always be "INPUT_TYPE_2".
            6. "is_deleted" should always be 0.
            7. "dropdown_options" should be an array of objects with a single "value" property.
            8. Include at least 10 items.
            9. include the input item itself in the suggestions.
            10. If the input item is not a food item, infer the most appropriate category and provide common related items.

            Input Item: ${messages}

            Expected JSON format:
            {
              "name": "<Food Group Name>",
              "type_name": "INPUT_TYPE_2",
              "is_deleted": 0,
              "dropdown_options": [
                { "value": "Item 1" },
                { "value": "Item 2" },
                { "value": "Item 3" },
                { "value": "Item 4" },
                { "value": "Item 5" },
                { "value": "Item 6" },
                { "value": "Item 7" },
                { "value": "Item 8" },
                { "value": "Item 9" },
                { "value": "Item 10" }
              ]
            }
            Return only the JSON object without markdown, code fences, or any explanation.`
  try {
    console.log("Using Groq...");

    return await this.callGroq([{role:'user',content}]);
  } catch (error:any) {
    console.error("Groq failed:", error.message);
    for (let i = 0; i < retries; i++) {
      try {
        console.log("Falling back to OpenRouter...");

        return await this.callOpenRouter([{content}]);
      } catch (err:any) {
        console.error(
          `OpenRouter attempt ${i + 1} failed:`,
          err.message
        );

        await this.sleep(Math.pow(2, i) * 1000);
      }
    }
    throw new Error("All providers failed.");
  }
  }
  async searchGlobalDropdownOptionsInDB(searchText: any)
  {
    try {
      //const query = `WITH matched_entity AS (
//     -- Priority 1: Match category name
//     SELECT
//         ie.id,
//         ie.name,
//         1 AS priority
//     FROM input_entities ie
//     WHERE LOWER(ie.name) = LOWER($1)
//     AND ie.is_global = 1
//     AND ie.is_deleted = 0

//     UNION ALL

//     -- Priority 2: Match dropdown option
//     SELECT
//         ie.id,
//         ie.name,
//         2 AS priority
//     FROM input_entities ie
//     JOIN dropdown_entity_values dev
//         ON dev.input_entity_id = ie.id
//     JOIN dropdown_options dopt
//         ON dopt.id = dev.option_id
//     WHERE LOWER(dopt.value) = LOWER($1)
// )

// SELECT
//     ie.id,
//     ie.name,
//     json_agg(
//         json_build_object(
//             'id', dopt.id,
//             'value', dopt.value
//         )
//         ORDER BY dopt.value
//     ) AS dropdown_options
// FROM (
//     SELECT *
//     FROM matched_entity
//     ORDER BY priority
//     LIMIT 1
// ) me
// JOIN input_entities ie
//     ON ie.id = me.id
// JOIN dropdown_entity_values dev
//     ON dev.input_entity_id = ie.id
// JOIN dropdown_options dopt
//     ON dopt.id = dev.option_id
// GROUP BY
//     ie.id,
//     ie.name;
// `;
      const query_2 = `WITH matched_entity AS (
        -- Priority 1: Match category name
        SELECT
            gde.id,
            gde.name,
            1 AS priority
        FROM global_dropdown_entities gde
        WHERE LOWER(gde.name) = LOWER($1)
        AND gde.is_deleted = 0

        UNION ALL

        -- Priority 2: Match dropdown option
        SELECT
            gde.id,
            gde.name,
            2 AS priority
        FROM global_dropdown_entities gde
        JOIN global_dropdown_entity_options gdeo
            ON gdeo.dropdown_entity_id = gde.id
        JOIN global_dropdown_options gdopt
            ON gdopt.id = gdeo.option_id
        WHERE LOWER(gdopt.value) = LOWER($1)
    )

    SELECT
        gde.id,
        gde.name,
        json_agg(
            json_build_object(
                'id', gdopt.id,
                'value', gdopt.value
            )
            ORDER BY gdopt.value
        ) AS global_dropdown_options
    FROM (
        SELECT *
        FROM matched_entity
        ORDER BY priority
        LIMIT 1
    ) me
    JOIN global_dropdown_entities gde
        ON gde.id = me.id
    JOIN global_dropdown_entity_options gdeo
        ON gdeo.dropdown_entity_id = gde.id
    JOIN global_dropdown_options gdopt
        ON gdopt.id = gdeo.option_id
    GROUP BY
        gde.id,
        gde.name;
      `;
      const result = await pool.query(query_2, [searchText]);
      console.log(searchText)
      console.log("RESULT")
      console.log(result);
      return result.rows[0];
    } catch (error) {
      console.log(error)
    }
  }
  async searchGlobalDropdownCategory(name:any)
  {
    const client = await pool.connect();
    try {
      const searchQuery = "SELECT * FROM global_dropdown_entities WHERE name=$1";
      const searchedResult = await client.query(searchQuery, [name]);
      console.log(searchedResult)
      if (searchedResult)
      {
        const id = searchedResult.rows[0].id;
        const availableOptionQuery = "SELECT gdo.value FROM global_dropdown_options gdo JOIN global_dropdown_entity_options gdeo ON gdo.id = gdeo.option_id WHERE gdeo.dropdown_entity_id= $1";
        const availableOptions = await client.query(availableOptionQuery, [id]);
        return {availableOptions:availableOptions?.rows, entity:searchedResult.rows[0]};
      }
    } catch (error) {
      
    }
  }
  async createGlobalDropdown(data: any)
  {
    const client = await pool.connect();
    try {
      const exstingDropdown:any = await this.searchGlobalDropdownCategory(data.name);
      console.log("AVAILABLE")
      console.log(exstingDropdown);
      let newOptions: any = data?.value;
      if (exstingDropdown && exstingDropdown?.availableOptions && exstingDropdown?.availableOptions.length)
      {
        const availableSet: Set<string> = new Set();
        for (let x = 0; x < exstingDropdown.availableOptions.length; x++)
        {
          availableSet.add(exstingDropdown.availableOptions[x].value.toLowerCase())
        }
        newOptions = data.value.map((value: any) => !availableSet.has(value.value.toLowerCase()) ? value : null).filter
          ((value: any) => value != null)
        
      }
      console.log(data.value);
      console.log(newOptions);
      await client.query("BEGIN");
      const inputTypeUUID = await this.getInputTypeUUIDByName(data.type);
      if (!inputTypeUUID) {
        throw new Error("Invalid input type");
      }
      let dropdownEntity = exstingDropdown?.entity;
      if (!dropdownEntity)
      {
        const insertSql = `INSERT INTO global_dropdown_entities (name, type_id, created_by) VALUES ($1, $2, $3) RETURNING *`;
        const params = [data.name, inputTypeUUID, data.user_id];
        const insertResult = await client.query(insertSql, params);
        dropdownEntity = (await insertResult).rows[0];
      }
      let options: Array<any> = [];
      const insertedValue:Array<any> = [];
      if (newOptions && newOptions.length)
      {
        options = await Promise.all(
        newOptions.map(async (value: any) => {
          const query =
            `INSERT INTO global_dropdown_options (value)
            VALUES ($1)
            RETURNING *`;

          const result = await client.query(query, [value.value || ""]);
          return result.rows[0];
        })
      );
      };
      if(options.length === 0) {
        throw new Error("No valid dropdown options provided");
      }
      if (options.length > 0) {
        {
          for (let x = 0; x < options.length; x++)
          {
            const addDropdownOptionsJoinTableQuery = `INSERT INTO global_dropdown_entity_options (dropdown_entity_id, option_id) VALUES ($1, $2)`;
            const
              addDropdownOptionsJoinTableResult = await client.query(addDropdownOptionsJoinTableQuery, [dropdownEntity?.id, options[x].id])
            insertedValue.push((await addDropdownOptionsJoinTableResult).rows[0]);
          }
        }
        await client.query("COMMIT");
        return { entity: dropdownEntity, value: options };
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }finally {
      client.release();
    }
  }
  }
