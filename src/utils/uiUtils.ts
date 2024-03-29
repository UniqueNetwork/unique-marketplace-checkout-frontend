import { useEffect, useRef } from 'react';
import { SortQuery, TableRowProps } from '@unique-nft/ui-kit';

export const usePrevious = <T>(value: T): T => {
  const ref: any = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

/*
 * Gets the value at `path` of `object`.
 * Alternative to lodash.get
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }] };
 * get(object, 'a[0].b.c') => 3
 * */
export const getDeepValue = <T extends Record<string, any>>(
  object: T,
  path: string
) =>
  path
  .split(/[.[\]'"]/)
  .filter((p) => p)
  .reduce((o, p) => {
    return o ? o[p] : undefined;
  }, object);

export const sortData = (
  data: TableRowProps[],
  query: SortQuery,
  compareFunc?: (a: any, b: any) => number
) => {
  const sorted = [...data].sort((a: any, b: any) =>
    compareFunc
      ? compareFunc(a[query.field], b[query.field])
      : (a[query.field] as string)?.localeCompare(
        b[query.field] as string
      )
  );
  return query.mode === 0
    ? data
    : query.mode === 1
      ? sorted.reverse()
      : sorted;
};

export const getRemains = (count: number) => {
  const max = count >= 1000 ? 10 ** count.toString().length : 1000;
  return [max - count, max];
};
