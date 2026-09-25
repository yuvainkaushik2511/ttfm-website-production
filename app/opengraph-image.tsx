import { ImageResponse } from "next/og";

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
            background:
              "radial-gradient(circle at 30% 30%, rgba(200,147,91,0.22), transparent 55%)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 200,
            fontWeight: 700,
            letterSpacing: -6,
            color: "#f3f1ea",
            display: "flex",
          }}
        >
          TTFM
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 30,
            color: "#c8935b",
            fontStyle: "italic",
            display: "flex",
          }}
        >
          Films, music videos and campaigns — produced end to end.
        </div>
      </div>
    ),
    { ...size }
  );
}
