"use client";

import { useId } from "react";

/* ---------------------------------------------------------------
   Cartoon crop art — hand-drawn inline SVG, zero image files.
   One component per crop; every glyph shares the same ink style
   (2px deep-green outline, flat fills, white highlights) so the
   whole site feels like one sticker book.
   When a growth-cycle video exists for a crop, CropArt plays it
   instead of the sticker glyph; unrecorded crops keep the SVG.
   --------------------------------------------------------------- */

const INK = "#123B1F";

const VIDEOS: Record<string, string> = {
  saffron: "/videos/crops/saffron.mp4",
  cordyceps: "/videos/crops/cordyceps.mp4",
  mushroom: "/videos/crops/mushroom.mp4",
  dragonfruit: "/videos/crops/dragonfruit.mp4",
  pomegranate: "/videos/crops/pomegranate.mp4",
  grapes: "/videos/crops/grapes.mp4",
  turmeric: "/videos/crops/turmeric.mp4",
  ginger: "/videos/crops/ginger.mp4",
};

interface CropArtProps {
  cropType: string;
  className?: string;
}

export function CropArt({ cropType, className = "" }: CropArtProps) {
  const id = useId().replace(/:/g, "");
  const key = cropType.toLowerCase().replace(/[^a-z0-9]/g, "");
  const video = VIDEOS[key];
  if (video) {
    return (
      <video
        src={video}
        className={`${className} object-cover`}
        role="img"
        aria-label={`${cropType} growth cycle`}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }
  const art = ARTS[key] ?? ARTS.default;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={`${cropType} illustration`}
      fill="none"
    >
      <defs>
        <radialGradient id={`sky-${id}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#DFF0D9" />
          <stop offset="100%" stopColor="#CDE7C4" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="28" fill={`url(#sky-${id})`} />
      {art()}
      <circle cx="168" cy="34" r="16" fill="#FFC53D" stroke={INK} strokeWidth="3" />
      <circle cx="172" cy="30" r="4" fill="#FFF3C9" />
    </svg>
  );
}

/* Gentle floating clouds shared by every glyph */
function Sky() {
  return (
    <>
      <ellipse cx="42" cy="34" rx="22" ry="10" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" opacity="0.9" />
      <ellipse cx="58" cy="30" rx="12" ry="8" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" opacity="0.9" />
    </>
  );
}

type ArtFn = () => React.ReactNode;

const ARTS: Record<string, ArtFn> = {
  saffron: () => (
    <>
      <Sky />
      <g stroke={INK} strokeWidth="3">
        {/* flower 1 (center) */}
        <path d="M100 96 L 100 142" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M100 96 C 84 88, 78 78, 82 68 C 90 72, 96 82, 100 96 Z" fill="#9B6BEA" />
        <path d="M100 96 C 116 88, 122 78, 118 68 C 110 72, 104 82, 100 96 Z" fill="#8B5CF6" />
        <path d="M100 96 C 92 82, 96 70, 100 60 C 104 70, 108 82, 100 96 Z" fill="#B38BEF" />
        <path d="M100 96 C 92 84, 96 72, 98 62" stroke="#E2543A" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 96 C 100 84, 100 72, 102 60" stroke="#E2543A" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 96 C 108 86, 104 74, 106 64" stroke="#E2543A" strokeWidth="4" strokeLinecap="round" />
        {/* flower 2 (left) */}
        <path d="M64 114 L 64 96" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M62 114 C 50 106, 46 98, 48 88 C 56 92, 60 100, 62 114 Z" fill="#9B6BEA" />
        <path d="M62 114 C 72 106, 76 98, 74 88 C 68 92, 64 100, 62 114 Z" fill="#B38BEF" />
        <path d="M62 114 C 62 104, 62 96, 64 86" stroke="#E2543A" strokeWidth="3.5" strokeLinecap="round" />
        {/* flower 3 (right) */}
        <path d="M136 112 L 136 100" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M138 112 C 126 104, 122 96, 124 86 C 132 90, 136 98, 138 112 Z" fill="#8B5CF6" />
        <path d="M138 112 C 148 104, 152 96, 150 86 C 144 90, 140 98, 138 112 Z" fill="#9B6BEA" />
        <path d="M138 112 C 138 102, 138 94, 140 84" stroke="#E2543A" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      {/* soil bed */}
      <rect x="46" y="142" width="108" height="44" rx="14" fill="#8B5A2B" stroke={INK} strokeWidth="4" />
      <path d="M60 156 h 80 M52 168 h 96" stroke="#6E4520" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 92 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  cordyceps: () => (
    <>
      <Sky />
      <rect x="48" y="136" width="104" height="48" rx="12" fill="#8B5A2B" stroke={INK} strokeWidth="4" />
      <path d="M64 150 h 72 M56 162 h 88" stroke="#6E4520" strokeWidth="3" strokeLinecap="round" />
      <g stroke={INK} strokeWidth="3">
        <path d="M72 136 C 66 118, 62 106, 66 92 C 70 84, 76 82, 78 88 C 82 98, 82 116, 82 136 Z" fill="#FF8C42" />
        <path d="M96 136 C 88 110, 84 94, 88 78 C 92 68, 100 66, 104 74 C 108 88, 106 114, 106 136 Z" fill="#FFA24D" />
        <path d="M122 136 C 118 118, 114 106, 118 94 C 122 86, 128 86, 130 92 C 134 102, 132 118, 132 136 Z" fill="#FF8C42" />
        <circle cx="80" cy="104" r="2.5" fill="#E2543A" />
        <circle cx="97" cy="92" r="2.5" fill="#E2543A" />
        <circle cx="100" cy="110" r="2.5" fill="#E2543A" />
        <circle cx="126" cy="108" r="2.5" fill="#E2543A" />
      </g>
      <path d="M152 104 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  mushroom: () => (
    <>
      <Sky />
      <rect x="40" y="148" width="120" height="36" rx="18" fill="#A9703F" stroke={INK} strokeWidth="4" />
      <path d="M84 166 c 6 4 6 4 12 0" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="170" r="3" fill="#8B5A2B" />
      <circle cx="126" cy="166" r="2.5" fill="#8B5A2B" />
      <g stroke={INK} strokeWidth="3">
        <path d="M70 148 C 58 132, 56 116, 66 104 C 80 94, 94 104, 98 122 C 92 134, 84 142, 76 148 Z" fill="#D9CBB8" />
        <path d="M66 104 C 74 96, 84 92, 90 96 C 86 108, 78 118, 72 128 C 68 120, 66 112, 66 104 Z" fill="#EFE3D0" />
        <path d="M104 142 C 96 122, 96 106, 106 94 C 118 84, 130 92, 132 108 C 130 124, 120 136, 112 142 Z" fill="#C9B79B" />
        <path d="M106 94 C 114 88, 122 88, 128 92 C 124 104, 116 114, 110 122 C 106 112, 106 102, 106 94 Z" fill="#E4D5BC" />
        <path d="M132 144 C 128 130, 130 116, 140 108 C 150 100, 160 108, 160 122 C 158 134, 148 142, 140 144 Z" fill="#F7F2E8" />
        <path d="M140 108 C 146 102, 152 102, 156 106 C 152 116, 146 124, 142 130 C 140 122, 140 114, 140 108 Z" fill="#FFFFFF" />
      </g>
      <path d="M150 96 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  dragonfruit: () => (
    <>
      <Sky />
      <rect x="96" y="60" width="10" height="110" rx="5" fill="#A9703F" stroke={INK} strokeWidth="4" />
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M84 96 C 78 84, 78 74, 84 62" />
        <path d="M116 92 C 122 82, 124 72, 118 60" />
      </g>
      <g stroke={INK} strokeWidth="3">
        <ellipse cx="80" cy="150" rx="26" ry="34" fill="#E7547F" />
        <path d="M80 116 C 72 108, 66 104, 60 102 C 62 110, 64 116, 64 122 Z" fill="#F48FB1" />
        <path d="M92 118 C 92 108, 88 100, 84 96 C 80 104, 82 112, 84 120 Z" fill="#F48FB1" />
        <path d="M68 122 C 58 118, 50 116, 46 118 C 48 126, 52 132, 56 136 Z" fill="#F48FB1" />
        <ellipse cx="120" cy="142" rx="20" ry="26" fill="#D64573" />
        <path d="M120 116 C 120 106, 116 100, 112 96 C 108 104, 110 112, 112 120 Z" fill="#F48FB1" />
        <path d="M108 120 C 100 114, 94 112, 90 114 C 92 122, 96 128, 100 132 Z" fill="#F48FB1" />
      </g>
      <path d="M150 150 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  pomegranate: () => (
    <>
      <Sky />
      {/* canopy */}
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M100 78 C 64 78, 50 102, 52 128 C 50 158, 74 170, 100 170 C 126 170, 150 158, 148 128 C 150 102, 136 78, 100 78 Z" fill="#38B26B" />
        <path d="M100 62 C 88 62, 80 74, 84 84 C 94 76, 108 74, 118 82 C 120 70, 110 62, 100 62 Z" fill="#3CC97A" />
        <path d="M100 170 L 100 184" />
      </g>
      {/* pomegranates */}
      <g stroke={INK} strokeWidth="3">
        <circle cx="86" cy="118" r="16" fill="#D6486E" />
        <circle cx="114" cy="126" r="13" fill="#E25880" />
        <path d="M80 104 L 84 108 M92 103 L 92 108 M108 112 L 108 117" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* little crown + sparkle */}
      <path d="M100 62 C 96 54, 92 48, 88 40 M100 62 C 100 52, 100 46, 100 38 M100 62 C 104 54, 108 48, 112 40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 80 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  grapes: () => (
    <>
      <Sky />
      <path d="M88 44 C 92 70, 88 96, 96 122" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M96 76 C 82 62, 78 48, 86 40 C 92 36, 100 42, 104 52 C 110 42, 120 40, 126 48 C 128 60, 118 72, 104 78 Z" fill="#4CAF50" stroke={INK} strokeWidth="3" />
      <g stroke={INK} strokeWidth="2.5">
        <circle cx="118" cy="106" r="10" fill="#7C4DE6" />
        <circle cx="134" cy="106" r="10" fill="#8B5CF6" />
        <circle cx="108" cy="120" r="10" fill="#8B5CF6" />
        <circle cx="124" cy="120" r="10" fill="#9A6BE0" />
        <circle cx="140" cy="120" r="10" fill="#8B5CF6" />
        <circle cx="116" cy="134" r="10" fill="#9A6BE0" />
        <circle cx="132" cy="134" r="10" fill="#7C4DE6" />
        <circle cx="124" cy="148" r="10" fill="#8B5CF6" />
      </g>
      <circle cx="113" cy="101" r="3" fill="#CBB8F5" />
      <circle cx="120" cy="144" r="3" fill="#CBB8F5" />
      <path d="M158 150 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  turmeric: () => (
    <>
      <Sky />
      <g stroke={INK} strokeWidth="3">
        <path d="M100 132 C 70 120, 52 98, 56 70 C 72 82, 86 100, 92 118 Z" fill="#4CAF50" />
        <path d="M100 132 C 130 120, 148 98, 144 70 C 128 82, 114 100, 108 118 Z" fill="#3F9D47" />
        <path d="M100 132 C 90 108, 92 84, 102 62 C 108 88, 108 110, 104 128 Z" fill="#5DBB50" />
      </g>
      <g stroke={INK} strokeWidth="3">
        <path d="M100 132 L 100 54" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="90" y="56" width="20" height="44" rx="10" fill="#FFC53D" />
        <rect x="92" y="64" width="16" height="8" rx="4" fill="#FFF3C9" />
        <rect x="92" y="76" width="16" height="8" rx="4" fill="#FFF3C9" />
        <rect x="92" y="88" width="16" height="8" rx="4" fill="#FFF3C9" />
        <rect x="94" y="52" width="12" height="7" rx="3.5" fill="#FF8C42" />
      </g>
      <g stroke={INK} strokeWidth="3" strokeLinecap="round">
        <ellipse cx="100" cy="158" rx="34" ry="18" fill="#D9A35E" />
        <path d="M78 154 l 8 6 M88 166 l 8 -4 M118 166 l -6 -4 M124 154 l -8 4" strokeWidth="2.5" />
        <path d="M70 160 C 60 158, 54 152, 52 144 C 62 146, 68 150, 72 158 Z" fill="#E8C07E" />
        <path d="M130 160 C 140 156, 146 150, 148 142 C 138 144, 132 150, 128 158 Z" fill="#C98D4B" />
      </g>
      <path d="M158 120 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  ginger: () => (
    <>
      <Sky />
      <g stroke={INK} strokeWidth="3">
        <path d="M84 130 C 82 116, 84 104, 92 90 C 96 102, 92 118, 90 128 Z" fill="#4CAF50" />
        <path d="M100 128 C 100 112, 102 98, 110 84 C 112 96, 106 112, 104 126 Z" fill="#5DBB50" />
        <path d="M114 132 C 116 118, 118 106, 126 94 C 126 106, 120 122, 118 130 Z" fill="#3F9D47" />
      </g>
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="100" cy="154" rx="38" ry="22" fill="#C98D4B" />
        <path d="M92 140 C 84 132, 78 132, 72 136 C 76 144, 84 148, 92 148 Z" fill="#D9A35E" />
        <path d="M116 140 C 126 132, 132 134, 136 140 C 130 148, 122 150, 114 148 Z" fill="#B97E3E" />
        <path d="M100 168 C 96 174, 100 178, 106 178 C 108 172, 106 168, 100 168 Z" fill="#D9A35E" />
        <path d="M76 162 C 70 166, 68 172, 72 176 C 78 174, 80 168, 80 164 Z" fill="#E0B070" />
        <circle cx="64" cy="150" r="3.5" fill="#8B5A2B" />
        <circle cx="136" cy="152" r="3.5" fill="#8B5A2B" />
      </g>
      <path d="M158 126 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </>
  ),
  default: () => (
    <>
      <Sky />
      {/* soil */}
      <rect x="42" y="132" width="116" height="52" rx="16" fill="#8B5A2B" stroke={INK} strokeWidth="4" />
      <path d="M60 148 h 80 M52 162 h 90" stroke="#6E4520" strokeWidth="3" strokeLinecap="round" />
      {/* carrot row */}
      <g stroke={INK} strokeWidth="3">
        <path d="M64 132 C 60 118, 58 108, 60 98 C 66 106, 70 116, 70 132 Z" fill="#FF8C42" />
        <path d="M60 98 C 52 90, 48 84, 50 78 C 58 82, 64 88, 66 96 Z" fill="#4CAF50" />
        <path d="M78 132 C 74 118, 72 106, 74 96 C 80 104, 84 116, 84 132 Z" fill="#FF9B57" />
        <path d="M74 96 C 66 88, 62 82, 64 76 C 72 80, 78 86, 80 94 Z" fill="#3F9D47" />
        <path d="M92 132 C 88 116, 86 104, 88 92 C 94 100, 98 114, 98 132 Z" fill="#FF8C42" />
        <path d="M88 92 C 80 82, 76 76, 78 70 C 86 74, 92 80, 94 90 Z" fill="#4CAF50" />
      </g>
      {/* leafy greens */}
      <g stroke={INK} strokeWidth="3">
        <path d="M116 132 C 112 116, 110 104, 112 92 C 122 104, 128 120, 126 132 Z" fill="#3F9D47" />
        <path d="M138 132 C 134 118, 132 106, 134 94 C 144 106, 150 122, 148 132 Z" fill="#4CAF50" />
        <path d="M130 92 C 124 84, 120 78, 122 72 C 128 76, 132 82, 134 90 Z" fill="#5DBB50" />
        <path d="M152 94 C 146 84, 142 78, 144 72 C 150 76, 154 82, 156 90 Z" fill="#59AD48" />
      </g>
    </>
  ),
};

/* ---------------------------------------------------------------
   The hero farm scene — a whole cartoon landscape in one SVG.
   Layered hills, a farmhouse, rows of crops, a tractor, clouds and
   a big sun. Pure vector, tiny, and it never changes.
   --------------------------------------------------------------- */

export function FarmScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 400"
      className={className}
      role="img"
      aria-label="Cartoon farm scene"
      fill="none"
    >
      {/* sky */}
      <rect width="520" height="400" rx="32" fill="#C9E8F7" />
      {/* sun */}
      <g transform="translate(432 64)">
        <circle r="30" fill="#FFC53D" stroke={INK} strokeWidth="4" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x="-3"
            y="-42"
            width="6"
            height="12"
            rx="3"
            fill="#FFC53D"
            transform={`rotate(${i * 30})`}
          />
        ))}
        <circle cx="-9" cy="-8" r="5" fill="#FFF3C9" />
      </g>
      {/* clouds */}
      <g stroke={INK} strokeWidth="3" fill="#FFFFFF">
        <ellipse cx="96" cy="58" rx="34" ry="16" />
        <ellipse cx="122" cy="50" rx="20" ry="13" />
        <ellipse cx="70" cy="52" rx="18" ry="12" />
      </g>
      <g stroke={INK} strokeWidth="3" fill="#FFFFFF" opacity="0.85">
        <ellipse cx="300" cy="96" rx="28" ry="13" />
        <ellipse cx="322" cy="90" rx="16" ry="10" />
      </g>
      {/* back hills */}
      <path d="M-20 400 C 60 300, 140 282, 220 320 C 300 356, 400 300, 540 340 L 540 420 L -20 420 Z" fill="#A5D69B" stroke={INK} strokeWidth="4" />
      {/* mid hill */}
      <path d="M-20 400 C 90 330, 200 322, 320 360 C 420 388, 480 372, 540 392 L 540 420 L -20 420 Z" fill="#7CCB63" stroke={INK} strokeWidth="4" />
      {/* crop rows */}
      <g stroke={INK} strokeWidth="3">
        <path d="M40 392 C 34 372, 30 356, 32 344 C 46 358, 54 376, 54 392 Z" fill="#4CAF50" />
        <path d="M74 392 C 68 370, 64 354, 66 342 C 80 356, 88 374, 88 392 Z" fill="#59AD48" />
        <path d="M108 392 C 102 372, 98 358, 100 346 C 114 360, 122 376, 122 392 Z" fill="#4CAF50" />
        <path d="M142 392 C 136 374, 132 360, 134 348 C 148 362, 156 378, 156 392 Z" fill="#59AD48" />
        <path d="M176 392 C 170 376, 166 364, 168 352 C 182 366, 190 380, 190 392 Z" fill="#4CAF50" />
      </g>
      {/* farmhouse */}
      <g>
        <rect x="248" y="248" width="96" height="78" rx="10" fill="#FFF8E7" stroke={INK} strokeWidth="4" />
        <path d="M234 252 L 296 204 L 358 252 Z" fill="#E2586F" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <rect x="272" y="288" width="46" height="38" rx="6" fill="#8B5A2B" stroke={INK} strokeWidth="4" />
        <circle cx="295" cy="307" r="4" fill="#FFC53D" stroke={INK} strokeWidth="2.5" />
        <rect x="252" y="254" width="16" height="14" rx="4" fill="#C9E8F7" stroke={INK} strokeWidth="3" />
        <rect x="322" y="254" width="16" height="14" rx="4" fill="#C9E8F7" stroke={INK} strokeWidth="3" />
      </g>
      {/* fence */}
      <g stroke={INK} strokeWidth="3" strokeLinecap="round">
        <path d="M252 396 h 92 M248 386 h 100 M248 376 h 100" />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={252 + i * 14} y1="372" x2={252 + i * 14} y2="400" strokeWidth="3" />
        ))}
      </g>
      {/* tractor */}
      <g transform="translate(392 348)">
        <rect x="6" y="10" width="26" height="18" rx="5" fill="#E2586F" stroke={INK} strokeWidth="3.5" />
        <path d="M34 16 L 50 20 L 50 28 L 30 28 Z" fill="#D9A35E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="18" cy="36" r="9" fill="#123B1F" />
        <circle cx="18" cy="36" r="4" fill="#C9E8F7" />
        <circle cx="46" cy="36" r="9" fill="#123B1F" />
        <circle cx="46" cy="36" r="4" fill="#C9E8F7" />
        <rect x="8" y="6" width="10" height="8" rx="3" fill="#123B1F" />
      </g>
      {/* sparkle */}
      <path d="M470 180 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFF3C9" stroke={INK} strokeWidth="2" />
    </svg>
  );
}
