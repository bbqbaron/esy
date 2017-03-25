/**
 * @flow
 */

import * as crypto from 'crypto';
import resolveBase from 'resolve';
import * as fs from '../util/fs';

export function mapObject<S: *, F: (*) => *>(obj: S, f: F): $ObjMap<S, F> {
  const nextObj = {};
  for (const k in obj) {
    nextObj[k] = f(obj[k], k);
  }
  return nextObj;
}

export function flattenArray<T>(arrayOfArrays: Array<Array<T>>): Array<T> {
  return [].concat(...arrayOfArrays);
}

export function hash(str: string): string {
  const hash = crypto.createHash('sha1');
  hash.update(str);
  return hash.digest('hex');
}

export function setDefaultToMap<K, V>(
  map: Map<K, V>,
  key: K,
  makeDefaultValue: () => V,
): V {
  const existingValue = map.get(key);
  if (existingValue == null) {
    const value = makeDefaultValue();
    map.set(key, value);
    return value;
  } else {
    return existingValue;
  }
}

export function resolve(packageName: string, baseDirectory: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolveBase(packageName, {basedir: baseDirectory}, (err, resolution) => {
      if (err) {
        reject(err);
      } else {
        resolve(resolution);
      }
    });
  });
}

export async function resolveToRealpath(
  packageName: string,
  baseDirectory: string,
): Promise<string> {
  const resolution = await resolve(packageName, baseDirectory);
  return fs.realpath(resolution);
}

export function normalizePackageName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/@/g, '')
      .replace(/_+/g, matched => matched + '__')
      .replace(/\//g, '__slash__')
      // Add two underscores to every group we see.
      .replace(/\./g, '__dot__')
      .replace(/\-/g, '_')
  );
}

export function filterMap<K, V>(map: Map<K, V>, filter: (V, K) => boolean): Map<K, V> {
  const res: Map<K, V> = new Map();
  for (const [k, v] of map.entries()) {
    if (filter(v, k)) {
      res.set(k, v);
    }
  }
  return res;
}

export function mergeIntoMap<K, V>(
  src: Map<K, V>,
  from: Map<K, V>,
  merge?: (prev: V, override: V, name: K) => V,
) {
  for (const [k, v] of from.entries()) {
    const prev = src.get(k);
    if (prev != null && merge) {
      src.set(k, merge(prev, v, k));
    } else {
      src.set(k, v);
    }
  }
}
