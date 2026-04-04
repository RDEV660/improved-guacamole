import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Lily's Beauty Lounge — Mission, Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.28), transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 48px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              color: "#fafafa",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {"Lily's Beauty Lounge"}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 24,
              fontWeight: 500,
              color: "#ff2d78",
              maxWidth: 1000,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            {`${SITE.serviceLine} · Mission, TX`}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 22,
              color: "#b5b5b5",
            }}
          >
            Book online · Walk-ins welcome
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
