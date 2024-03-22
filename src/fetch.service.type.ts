/* eslint-disable @typescript-eslint/no-explicit-any */
export type FetchOptions<T> = {
  method?: 'POST' | 'PATCH' | 'PUT' | 'GET' | 'DELETE';
  path?: string;
  body?: T;
  url: string;
  headers?: { [key: string]: string };
  query?: Record<string, string | number | undefined | string[]>;
};

export interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  'x-request-id': string;
}

export class ApiException extends Error {
  status: number;
  response: string;
  headers: { [key: string]: any };
  result: any;

  constructor(status: number, response: string, headers: { [key: string]: any }, result: any) {
    super();

    this.status = status;
    this.response = response;
    this.headers = headers;
    this.result = result;
  }

  protected isApiException = true;

  static isApiException(obj: any): obj is ApiException {
    return obj.isApiException === true;
  }
}
