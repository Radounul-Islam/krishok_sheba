import type { ReactNode } from "react";
import { Flower, Sprout, Wheat } from "lucide-react";

export type CropType =
  | "rice"
  | "potato"
  | "tomato"
  | "wheat"
  | "chili"
  | "corn"
  | "mustard"
  | "onion"
  | "default";

export interface CropVisualMeta {
  type: CropType;
  labelEn: string;
  labelBn: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

export function detectCropType(text?: string | null): CropType {
  if (!text) return "default";
  const s = text.toLowerCase().trim();

  // Rice / ধান
  if (
    s.includes("ধান") ||
    s.includes("rice") ||
    s.includes("paddy") ||
    s.includes("dhan") ||
    s.includes("aman") ||
    s.includes("boro") ||
    s.includes("aus") ||
    s.includes("blast") ||
    s.includes("ব্লাস্ট") ||
    s.includes("sheath") ||
    s.includes("খোল") ||
    s.includes("brown spot") ||
    s.includes("বাদামি দাগ")
  ) {
    return "rice";
  }

  // Potato / আলু
  if (
    s.includes("আলু") ||
    s.includes("potato") ||
    s.includes("alu") ||
    s.includes("blight") ||
    s.includes("ধসা") ||
    s.includes("granola") ||
    s.includes("diamond")
  ) {
    // Check if it's tomato blight vs potato
    if (s.includes("টমেটো") || s.includes("tomato")) {
      return "tomato";
    }
    return "potato";
  }

  // Tomato / টমেটো
  if (
    s.includes("টমেটো") ||
    s.includes("tomato") ||
    s.includes("tometo") ||
    s.includes("leaf curl") ||
    s.includes("কোঁকড়ানো")
  ) {
    return "tomato";
  }

  // Wheat / গম
  if (
    s.includes("গম") ||
    s.includes("wheat") ||
    s.includes("gom") ||
    s.includes("rust") ||
    s.includes("মরিচা") ||
    s.includes("blotch")
  ) {
    return "wheat";
  }

  // Chili / মরিচ
  if (
    s.includes("মরিচ") ||
    s.includes("chili") ||
    s.includes("chilli") ||
    s.includes("pepper") ||
    s.includes("morich") ||
    s.includes("anthracnose") ||
    s.includes("অ্যানথ্রাকনোজ")
  ) {
    return "chili";
  }

  // Maize / Corn / ভুট্টা
  if (
    s.includes("ভুট্টা") ||
    s.includes("maize") ||
    s.includes("corn") ||
    s.includes("bhutta")
  ) {
    return "corn";
  }

  // Mustard / সরিষা
  if (
    s.includes("সরিষা") ||
    s.includes("mustard") ||
    s.includes("shorisha") ||
    s.includes("tori")
  ) {
    return "mustard";
  }

  // Onion / পেঁয়াজ
  if (
    s.includes("পেঁয়াজ") ||
    s.includes("পেয়াজ") ||
    s.includes("onion") ||
    s.includes("pyaj")
  ) {
    return "onion";
  }

  return "default";
}

export function getCropVisual(cropText?: string | null): CropVisualMeta {
  const type = detectCropType(cropText);

  switch (type) {
    case "rice":
      return {
        type: "rice",
        labelEn: "Rice / Paddy",
        labelBn: "ধান",
        badgeBg: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200/80",
        accentColor: "#4f7a32",
      };
    case "potato":
      return {
        type: "potato",
        labelEn: "Potato",
        labelBn: "আলু",
        badgeBg: "bg-amber-50/90",
        textColor: "text-amber-800",
        borderColor: "border-amber-200/80",
        accentColor: "#b45309",
      };
    case "tomato":
      return {
        type: "tomato",
        labelEn: "Tomato",
        labelBn: "টমেটো",
        badgeBg: "bg-rose-50",
        textColor: "text-rose-600",
        borderColor: "border-rose-200/80",
        accentColor: "#e11d48",
      };
    case "wheat":
      return {
        type: "wheat",
        labelEn: "Wheat",
        labelBn: "গম",
        badgeBg: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200/80",
        accentColor: "#ca8a04",
      };
    case "chili":
      return {
        type: "chili",
        labelEn: "Chili",
        labelBn: "মরিচ",
        badgeBg: "bg-red-50",
        textColor: "text-red-600",
        borderColor: "border-red-200/80",
        accentColor: "#dc2626",
      };
    case "corn":
      return {
        type: "corn",
        labelEn: "Maize / Corn",
        labelBn: "ভুট্টা",
        badgeBg: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-200/80",
        accentColor: "#ea580c",
      };
    case "mustard":
      return {
        type: "mustard",
        labelEn: "Mustard",
        labelBn: "সরিষা",
        badgeBg: "bg-lime-50",
        textColor: "text-lime-700",
        borderColor: "border-lime-200/80",
        accentColor: "#65a30d",
      };
    case "onion":
      return {
        type: "onion",
        labelEn: "Onion",
        labelBn: "পেঁয়াজ",
        badgeBg: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-200/80",
        accentColor: "#9333ea",
      };
    default:
      return {
        type: "default",
        labelEn: "Crop",
        labelBn: "ফসল",
        badgeBg: "bg-leaf-50",
        textColor: "text-leaf-700",
        borderColor: "border-leaf-200/80",
        accentColor: "#639343",
      };
  }
}

interface CropIconProps {
  crop?: string | null;
  cropType?: CropType;
  size?: number;
  className?: string;
}

export function CropIcon({
  crop,
  cropType,
  size = 18,
  className = "",
}: CropIconProps): ReactNode {
  const type = cropType || detectCropType(crop);

  switch (type) {
    case "rice":
      return <Wheat size={size} strokeWidth={2} className={className} />;

    case "potato":
      // Crisp SVG potato tuber with sprouts/eyes
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M11.5 3.2c4.2-.2 8.5 2.8 8.5 7.3 0 3.2-1.8 6-4.5 8-2.6 1.9-6.8 2.8-8.8 1.8-2.8-1.4-4.7-4.4-4.7-8.3 0-4.3 4.8-8.6 9.5-8.8z" />
          <path d="M7.5 9.5h.01" strokeWidth="3" />
          <path d="M15.5 8.5h.01" strokeWidth="3" />
          <path d="M11 14.5h.01" strokeWidth="3" />
          <path d="M16 13.5h.01" strokeWidth="3" />
          <path d="M8 13.5c.5.5 1 .5 1.5 0" />
        </svg>
      );

    case "tomato":
      // Crisp round tomato with leaf calyx
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="13.5" r="7.5" />
          <path d="M12 6V2.5" />
          <path d="M8.5 5.5c1.5 1 3.5 1 3.5 0s2 1 3.5 0" />
          <path d="M7 4.5c2 1.5 5 1.5 7 0" />
        </svg>
      );

    case "wheat":
      return <Wheat size={size} strokeWidth={2} className={className} />;

    case "chili":
      // Crisp curved chili pepper
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M13 2.5c.8 1.5 1.5 2.5 3 2.5" />
          <path d="M14 5c-1 0-3 1-4 3-2 3-3 7-2 10 1 2 3 3 4 3 2 0 4-1 5-4 1.5-4 1-9-3-12z" />
          <path d="M10.5 8.5c1 0 2 .5 2.5 1.8" />
        </svg>
      );

    case "corn":
      // Corn cob with husk
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <ellipse cx="12" cy="11" rx="4.5" ry="7.5" />
          <path d="M7.5 16.5c1.8 3.5 4.5 4.5 4.5 4.5s2.7-1 4.5-4.5" />
          <line x1="12" y1="3.5" x2="12" y2="18.5" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="8.5" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="9" y1="15.5" x2="15" y2="15.5" />
        </svg>
      );

    case "mustard":
      return <Flower size={size} strokeWidth={2} className={className} />;

    case "onion":
      // Onion bulb with green shoots
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2v4" />
          <path d="M9 3l3 3 3-3" />
          <path d="M12 6c-4.5 2-7 6-7 10 0 3.5 3 6 7 6s7-2.5 7-6c0-4-2.5-8-7-10z" />
          <path d="M12 8c-2 2.5-3 5-3 8" />
          <path d="M12 8c2 2.5 3 5 3 8" />
        </svg>
      );

    default:
      return <Sprout size={size} strokeWidth={2} className={className} />;
  }
}

