"use client";

// Reshaped Pagination — https://www.reshaped.so/docs/components/pagination
// Precompiled bundle: no custom PostCSS configuration is required.
// Render inside <Reshaped theme="slate" scoped> to isolate the theme.
import { Pagination } from "reshaped/bundle";
import type { PaginationProps } from "reshaped/bundle";
import "reshaped/bundle.css";
import "reshaped/themes/slate/theme.css";

export type { PaginationProps };
export { Pagination };
export default Pagination;
