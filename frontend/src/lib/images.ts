// Farmora image and video sources. Drop files into frontend/public/images/ using
// the exact filenames below and everything picks up automatically.

export const IMG: Record<string, string> = {
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

export const VIDEO: Record<string, string> = {
  hero: "/images/hero.mp4",
};

const CROP_VIDEOS: Record<string, string> = {
  Saffron: "/images/Saffron.mp4",
  Cordyceps: "/images/Cordyceps.mp4",
  Mushroom: "/images/Mushroom.mp4",
  "Dragon Fruit": "/images/Dragon.mp4",
  Pomegranate: "/images/Pomegranate.mp4",
  Grapes: "/images/Grapevine.mp4",
  Turmeric: "/images/Turmeric.mp4",
};

export function cropVideo(cropType: string): string | undefined {
  return CROP_VIDEOS[cropType];
}
