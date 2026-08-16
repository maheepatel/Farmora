import { MapPin } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Parcel } from "@/lib/parcels";
import { formatINR, formatPct, formatShares } from "@/lib/format";

export function ParcelCard({ parcel }: { parcel: Parcel }) {
  const soldPct = Math.round((parcel.soldShares / parcel.totalShares) * 100);
  return (
    <Link
      href={`/parcels/${parcel.id}`}
      className="group block overflow-hidden rounded-[1.5rem] bg-paper-2 ring-1 ring-ink/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(30,42,26,0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={parcel.image}
          alt={`${parcel.name} farmland in ${parcel.district}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          {parcel.crop}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-ink">{parcel.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-2">
              <MapPin size={13} />
              {parcel.district}, {parcel.state}
            </p>
          </div>
          <span className="shrink-0 text-right">
            <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Share price
            </span>
            <span className="block font-medium text-ink">{formatINR(parcel.sharePrice)}</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t hairline pt-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Acres</p>
            <p className="font-medium text-ink">{parcel.acres}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Yield</p>
            <p className="font-medium text-sage-2">{formatPct(parcel.annualYieldPct)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Funded</p>
            <p className="font-medium text-ink">{soldPct}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-paper-4">
            <div
              className="h-full rounded-full bg-sage"
              style={{ width: `${soldPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-3">
            {formatShares(parcel.soldShares)} of {formatShares(parcel.totalShares)} shares sold
          </p>
        </div>
      </div>
    </Link>
  );
}
