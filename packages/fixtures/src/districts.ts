/**
 * HP districts — twelve administrative districts plus bilingual names for
 * the student mini app and district filters in the portal. `collegeCount`
 * is a placeholder that will be filled in by the HPU-167 import script.
 */

export interface HPDistrict {
  /** Kebab-case id used in URLs and filters. */
  id: string;
  /** English name (display default). */
  name: string;
  /** Hindi name — used when locale = hi. */
  nameHi: string;
  /** Optional grouping used for heatmaps / regional aggregates. */
  region?: "shimla" | "dharamshala" | "mandi" | "kinnaur_lahaul";
  /** Approximate centroid — wired to a heatmap in a later sprint. */
  centroid?: { lat: number; lng: number };
  /** Filled in by the import script once the HPU-167 xlsx lands. */
  collegeCount?: number;
}

export const HP_DISTRICTS: readonly HPDistrict[] = [
  { id: "bilaspur", name: "Bilaspur", nameHi: "बिलासपुर", region: "mandi", centroid: { lat: 31.33, lng: 76.76 } },
  { id: "chamba", name: "Chamba", nameHi: "चंबा", region: "dharamshala", centroid: { lat: 32.56, lng: 76.12 } },
  { id: "hamirpur", name: "Hamirpur", nameHi: "हमीरपुर", region: "dharamshala", centroid: { lat: 31.69, lng: 76.52 } },
  { id: "kangra", name: "Kangra", nameHi: "काँगड़ा", region: "dharamshala", centroid: { lat: 32.09, lng: 76.27 } },
  { id: "kinnaur", name: "Kinnaur", nameHi: "किन्नौर", region: "kinnaur_lahaul", centroid: { lat: 31.55, lng: 78.45 } },
  { id: "kullu", name: "Kullu", nameHi: "कुल्लू", region: "mandi", centroid: { lat: 31.96, lng: 77.1 } },
  { id: "lahaul_spiti", name: "Lahaul & Spiti", nameHi: "लाहौल और स्पीति", region: "kinnaur_lahaul", centroid: { lat: 32.58, lng: 77.26 } },
  { id: "mandi", name: "Mandi", nameHi: "मंडी", region: "mandi", centroid: { lat: 31.71, lng: 76.93 } },
  { id: "shimla", name: "Shimla", nameHi: "शिमला", region: "shimla", centroid: { lat: 31.1, lng: 77.17 } },
  { id: "sirmaur", name: "Sirmaur", nameHi: "सिरमौर", region: "shimla", centroid: { lat: 30.56, lng: 77.29 } },
  { id: "solan", name: "Solan", nameHi: "सोलन", region: "shimla", centroid: { lat: 30.9, lng: 77.1 } },
  { id: "una", name: "Una", nameHi: "ऊना", region: "dharamshala", centroid: { lat: 31.47, lng: 76.27 } },
];

const DISTRICT_BY_ID: Record<string, HPDistrict> = Object.fromEntries(
  HP_DISTRICTS.map((d) => [d.id, d]),
);

export function getDistrict(id: string): HPDistrict | undefined {
  return DISTRICT_BY_ID[id];
}

export function districtLabel(id: string, locale: "en" | "hi" = "en"): string {
  const d = getDistrict(id);
  if (!d) return id;
  return locale === "hi" ? d.nameHi : d.name;
}
