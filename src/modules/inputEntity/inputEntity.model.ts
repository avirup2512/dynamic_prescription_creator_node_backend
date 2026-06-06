import { BaseModel } from "../common/base.model";
import { InputEntity } from "../../types/entities";
import {redisClient} from "../../database/redis";
import { query,pool } from "../../database/client";
export class InputEntityModel extends BaseModel<InputEntity> {
  constructor() {
    super(
      "input_entities",
      "id",
      ['name', 'type_id', 'is_deleted'],
      ['name'],
    );
  }
  async createInputEntity(data: Partial<any>) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const inputTypeUUID = await this.getInputTypeUUIDByName(data.type);
      if (!inputTypeUUID) {
        throw new Error("Invalid input type");
      }
      const insertSql = `INSERT INTO input_entities (name, type_id, user_id) VALUES ($1, $2, $3) RETURNING *`;
      const params = [data.name, inputTypeUUID, data.user_id || null];
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
    const sql = `SELECT ie.*, it.name as type_name FROM input_entities ie JOIN input_types it ON ie.type_id = it.id WHERE (ie.user_id IS NULL OR ie.user_id = $1) AND ie.is_deleted = 0 AND (it.name = $2) ORDER BY ie.created_at DESC`;
    const params = [filters.user_id || null, filters.type_name ?? null];
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
    const sql = `SELECT ie.*, it.name as type_name, iev.id as input_entities_value_id, iev.value FROM input_entities ie JOIN input_types it ON ie.type_id = it.id JOIN input_entity_values as iev ON ie.id = iev.input_entity_id WHERE ie.id = $1 AND (ie.user_id IS NULL OR ie.user_id = $2) AND ie.is_deleted = 0 AND (it.name = $3)`;
    const params = [id, filters.user_id || null, filters.type_name ?? null];
    const result = await query<any>(sql, params);
    // await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
    return result;
  }
  async updateInputEntity(id: string | string[], data: Partial<any>) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const fields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        params.push(data.name);
      }
      if (fields.length === 0) {
        throw new Error("No valid fields to update");
      }
      params.push(id);
      console.log(data)
      const updateInputNameQuery = `UPDATE input_entities SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const updateInputNameResult = await client.query(updateInputNameQuery, params);
      const updatedEntity = (await updateInputNameResult).rows[0];
      const updateValueQuery = `UPDATE input_entity_values SET value = $1 WHERE input_entity_id = $2 RETURNING *`;
      const updateValueResult = await client.query(updateValueQuery, [data.value || "", id]);
      const updatedValue = (await updateValueResult).rows[0];
      await client.query("COMMIT");
      return { entity: updatedEntity, value: updatedValue };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
  async deleteInputEntity(id: string | string[]) {
    try {
      const deleteValueQuery = `UPDATE input_entities SET is_deleted = $1 WHERE id = $2 RETURNING *`;
      const deletedResult = await query(deleteValueQuery, [1, id]);
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
    const sql = `SELECT ie.*, it.name as type_name, dopt.id as dropdown_option_id, dopt.value FROM input_entities ie JOIN input_types it ON ie.type_id = it.id JOIN dropdown_entity_values dev ON ie.id = dev.input_entity_id JOIN dropdown_options dopt ON dev.option_id = dopt.id WHERE ie.id = $1 AND (ie.user_id IS NULL OR ie.user_id = $2) AND ie.is_deleted = 0`;
    const params = [id, filters.user_id || null];
    const result = await query<any>(sql, params);
    if (result && result.rows.length > 0) {
      result.rows[0].dropdown_options = result.rows.map((row: any) => ({ id: row.dropdown_option_id, value: row.value }));
    }
    // await redisClient.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    return result;
  }
    async createDropdownEntity(data: Partial<any>) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const inputTypeUUID = await this.getInputTypeUUIDByName(data.type);
      if (!inputTypeUUID) {
        throw new Error("Invalid input type");
      }
      const insertSql = `INSERT INTO input_entities (name, type_id, user_id) VALUES ($1, $2, $3) RETURNING *`;
      const params = [data.name, inputTypeUUID, data.user_id || null];
      const insertResult = await client.query(insertSql, params);
      const insertedEntity = (await insertResult).rows[0];
      const options: Array<any> = [];
      const insertedValue:Array<any> = [];
      if (data.value && data.value.length > 1)
      {
        await Promise.all(data.value.map(async (value: any) => {
          const addDropdownOptionQuery = `INSERT INTO dropdown_options (value) VALUES ($1) RETURNING *`;
          const addDropdownOptionResult = await client.query(addDropdownOptionQuery, [value.value || ""]);
          const result = (await addDropdownOptionResult).rows[0];
          options.push(result);
        }));
      };
      if(options.length === 0) {
        throw new Error("No valid dropdown options provided");
      }
      if (options.length > 0) {
        {
          options.forEach(async (option) => {
            const addDropdownOptionsJoinTableQuery = `INSERT INTO dropdown_entity_values (input_entity_id, option_id) VALUES ($1, $2)`;
            const addDropdownOptionsJoinTableResult = await client.query(addDropdownOptionsJoinTableQuery, [insertedEntity.id, option.id])
            insertedValue.push((await addDropdownOptionsJoinTableResult).rows[0]);
          });
        }
        await client.query("COMMIT");
        return { entity: insertedEntity, value: insertedValue };
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

    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        params.push(data.name);
      }

      let updatedEntity: any;
      if (fields.length > 0) {
        params.push(inputEntityId);
        const updateInputNameQuery = `UPDATE input_entities SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
        const updateInputNameResult = await client.query(updateInputNameQuery, params);
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
  }
