import { QueryResultRow,Submittable } from "pg";
import { query } from "../../database/client";
import { mapKeysToSnakeCase } from "../../utils/case";

export interface ListOptions {
  limit?: number;
  page?: number;
  search?: string;
  filters?: Record<string, unknown>;
}

export class BaseModel<T extends any[] | QueryResultRow | Submittable> {
  constructor(
    public tableName: string,
    public primaryKey = "id",
    public insertColumns: string[] = [],
    public searchColumns: string[] = [],
  ) {}

  private buildFilterClause(filters: Record<string, unknown>, params: any[]) {
    const clauses: string[] = [];
    Object.entries(filters).forEach(([key, value]) => {
      params.push(value);
      clauses.push(`${key} = $${params.length}`);
    });
    return clauses;
  }

    async create(item: Partial<T>) {
      console.log("Creating item:", item);
    const snake = mapKeysToSnakeCase(item as Record<string, any>);
    const columns = Object.keys(snake).filter((key) => this.insertColumns.includes(key));
    const values = columns.map((_, index) => `$${index + 1}`);
    const params = columns.map((column) => snake[column]);
    const sql = `INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${values.join(", ")}) RETURNING *`;
    const result = await query<T>(sql, params);
    return result.rows[0];
  }

  async findAll(options: ListOptions = {}) {
    const { limit = 20, page = 1, search, filters = {} } = options;
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const clauses: string[] = [];

    if (search && this.searchColumns.length) {
      const searchClause = this.searchColumns
        .map((field) => {
          params.push(`%${search}%`);
          return `${field} ILIKE $${params.length}`;
        })
        .join(" OR ");
      clauses.push(`(${searchClause})`);
    }

    const filterClause = this.buildFilterClause(filters, params);
    clauses.push(...filterClause);

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const results = await query<T>(
      `SELECT * FROM ${this.tableName} ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );
    const totalResult = await query<{ count: string }>(`SELECT COUNT(*) FROM ${this.tableName} ${where}`, params);
    return {
      items: results.rows,
      total: Number(totalResult.rows[0]?.count || 0),
      page,
      limit,
    };
  }

  async findById(id: string) {
    const result = await query<T>(`SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`, [id]);
    return result.rows[0];
  }

    findOneByField(field: string, value: unknown, tableName = this.tableName) {
    return query<T>(`SELECT * FROM ${tableName} WHERE ${field} = $1`, [value]).then((result) => result.rows[0]);
  }
  async update(id: string | string[], item: Partial<T>) {
    const snake = mapKeysToSnakeCase(item as Record<string, any>);
    const keys = Object.keys(snake).filter((key) => this.insertColumns.includes(key));
    if (!keys.length) {
      throw new Error("No valid fields provided for update");
    }
    const assignments = keys.map((key, index) => `${key} = $${index + 1}`);
    const params = keys.map((key) => snake[key]);
    if (Array.isArray(id)) {
      params.push(...id);
    } else {
      params.push(id);
    }

    const sql = `UPDATE ${this.tableName} SET ${assignments.join(", ")}, updated_at = now() WHERE ${this.primaryKey} = $${params.length} RETURNING *`;
    const result = await query<T>(sql, params);
    return result.rows[0];
  }

  async delete(id: string | string[]) {
    const result = await query<T>(`DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`, [id]);
    return result.rows[0];
  }
    async findAllWithJoin(tableName: string | string[], localKey: string | string[], foreignKey: string | string[], filters: Record<string, unknown> = {}) {
        const params: any[] = [];
        const filterClause = this.buildFilterClause(filters, params);
        const where = filterClause.length ? `WHERE ${filterClause.join(" AND ")}` : "";
        const sql = `SELECT * FROM ${this.tableName} JOIN ${Array.isArray(tableName) ? tableName.join(" JOIN ") : tableName} ON ${this.tableName}.${localKey} = ${Array.isArray(tableName) ? tableName.map((tn) => `${tn}.${foreignKey}`).join(" AND ") : `${tableName}.${foreignKey}`} ${where}`;
        console.log("Executing SQL:", sql, "with params:", params);
        const result = await query<any>(sql, params);
        return result.rows;
    }
    async multipleJoins(joins: { tableName: string; localKey: string; foreignKey: string }[], filters: Record<string, unknown> = {}) {
        const params: any[] = [];
        const filterClause = this.buildFilterClause(filters, params);
        const where = filterClause.length ? `WHERE ${filterClause.join(" AND ")}` : "";
        let sql = `SELECT * FROM ${this.tableName}`;
        joins.forEach((join) => {
            sql += ` JOIN ${join.tableName} ON ${this.tableName}.${join.localKey} = ${join.tableName}.${join.foreignKey}`;
        });
        sql += ` ${where}`;
        const result = await query<T>(sql, params);
        return result.rows;
    }
}
