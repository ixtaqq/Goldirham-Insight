const { createReadStream } = require("node:fs");
const { createInterface } = require("node:readline");

const fields = new Set(["event", "provider", "operation", "reason", "status", "rejectedRecords"]);
const providers = new Set(["coingecko", "finnhub"]);
const operations = new Set(["quotes", "chart"]);
const reasons = new Set(["http", "invalid-response", "timeout", "network", "rate-limit"]);

function parse(line) {
  let row;
  try {
    row = JSON.parse(line);
  } catch {
    return null;
  }
  if (!row || typeof row !== "object" || Array.isArray(row) ||
    Object.keys(row).some((key) => !fields.has(key)) ||
    row.event !== "market_data_fallback" || !providers.has(row.provider) ||
    !operations.has(row.operation) || !reasons.has(row.reason) ||
    (row.status !== undefined && (!Number.isInteger(row.status) || row.status < 100 || row.status > 599)) ||
    (row.rejectedRecords !== undefined && (!Number.isSafeInteger(row.rejectedRecords) || row.rejectedRecords < 0))) {
    return null;
  }
  return row;
}

async function main() {
  if (process.argv.length > 3) {
    console.error("Usage: npm run market:health -- [logs.ndjson]");
    process.exitCode = 1;
    return;
  }
  const input = process.argv[2] ? createReadStream(process.argv[2], "utf8") : process.stdin;
  const groups = new Map();
  let events = 0;
  let rejectedRecords = 0;
  let invalidLines = 0;
  try {
    for await (const line of createInterface({ input, crlfDelay: Infinity })) {
      if (!line.trim()) continue;
      const row = parse(line);
      if (!row) {
        invalidLines++;
        continue;
      }
      events++;
      rejectedRecords += row.rejectedRecords || 0;
      const key = [row.provider, row.operation, row.reason, row.status || ""].join(":");
      const group = groups.get(key) || {
        provider: row.provider,
        operation: row.operation,
        reason: row.reason,
        ...(row.status !== undefined ? { status: row.status } : {}),
        events: 0,
        rejectedRecords: 0,
      };
      group.events++;
      group.rejectedRecords += row.rejectedRecords || 0;
      groups.set(key, group);
    }
    console.log(JSON.stringify({ events, rejectedRecords, invalidLines, groups: [...groups.values()] }, null, 2));
  } catch {
    console.error("Unable to read market logs.");
    process.exitCode = 1;
  }
}

void main();
