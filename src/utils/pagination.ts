export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
}

export function normalizePagination(query: any) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    search: typeof query.search === "string" ? query.search : undefined,
    filters: typeof query.filters === "object" ? query.filters : undefined,
  };
}
