import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPct, formatPrice } from "@/lib/utils";

/** Daily move as a signed percentage; pass `change` to lead with the absolute move. */
export function QuoteChange({ changePct, change }: { changePct: number; change?: number }) {
  const up = changePct >= 0;
  return (
    <span className={"chg " + (up ? "up" : "down")}>
      {up ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
      {change === undefined ? formatPct(changePct) : `${formatPrice(Math.abs(change))} (${formatPct(changePct)})`}
    </span>
  );
}
