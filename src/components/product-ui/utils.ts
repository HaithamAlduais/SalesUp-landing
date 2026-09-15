/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: packages/ui/src/lib/utils.ts
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


