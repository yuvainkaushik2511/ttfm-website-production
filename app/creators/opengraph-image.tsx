import { ImageResponse } from "next/og";
import { creatorsTheme } from "@/lib/creatorsTheme";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, rgba(${creatorsTheme.accentRgb},0.24), transparent 55%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            letterSpacing: -3,
            color: "#f3f1ea",
            display: "flex",
          }}
        >
          TTFM Creators
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 30,
            color: creatorsTheme.accent,
            fontStyle: "italic",
            display: "flex",
          }}
        >
          Creators are the new media companies.
        </div>
      </div>
    ),
    { ...size }
  );
}
