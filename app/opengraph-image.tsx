import { ImageResponse } from "next/og";
import { portfolio } from "@/config/portfolio";
export const alt = "A journey through craft and code";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraph() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "70px 90px",
        background: "linear-gradient(130deg, #14221a, #445344)",
        color: "#e8e1d2",
      }}
    >
      <div
        style={{
          fontSize: 16,
          letterSpacing: "5px",
          color: "#c9a35c",
          display: "flex",
        }}
      >
        THE WANDERER / CRAFT & CODE
      </div>
      <div
        style={{
          fontSize: 110,
          fontFamily: "serif",
          marginTop: 90,
          letterSpacing: "-5px",
          display: "flex",
        }}
      >
        {portfolio.profile.name}
      </div>
      <div
        style={{
          fontSize: 25,
          marginTop: 20,
          display: "flex",
          color: "#d0d3c2",
        }}
      >
        {portfolio.profile.role}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 55,
          borderTop: "1px solid #b6a474",
          width: 70,
        }}
      />
    </div>,
    size,
  );
}
