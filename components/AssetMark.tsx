import { Bitcoin, Cpu, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssetMark({ symbol, className }: { symbol: string; className?: string }) {
  const Icon = symbol === "BTC" ? Bitcoin : symbol === "NVDA" ? Cpu : ["CEG", "VST", "NEE"].includes(symbol) ? Zap : symbol === "QQQ" || symbol === "SMH" ? Layers : null;
  return (
    <span className={cn("asset-mark", `asset-mark-${symbol.toLowerCase()}`, className)} aria-hidden="true">
      {Icon ? <Icon size={23} strokeWidth={1.8} /> : symbol.slice(0, 1)}
    </span>
  );
}
