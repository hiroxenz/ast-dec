import ts from "typescript";
import LZString from "lz-string";

/**
 * Fungsi untuk menghilangkan referensi circular (rekursif)
 * pada AST TypeScript agar bisa diubah ke JSON.
 */
function safeJson(obj, seen = new WeakSet()) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (key === "parent") return undefined; // hapus parent biar gak infinite loop
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return undefined; // deteksi circular
      seen.add(value);
    }
    return value;
  }));
}

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

    // Parse kode TypeScript menjadi AST
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);

    // Hapus circular reference agar bisa dijadikan JSON
    const ast = safeJson(sourceFile);

    return res.status(200).json({ success: true, code, ast });
  } catch (err) {
    console.error("[API ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
}
