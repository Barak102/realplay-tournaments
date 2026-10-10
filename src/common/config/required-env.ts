export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(name + ' environment variable is required');
  }
  const result = value;
  return result;
}
