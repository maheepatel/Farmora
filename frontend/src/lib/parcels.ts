import { IMG } from "./images";

export type Parcel = {
  id: string;
  name: string;
  district: string;
  state: string;
  crop: string;
  acres: number;
  sharePrice: number;
  totalShares: number;
  soldShares: number;
  annualYieldPct: number;
  valuation: number;
  soil: string;
  irrigation: string;
  tenureYears: number;
  description: string;
  image: string;
  farmer: { name: string; location: string; photo: string };
};

export const parcels: Parcel[] = [
  {
    id: "green-valley-soy",
    name: "Green Valley Soy",
    district: "Mandya",
    state: "Karnataka",
    crop: "Soybean",
    acres: 4.2,
    sharePrice: 42,
    totalShares: 100000,
    soldShares: 68420,
    annualYieldPct: 12.4,
    valuation: 4200000,
    soil: "Black cotton soil",
    irrigation: "Borewell + canal",
    tenureYears: 6,
    description:
      "A rain-fed soybean parcel with canal backup, managed by the same family for three generations. Compact, low-maintenance, and near a ready market yard.",
    image: IMG.parcel1,
    farmer: { name: "Girish Hanumanth", location: "Mandya", photo: IMG.farmer1 },
  },
  {
    id: "thanjavur-rice-terraces",
    name: "Thanjavur Rice Terraces",
    district: "Thanjavur",
    state: "Tamil Nadu",
    crop: "Paddy",
    acres: 6.8,
    sharePrice: 61,
    totalShares: 100000,
    soldShares: 41280,
    annualYieldPct: 10.8,
    valuation: 6100000,
    soil: "Alluvial delta soil",
    irrigation: "Cauvery canal",
    tenureYears: 9,
    description:
      "Two paddy cycles a year on Cauvery-fed delta land. The district is India's rice bowl, with stable demand from local millers.",
    image: IMG.parcel2,
    farmer: { name: "Lakshmi Meenakshi", location: "Thanjavur", photo: IMG.farmer2 },
  },
  {
    id: "sangrur-wheat-belt",
    name: "Sangrur Wheat Belt",
    district: "Sangrur",
    state: "Punjab",
    crop: "Wheat",
    acres: 9.5,
    sharePrice: 74,
    totalShares: 100000,
    soldShares: 85610,
    annualYieldPct: 11.2,
    valuation: 7400000,
    soil: "Loam",
    irrigation: "Canal + tubewell",
    tenureYears: 8,
    description:
      "High-yield wheat land in the heart of Punjab's grain belt, backed by assured procurement. Large, flat, and fully mechanised.",
    image: IMG.parcel3,
    farmer: { name: "Baldev Singh", location: "Sangrur", photo: IMG.farmer1 },
  },
  {
    id: "ratnagiri-mango-orchard",
    name: "Ratnagiri Mango Orchard",
    district: "Ratnagiri",
    state: "Maharashtra",
    crop: "Mango",
    acres: 3.6,
    sharePrice: 88,
    totalShares: 100000,
    soldShares: 30290,
    annualYieldPct: 14.6,
    valuation: 8800000,
    soil: "Laterite",
    irrigation: "Drip system",
    tenureYears: 12,
    description:
      "A young Alphonso orchard coming into full production. Premium fruit demand keeps orchard valuations well above field crops.",
    image: IMG.parcel4,
    farmer: { name: "Suresh Kamble", location: "Ratnagiri", photo: IMG.farmer2 },
  },
  {
    id: "jodhpur-pearl-millet",
    name: "Jodhpur Pearl Millet",
    district: "Jodhpur",
    state: "Rajasthan",
    crop: "Millet",
    acres: 7.3,
    sharePrice: 28,
    totalShares: 100000,
    soldShares: 52740,
    annualYieldPct: 9.6,
    valuation: 2800000,
    soil: "Sandy loam",
    irrigation: "Rain-fed",
    tenureYears: 5,
    description:
      "Organic pearl millet on arid land, a low-cost dryland crop with growing demand in the health-food export market.",
    image: IMG.parcel5,
    farmer: { name: "Ramnath Choudhary", location: "Jodhpur", photo: IMG.farmer1 },
  },
  {
    id: "nashik-drip-veg",
    name: "Nashik Drip Veg Farm",
    district: "Nashik",
    state: "Maharashtra",
    crop: "Vegetables",
    acres: 2.9,
    sharePrice: 56,
    totalShares: 100000,
    soldShares: 65980,
    annualYieldPct: 13.1,
    valuation: 5600000,
    soil: "Red loam",
    irrigation: "Drip + polyhouse",
    tenureYears: 4,
    description:
      "Year-round vegetable production under drip with a small polyhouse, selling into Nashik's wholesale market six days a week.",
    image: IMG.parcel6,
    farmer: { name: "Aarti Deshmukh", location: "Nashik", photo: IMG.farmer2 },
  },
];

export const cropOptions = [
  "All crops",
  ...Array.from(new Set(parcels.map((p) => p.crop))),
];

export const regionOptions = [
  "All regions",
  ...Array.from(new Set(parcels.map((p) => p.state))),
];

export function getParcel(id: string): Parcel | undefined {
  return parcels.find((p) => p.id === id);
}
