import type { LucideIcon } from "lucide-react";
import {
  Monitor,
  Users,
  BarChart2,
  Code2,
  Languages,
  HeartHandshake,
  Euro,
  Megaphone,
  Leaf,
  GraduationCap,
} from "lucide-react";

type CategorieConfig = {
  icon: LucideIcon;
  gradientStyle: string;
};

const CATEGORIE_ICONS: Record<string, CategorieConfig> = {
  bureautique: {
    icon: Monitor,
    gradientStyle: "linear-gradient(135deg, #1e40af, #3b82f6)",
  },
  management: {
    icon: Users,
    gradientStyle: "linear-gradient(135deg, #4c1d95, #7c3aed)",
  },
  commercial: {
    icon: BarChart2,
    gradientStyle: "linear-gradient(135deg, #14532d, #16a34a)",
  },
  informatique: {
    icon: Code2,
    gradientStyle: "linear-gradient(135deg, #1e293b, #475569)",
  },
  langues: {
    icon: Languages,
    gradientStyle: "linear-gradient(135deg, #78350f, #d97706)",
  },
  rh: {
    icon: HeartHandshake,
    gradientStyle: "linear-gradient(135deg, #831843, #db2777)",
  },
  finance: {
    icon: Euro,
    gradientStyle: "linear-gradient(135deg, #134e4a, #0d9488)",
  },
  marketing: {
    icon: Megaphone,
    gradientStyle: "linear-gradient(135deg, #7c2d12, #ea580c)",
  },
  "bien-être": {
    icon: Leaf,
    gradientStyle: "linear-gradient(135deg, #134e4a, #14b8a6)",
  },
};

const DEFAULT_CATEGORIE: CategorieConfig = {
  icon: GraduationCap,
  gradientStyle: "linear-gradient(135deg, #1e40af, #3b82f6)",
};

export function getCategorieConfig(categorie: string | null): CategorieConfig {
  if (!categorie) return DEFAULT_CATEGORIE;
  const key = categorie.toLowerCase().replace(/\s+/g, "-");
  return CATEGORIE_ICONS[key] ?? DEFAULT_CATEGORIE;
}
