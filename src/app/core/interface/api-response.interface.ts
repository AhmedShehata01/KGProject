export interface ApiResponse<T> {
  code: number;
  status: string;
  result: T;
}
