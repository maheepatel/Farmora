import { ArrowLeft, MapPin, Sun, Waveform } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getParcel } from "@/lib/parcels";
import { formatINR, formatPct, formatShares } from "@/lib/format";
import { BuyPanel } from "@/components/buy-panel";
import { YieldSimulator } from "@/components/yield-simulator";
import { Reveal } from "@/components/reveal";
import { IMG } from "@/lib/images";

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return params.then(({ id }) => {
    const parcel = getParcel(id);
    return {
      title: parcel ? `${parcel.name} - Farmora` : "Parcel - Farmora",
      description: parcel
        ? `${parcel.acres} acres of ${parcel.crop} in ${parcel.district}, ${parcel.state}. Yield ${parcel.annualYieldPct}%.`
        : undefined,
    };
  });
}

export default async function ParcelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parcel = getParcel(id);
  if (!parcel) notFound();

  const soldPct = Math.round((parcel.soldShares / parcel.totalShares) * 100);
  const facts = [
    { label: "Location", value: `${parcel.district}, ${parcel.state}` },
    { label: "Area", value: `${parcel.acres} acres` },
    { label: "Crop", value: parcel.crop },
    { label: "Soil", value: parcel.soil },
    { label: "Irrigation", value: parcel.irrigation },
    { label: "Lease tenure", value: `${parcel.tenureYears} years` },
  ];

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6">
        <Link
          href="/parcels"
          className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} />
          All parcels
        </Link>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image
                  src={parcel.image}
                  alt={`${parcel.name} farmland in ${parcel.district}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-2xl bg-paper-2 p-4 ring-1 ring-ink/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
                    {f.label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-ink">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-3xl text-ink">About this parcel</h2>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-2">
                {parcel.description}
              </p>

              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-paper-2 p-5 ring-1 ring-ink/10">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-sage/40">
                  <Image
                    src={parcel.farmer.photo}
                    alt={`Portrait of ${parcel.farmer.name}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-ink">{parcel.farmer.name}</p>
                  <p className="text-sm text-ink-3">
                    Managing farmer, {parcel.farmer.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <Reveal delay={0.08}>
              <div className="rounded-[2rem] bg-paper-3 p-1.5 ring-1 ring-ink/10">
                <div className="rounded-[1.6rem] bg-paper px-6 pb-6 pt-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] md:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="font-display text-4xl tracking-tight text-ink">
                        {parcel.name}
                      </h1>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-2">
                        <MapPin size={14} />
                        {parcel.district}, {parcel.state}
                      </p>
                    </div>
                    <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-medium text-sage-2 ring-1 ring-sage/30">
                      {soldPct}% funded
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-ink-3">
                      <span>Fundraising progress</span>
                      <span>
                        {formatShares(parcel.soldShares)} of{" "}
                        {formatShares(parcel.totalShares)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-4">
                      <div
                        className="h-full rounded-full bg-sage"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 border-y hairline py-4 text-center">
                    <div>
                      <p className="font-display text-2xl text-ink">
                        {formatINR(parcel.sharePrice)}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
                        Per share
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-sage-2">
                        {formatPct(parcel.annualYieldPct)}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
                        Yield
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-ink">
                        {formatINR(parcel.valuation)}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
                        Valuation
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm text-ink-2">
                      <Sun size={15} className="text-sage-2" />
                      {parcel.soil} with {parcel.irrigation.toLowerCase()}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-ink-2">
                      <Waveform size={15} className="text-sage-2" />
                      Harvest income distributed each season
                    </div>
                  </div>

                  <div className="mt-6">
                    <BuyPanel parcel={parcel} />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] ring-1 ring-ink/10">
              <div className="relative aspect-[16/9]">
                <Image
                  src={IMG.map}
                  alt="Parcel boundary map"
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
              <div className="bg-paper-2 px-6 py-4 text-sm text-ink-2">
                Surveyed boundary for {parcel.name}, verified on record
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <YieldSimulator parcel={parcel} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
