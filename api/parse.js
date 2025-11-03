import ts from "typescript";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST method allowed" });
    }

    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Missing 'code' field in body" });

    // Parse kode TypeScript jadi AST
    const sourceFile = ts.createSourceFile(
      "temp.ts",
      code,
      ts.ScriptTarget.Latest,
      true
    );

    // Hapus referensi parent agar tidak rekursif
    const ast = JSON.parse(JSON.stringify(sourceFile, (k, v) => (k === "parent" ? undefined : v)));

    return res.status(200).json({ success: true, ast });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
