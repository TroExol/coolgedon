/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentProps, FC } from 'react';

export type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;

export type ComponentProp<
    T extends FC<any>,
    U extends keyof ComponentProps<T>
> = ComponentProps<T>[U];
