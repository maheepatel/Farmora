// Farmora image sources
//
// SWAPPING IN AI-GENERATED IMAGES
// Set USE_AI_IMAGES = true and drop the generated files into frontend/public/images/
// using the exact filenames from AI_IMAGE_PROMPTS.md (hero.jpg, parcel-1.jpg, ...).
// Everything else picks up automatically.

export const USE_AI_IMAGES = true;

const LOCAL: Record<string, string> = {
  hero: "/images/hero.jpg",
  process: "/images/process.jpg",
  cta: "/images/cta-farm.jpg",
  map: "/images/map.jpg",
  farmer1: "/images/farmer-1.jpg",
  farmer2: "/images/farmer-2.jpg",
  parcel1: "/images/parcel-1.jpg",
  parcel2: "/images/parcel-2.jpg",
  parcel3: "/images/parcel-3.jpg",
  parcel4: "/images/parcel-4.jpg",
  parcel5: "/images/parcel-5.jpg",
  parcel6: "/images/parcel-6.jpg",
};

// Verified-working real farmland photography (Unsplash), used until AI images replace them.
const REMOTE: Record<string, string> = {
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2000&q=80",
  process:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80",
  cta: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=2000&q=80",
  map: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&q=80",
  farmer1:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
  farmer2:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  parcel1:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80",
  parcel2:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&q=80",
  parcel3:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80",
  parcel4:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80",
  parcel5:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80",
  parcel6:
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=80",
};

export const IMG: Record<string, string> = USE_AI_IMAGES ? LOCAL : REMOTE;
