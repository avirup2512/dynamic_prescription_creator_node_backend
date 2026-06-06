export function successResponse(data: unknown, message = "Success") {
  return { success: true, message, data };
}

export function paginatedResponse(data: any, page: number, limit: number, total: number) {
  return { success: true, data, page, limit, total };
}

export function errorResponse(message = "Something went wrong", statusCode = 500) {
  return { success: false, message, statusCode };
}
