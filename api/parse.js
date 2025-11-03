import ts from "typescript";
import LZString from "lz-string";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST method allowed" });
    }

    let { code, encoded } = req.body || {};

    // Jika input berupa kode encoded dari ts-ast-viewer.com
    if (encoded && !code) {
      try {
        // decode dari Base64 + URI ke kode TS mentah
        code = LZString.decompressFromEncodedURIComponent(encoded);
      } catch (e) {
        return res.status(400).json({ error: "Failed to decode encoded string" });
      }
    }

    if (!code) {
      return res.status(400).json({ error: "Missing 'code' or 'encoded' in request" });
    }

    // Parse kode TypeScript
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);

    // Hilangkan parent property biar tidak rekursif
    const ast = JSON.parse(JSON.stringify(sourceFile, (k, v) => (k === "parent" ? undefined : v)));

    return res.status(200).json({ success: true, code, ast });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
