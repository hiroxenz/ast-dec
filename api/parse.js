import ts from "typescript";
import LZString from "lz-string";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST method allowed" });
    }

    let { code, encoded } = req.body || {};

    // Jika input berupa kode encoded dari TS AST Viewer
    if (encoded && !code) {
      try {
        code = LZString.decompressFromEncodedURIComponent(encoded);

        if (!code) {
          return res.status(400).json({
            error: "Failed to decompress — encoded string invalid or truncated"
          });
        }
      } catch (e) {
        return res.status(400).json({ error: "Failed to decode encoded string", details: e.message });
      }
    }

    if (!code) {
      return res.status(400).json({ error: "Missing 'code' or 'encoded' in request" });
    }

    // Parse kode TypeScript
    let sourceFile;
    try {
      sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);
    } catch (err) {
      return res.status(400).json({ error: "TypeScript parse failed", details: err.message });
    }

    // Hilangkan property parent biar tidak rekursif
    const ast = JSON.parse(JSON.stringify(sourceFile, (k, v) => (k === "parent" ? undefined : v)));

    return res.status(200).json({ success: true, code, ast });
  } catch (err) {
    console.error("[API ERROR]", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
