export interface ApiResponse<T = any> {
  code: number;
  status: string;
  result: T;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  totalPages: number;
}
