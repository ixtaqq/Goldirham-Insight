import Image from "next/image";
import { cn } from "@/lib/utils";

export function AssetMark({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <span className={cn("asset-mark", `asset-mark-${symbol.toLowerCase()}`, className)} aria-hidden="true">
      <Image src={`/logos/${symbol.toLowerCase()}.png`} alt="" width={48} height={48} sizes="48px" />
    </span>
  );
}
