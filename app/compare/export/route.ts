import { resolveComparison } from "@/lib/compare";
import { comparisonRows, toCsv, toJson } from "@/lib/export";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const format = params.get("format") ?? "csv";
  if (format !== "csv" && format !== "json") return Response.json({ error: "Format must be csv or json" }, { status: 400 });
  const { assets } = resolveComparison(params.getAll("symbols"));
  if (!assets.length) return Response.json({ error: "No comparison assets" }, { status: 404 });
  const rows = comparisonRows(assets);
  const name = "goldirham-comparison-" + assets.map((asset) => asset.symbol).join("-") + "." + format;
  return new Response(format === "csv" ? toCsv(rows) : toJson(rows), {
    headers: {
      "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
