/**
 * Standard API Response Interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  statusCode?: number;
}

/**
 * Success Response Wrapper
 */
export class ApiSuccess<T = any> {
  success = true;
  data: T;
  message: string;
  statusCode: number;

  constructor(data: T, message: string = "Success", statusCode: number = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
    };
  }
}

/**
 * Error Class for API Errors
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";

    // Maintain prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Legacy response functions
 */
export function successResponse(data: unknown, message = "Success") {
  return { success: true, message, data };
}

export function paginatedResponse(data: any, page: number, limit: number, total: number) {
  return { success: true, data, page, limit, total };
}

export function errorResponse(message = "Something went wrong", statusCode = 500) {
  return { success: false, message, statusCode };
}
