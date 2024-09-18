export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ExtractedValue<T> = T extends Record<string, infer U> ? U : never;
