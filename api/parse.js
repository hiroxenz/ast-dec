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

    // Konversi ke JSON tapi hapus property 'parent' agar tidak rekursif
    const astJSON = JSON.parse(
      JSON.stringify(sourceFile, (key, value) => (key === "parent" ? undefined : value))
    );

    return res.status(200).json({ success: true, ast: astJSON });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
