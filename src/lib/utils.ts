import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export const stringifyBigInt = (obj: any) => {
  return JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? value.toString() : value));
};
