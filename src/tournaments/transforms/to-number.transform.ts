import type { TransformFnParams } from 'class-transformer';

export function toNumber(params: TransformFnParams): unknown {
  const value: unknown = params.value;
  const result = typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;
  return result;
}
