/* eslint-disable */
import {
  ApiException,
  ErrorResponse,
  FetchOptions,
} from './fetch.service.type';

const baseHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const isEmpty = (obj: unknown): boolean =>
  !obj || Object.keys(obj).length === 0;

const getPath = (path: string | undefined) => {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const createQueriesFromArray = (key: string, array: string[]): string => {
  return array.map((a) => `${key}=${a}`).join('&');
};

const createQuery = (
  query: Record<string, string | number | undefined | string[]>,
): string => {
  if (isEmpty(query)) {
    return '';
  }

  return `?${Object.keys(query)
    .filter((key) => query[key] !== null && query[key] !== undefined)
    .map((key) =>
      Array.isArray(query[key])
        ? createQueriesFromArray(key, query[key] as string[])
        : `${key}=${encodeURIComponent(query[key]! as string | number)}`,
    )
    ?.join('&')}`;
};

const createOption = <T>({
  method,
  body,
  headers,
}: Partial<FetchOptions<T>>) => ({
  method: method || 'GET',
  body: !isEmpty(body) ? JSON.stringify(body) : undefined,
  headers: { ...baseHeaders, ...{ ...(headers || {}) } },
});

const fetchService = async <TIn = never, TOut = never>({
  method,
  url,
  path,
  query,
  body,
  headers,
}: FetchOptions<TIn>): Promise<TOut> => {
  const http =
    typeof (<Window>window) === 'undefined' ? { fetch } : <Window>window;
  const url_ = `${url}${getPath(path)}${createQuery(query || {})}`;
  const options_ = createOption({ method, body, headers });

  const response = await http.fetch(
    url_ as string & FetchOptions<TIn>,
    options_,
  );
  return processResponse<TOut>(response);
};

const processResponse = <T>(response: Response): Promise<T> => {
  const status = response.status;
  const _headers: any = {};
  if (response.headers && response.headers.forEach) {
    response.headers.forEach((v: any, k: any) => (_headers[k] = v));
  }
  if (status === 200 || status === 201) {
    return response.text().then((_responseText) => {
      let result200: any = null;
      result200 = _responseText === '' ? null : <T>JSON.parse(_responseText);
      return result200;
    });
  } else if (status === 401) {
    return response.text().then((_responseText) => {
      let result401: any = null;
      result401 =
        _responseText === '' ? null : <ErrorResponse>JSON.parse(_responseText);
      return throwException(status, _responseText, _headers, result401);
    });
  } else if (status === 403) {
    return response.text().then((_responseText) => {
      let result403: any = null;
      result403 =
        _responseText === '' ? null : <ErrorResponse>JSON.parse(_responseText);
      return throwException(status, _responseText, _headers, result403);
    });
  } else if (status !== 200 && status !== 204) {
    return response.text().then((_responseText) => {
      return throwException(status, _responseText, _headers);
    });
  }
  return Promise.resolve<T>(<any>null);
};

function throwException(
  status: number,
  response: string,
  headers: { [key: string]: any },
  result?: any,
): any {
  if (result !== null && result !== undefined) throw result;
  else throw new ApiException(status, response, headers, null);
}

export { fetchService as fetch };
