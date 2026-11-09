"use client";

import { Reshaped } from "reshaped/bundle";
import Pagination from "@/components/ui/reshaped-pagination";

export default function Demo() {
  return (
    <Reshaped theme="slate" scoped>
      <div style={{ margin: "0 auto", padding: 24, display: "flex", justifyContent: "center" }}>
        <Pagination
          total={10}
          previousAriaLabel="Previous page"
          nextAriaLabel="Next page"
          pageAriaLabel={(args) => `Page ${args.page}`}
          onChange={(args) => console.log(`Navigated to page ${args.page}`)}
        />
      </div>
    </Reshaped>
  );
}
