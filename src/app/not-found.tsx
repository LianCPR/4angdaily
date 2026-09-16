import Link from "next/link";

export default function RootNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#B5502E" }}>
        404
      </p>
      <h1 style={{ fontSize: "1.75rem", marginTop: "0.5rem" }}>Page not found</h1>
      <Link href="/" style={{ marginTop: "1.5rem", color: "#B5502E" }}>
        ← Back to 4ANG Journal
      </Link>
    </div>
  );
}
