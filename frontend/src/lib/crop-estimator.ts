export type EstimatorYear = {
  year: number;
  price: number;
  note: string;
};

export type CropEstimator = {
  cropType: string;
  yieldPerAcre: number;
  yieldUnit: string;
  yieldNote: string;
  priceNote: string;
  years: EstimatorYear[];
};

export const CROP_ESTIMATORS: Record<string, CropEstimator> = {
  Saffron: {
    cropType: "Saffron",
    yieldPerAcre: 3,
    yieldUnit: "kg dried / acre / yr",
    yieldNote: "~3 kg dried saffron per acre · blooms Oct–Nov · Kashmir Pampore",
    priceNote: "No public yearly series — sourced average applied. Kashmir saffron ₹2.5–3.5L/kg ≈ $3,600–4,200/kg.",
    years: [
      { year: 2023, price: 3000, note: "Sourced average · tight Pampore supply" },
      { year: 2024, price: 3000, note: "Sourced average · Spain drought lifted premium" },
      { year: 2025, price: 3000, note: "Sourced average · ₹2.5–3.5L/kg band" },
      { year: 2026, price: 3000, note: "Sourced average · current market" },
    ],
  },
  Cordyceps: {
    cropType: "Cordyceps",
    yieldPerAcre: 100,
    yieldUnit: "kg dried / acre / yr",
    yieldNote: "~100 kg dried Cordyceps militaris per acre · 4–6-week spawn batches",
    priceNote: "No public yearly series — sourced average applied. Wholesale ₹24,000–30,000/kg ≈ $286–357/kg; dried grade ₹110,000–130,000/kg on IndiaMART. Conservative farmgate blend.",
    years: [
      { year: 2023, price: 250, note: "Sourced average · wholesale ₹24–30k/kg" },
      { year: 2024, price: 250, note: "Sourced average · steady supplement demand" },
      { year: 2025, price: 250, note: "Sourced average · conservative farmgate" },
      { year: 2026, price: 250, note: "Sourced average · current market" },
    ],
  },
  Mushroom: {
    cropType: "Mushroom",
    yieldPerAcre: 10000,
    yieldUnit: "kg fresh / acre / yr",
    yieldNote: "~10,000 kg fresh Oyster + Milky per acre · 5–6 harvest cycles / yr",
    priceNote: "No public yearly series — sourced average applied. Oyster farmgate ₹50–70/kg, retail ₹80–120/kg ≈ $0.60–1.43/kg.",
    years: [
      { year: 2023, price: 1.5, note: "Sourced average · retail ₹80–120/kg" },
      { year: 2024, price: 1.5, note: "Sourced average · farmgate ₹50–70/kg" },
      { year: 2025, price: 1.5, note: "Sourced average · fastest cash-flow crop" },
      { year: 2026, price: 1.5, note: "Sourced average · current market" },
    ],
  },
  "Dragon Fruit": {
    cropType: "Dragon Fruit",
    yieldPerAcre: 8000,
    yieldUnit: "kg / acre / yr",
    yieldNote: "~8 t per acre at maturity · first flowers 16–20 months · full yield by yr 3–4",
    priceNote: "Real export data: US import unit value US$1.04/kg, +14.4% YoY; India exported 89,657 t in 2024 at US$1.0382/kg.",
    years: [
      { year: 2023, price: 0.9, note: "US import price ≈ US$0.90/kg" },
      { year: 2024, price: 1.04, note: "US$1.04/kg import unit value · +14.4% YoY" },
      { year: 2025, price: 1.1, note: "Export unit value US$1.0382/kg · 89,657 t exported" },
      { year: 2026, price: 1.1, note: "Sustained near export unit value" },
    ],
  },
  Pomegranate: {
    cropType: "Pomegranate",
    yieldPerAcre: 6000,
    yieldUnit: "kg / acre / yr",
    yieldNote: "4–7 t per acre by yr 5 · Bhagwa export-grade fetches ₹12,000–20,000/quintal abroad",
    priceNote: "Agmarknet/mandi modal ₹7,500–14,440/quintal (₹75–144/kg). Conservative domestic modal used.",
    years: [
      { year: 2023, price: 0.7, note: "Mandi modal ~₹59/kg · high arrivals" },
      { year: 2024, price: 0.85, note: "Mandi modal ~₹71/kg · export demand up" },
      { year: 2025, price: 0.75, note: "Mandi modal ~₹63/kg · mixed season" },
      { year: 2026, price: 0.85, note: "Today's modal ₹7,500/q ≈ $0.90/kg" },
    ],
  },
  Grapes: {
    cropType: "Grapes",
    yieldPerAcre: 10000,
    yieldUnit: "kg / acre / yr",
    yieldNote: "8–12 t per acre · Nashik Thompson Seedless · export ₹65–70/kg, domestic ₹25–30/kg",
    priceNote: "Nashik mandi avg ₹2,500/quintal (₹25/kg); 2024 export ₹65–70/kg; exportable Thompson ~US$1.5–1.7/kg FOB.",
    years: [
      { year: 2023, price: 0.55, note: "Nashik avg ₹2,500/q ≈ $0.30/kg dom. blended" },
      { year: 2024, price: 0.6, note: "Export ₹65–70/kg pulled up blended price" },
      { year: 2025, price: 0.65, note: "Exportable quality ~US$1.5–1.7/kg FOB" },
      { year: 2026, price: 0.6, note: "Normalized dom. + export blend" },
    ],
  },
  Turmeric: {
    cropType: "Turmeric",
    yieldPerAcre: 2000,
    yieldUnit: "kg cured / acre / yr",
    yieldNote: "8–12 t fresh → ~2,000 kg cured per acre · 8–9-month cycle",
    priceNote: "NCDEX turmeric: median ₹14,011/quintal (Jan 2023–Jul 2026); Apr 2025 futures ₹15,800–16,500; mid-2025 ~₹10,800; 2026 rallied toward ₹21,400. ~₹84/USD.",
    years: [
      { year: 2023, price: 1.1, note: "NCDEX ~₹9,000/q ≈ $1.08/kg" },
      { year: 2024, price: 1.65, note: "Bull market · ₹14,000/q ≈ $1.65/kg" },
      { year: 2025, price: 1.3, note: "Bearish mid-2025 · ₹10,800 futures" },
      { year: 2026, price: 1.85, note: "Rally · ₹15,600–21,400/q ≈ $1.85/kg" },
    ],
  },
  Ginger: {
    cropType: "Ginger",
    yieldPerAcre: 10000,
    yieldUnit: "kg fresh / acre / yr",
    yieldNote: "8–12 t per acre · 8–10-month cycle · no MSP, fully market-priced",
    priceNote: "Agmarknet/mandi: green ginger avg ₹9,246/quintal (Mar 2024); today's modal ₹6,000/quintal; dry grade up to ₹20,314/quintal.",
    years: [
      { year: 2023, price: 0.85, note: "South-India floods spiked green ginger" },
      { year: 2024, price: 1.1, note: "Mar-2024 avg ₹9,246/q ≈ $1.10/kg" },
      { year: 2025, price: 0.8, note: "₹6,800/q ≈ $0.80/kg · normal arrivals" },
      { year: 2026, price: 0.72, note: "Today's modal ₹6,000/q ≈ $0.72/kg" },
    ],
  },
};

export function getCropEstimator(cropType: string): CropEstimator | undefined {
  return CROP_ESTIMATORS[cropType];
}
