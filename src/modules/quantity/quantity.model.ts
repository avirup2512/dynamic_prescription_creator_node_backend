import { BaseModel } from "../common/base.model";
import { Quantity } from "../../types/entities";
import { query,pool } from "../../database/client";

export class QuantityModel extends BaseModel<Quantity> {
  constructor() {
    super(
      "quantities",
      "id",
      ['name'],
      ['name'],
    );
  }
  async findAllQuantity( filters: Record<string, unknown> = {}) {
      // const cacheKey = `inputEntity:join:${JSON.stringify(filters)}`;
      // const cachedResult = await redisClient.get(cacheKey);
      // if (cachedResult) {
      //   return JSON.parse(cachedResult);
      // }
      const sql = `SELECT * FROM quantities  WHERE (user_id IS NULL OR user_id = $1) AND is_deleted = 0 ORDER BY created_at DESC`;
      const params = [filters.user_id || null];
      const result = await query<any>(sql, params);
      // await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
      return result;
    }
  async createQuantity(data: Partial<any>){
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const insertSql = `INSERT INTO quantities (name, user_id) VALUES ($1, $2) RETURNING *`;
      const params = [data.name, data.user_id || null];
      const insertResult = client.query(insertSql, params);
      const insertedEntity = (await insertResult).rows[0];
      const options: Array<any> = [];
      const insertedValue:Array<any> = [];
      if (data.value && data.value.length > 1)
      {
        await Promise.all(data.value.map(async (option: any) => {
          const adQuantityOptionQuery = `INSERT INTO quantity_options (quantity_id,value) VALUES ($1,$2) RETURNING *`;
          const adQuantityOptionResult = await client.query(adQuantityOptionQuery, [insertedEntity.id,option.value || ""]);
          const result = (await adQuantityOptionResult).rows[0];
          options.push(result);
        }));
      };
      if(options.length === 0) {
        throw new Error("No valid dropdown options provided");
      }
       await client.query("COMMIT");
      return { entity: insertedEntity, value: options };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
     
  }
  async getAllQuantityInputInformationById(id: string | string[], filters: Record<string, unknown> = {}) { 
    try {
      console.log(id)
      const sql = `SELECT q.*, qo.value, qo.id as value_id FROM quantities q JOIN quantity_options qo ON q.id = qo.quantity_id WHERE q.id = $1 AND (q.user_id IS NULL OR q.user_id = $2) AND q.is_deleted = 0`;
      const params = [id, filters.user_id || null];
      const result = await query<any>(sql, params);
       if (result && result.rows && result.rows.length)
      {
        result.rows[0].quantity_values = result.rows.map((row: any) => { return {id: row.value_id, value:row.value}})
      }
      // await redisClient.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
      return result;
    } catch (error) {
      
    }
  }
   async updateQuantityEntity(id: string | string[], data: Partial<any>) {
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
      const updateQuantityNameQuery = `UPDATE quantities SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const updateQuantityNameResult = await client.query(updateQuantityNameQuery, params);
      const updatedEntity = (await updateQuantityNameResult).rows[0];
      const options: Array<any> = [];
      const insertedValue: Array<any> = [];
      if (data.existingOptions && data.existingOptions.length )
      {
        await Promise.all(data.existingOptions.map(async (option: any) => {
          const updateQuantityOptionQuery = `UPDATE quantity_options SET value = $1 WHERE id = $2 RETURNING *`;
          const updateQuantityOptionResult = await client.query(updateQuantityOptionQuery, [option.value || "", option.id]);
          const result = (await updateQuantityOptionResult).rows[0];
          options.push(result);
        }));
      };
      if (data.newAddedOptions && data.newAddedOptions.length )
      {
        await Promise.all(data.newAddedOptions.map(async (option: any) => {
          const adQuantityOptionQuery = `INSERT INTO quantity_options (quantity_id,value) VALUES ($1,$2) RETURNING *`;
          const adQuantityOptionResult = await client.query(adQuantityOptionQuery, [updatedEntity.id,option.value || ""]);
          const result = (await adQuantityOptionResult).rows[0];
          options.push(result);
        }));
      };
      if (data.removedOptionIds && data.removedOptionIds.length )
      {
        await Promise.all(data.removedOptionIds.map(async (id: any) => {
          const deleteQuantityOptionQuery = `DELETE FROM quantity_options WHERE id = $1 RETURNING *`;
          const deleteQuantityOptionResult = await client.query(deleteQuantityOptionQuery, [id]);
          const result = (await deleteQuantityOptionResult).rows[0];
          options.push(result);
        }));
      };
      if(options.length === 0) {
        throw new Error("No valid dropdown options provided");
      }
      await client.query("COMMIT");
      return { entity: updatedEntity, value: options };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
  async deleteQuantity(id: string | string[]) {
    try {
      const deleteValueQuery = `UPDATE quantities SET is_deleted = $1 WHERE id = $2 RETURNING *`;
      const deletedResult = await query(deleteValueQuery, [1, id]);
      return deletedResult;
    } catch (error) {
      throw error;
    }
  }
}
