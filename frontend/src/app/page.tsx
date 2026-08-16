import Image from "next/image";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { IMG } from "@/lib/images";
import { parcels } from "@/lib/parcels";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { ParcelCard } from "@/components/parcel-card";

const steps = [
  {
    n: "01",
    title: "Verify the land",
    body: "Each parcel is surveyed, title-checked and mapped on-chain, so the asset behind every share is real and documented.",
  },
  {
    n: "02",
    title: "Fractionalise the asset",
    body: "A parcel becomes an NFT with a fixed share supply. Buy as few shares as you like, priced per share in rupees.",
  },
  {
    n: "03",
    title: "Earn the yield",
    body: "Every harvest generates revenue that flows to share holders. Stake your shares and claim yield when it settles.",
  },
];

const partners = [
  { name: "Monad", mark: "M" },
  { name: "KrishiChain", mark: "K" },
  { name: "DhanVault", mark: "D" },
  { name: "AgroLedger", mark: "A" },
  { name: "SoilTrust", mark: "S" },
];

export default function Home() {
  const featured = parcels.slice(0, 3);
  return (
    <div>
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
        <Image
          src={IMG.hero}
          alt="Aerial view of farmland at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-16 pt-28 sm:px-6 md:pb-20">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-paper/25 bg-paper/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-paper/90 backdrop-blur-md">
              RWA farmland on Monad
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-paper sm:text-6xl lg:text-7xl">
              Own real farmland,
              <br />
              <em className="font-medium">share the harvest.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg">
              Farmora tokenises verified agricultural land into digital shares
              on Monad. Invest from a few thousand rupees and earn from every
              harvest.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/parcels" variant="primary" className="bg-paper text-ink hover:bg-paper-2">
                Browse parcels
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </ButtonLink>
              <ButtonLink
                href="#how-it-works"
                variant="outline"
                className="border-paper/40 text-paper hover:border-paper/70 hover:bg-paper/10"
              >
                How it works
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b hairline bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-5">
            {partners.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.05}>
                <div className="flex items-center justify-center gap-2.5 text-ink-3 transition-colors hover:text-ink-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 font-display text-sm text-ink">
                    {p.mark}
                  </span>
                  <span className="font-display text-lg">{p.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-ink-3">
            Built for the Monad ecosystem
          </p>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-2">
              How Farmora works
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
              From soil to share, in three steps
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group relative border-t hairline pt-8">
                <span className="font-display text-5xl text-sage/50 transition-colors duration-500 group-hover:text-sage">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-2xl text-ink">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper-2">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-2">
                  On the market now
                </p>
                <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                  Parcels raising funds
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ButtonLink href="/parcels" variant="ghost">
                View all parcels
              </ButtonLink>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal className="lg:row-span-2">
              <ParcelCard parcel={featured[0]} />
            </Reveal>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              {featured.slice(1).map((p, i) => (
                <Reveal key={p.id} delay={0.1 + i * 0.08}>
                  <ParcelCard parcel={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-2">
                Verified assets
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                Every share is backed by surveyed, titled land
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">
                We work with local surveyors, notaries and farming cooperatives
                so the parcel behind your shares is real, documented and
                producing.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ink-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-sage" />
                  Title and mutation checks before listing
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-sage" />
                  GPS-mapped boundaries stored in parcel metadata
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-sage" />
                  Quarterly harvest reports for every parcel
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[16/11]">
                <Image
                  src={IMG.process}
                  alt="Farmer and buyer working through a parcel on a phone"
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="mt-20 grid grid-cols-2 gap-8 border-t hairline pt-12 md:grid-cols-4">
            {[
              { k: "Parcels funded", v: "38" },
              { k: "Avg. annual yield", v: "12.4%" },
              { k: "Farmers onboarded", v: "214" },
              { k: "States covered", v: "4" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-4xl text-ink sm:text-5xl">{s.v}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-3">
                  {s.k}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-3">
            Illustrative demo figures for the hackathon build.
          </p>
        </Reveal>
      </section>

      <section className="bg-paper-2">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 md:py-32">
          <Reveal>
            <figure className="mx-auto max-w-3xl text-center">
              <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-sage/40">
                <Image
                  src={IMG.farmer1}
                  alt="Portrait of Girish Hanumanth"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <blockquote className="mt-8 font-display text-2xl leading-snug text-ink sm:text-3xl">
                &ldquo;I kept my land in the family and opened it to investors
                who trust how we farm. The harvest pays them, and we grow.&rdquo;
              </blockquote>
              <figcaption className="mt-8 text-sm">
                <span className="font-semibold text-ink">Girish Hanumanth</span>
                <span className="text-ink-3"> - land owner, Mandya</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Image
          src={IMG.cta}
          alt="Green farmland community at sunset"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-28 text-center sm:px-6 md:py-40">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight tracking-tight text-paper sm:text-5xl">
              Start with your first parcel
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-paper/80">
              Join the farmers and investors already sharing the land on Monad.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/parcels" variant="primary" className="bg-paper text-ink hover:bg-paper-2">
                Explore parcels
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
