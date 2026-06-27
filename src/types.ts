export interface ScanResult {
  vondstType: string;
  naam: string;
  gevaarlijk: boolean;
  beschrijving: string;
  roestNiveau: "Laag" | "Gemiddeld" | "Extreem";
  historischeSchatting: string;
  materiaal: string;
  tips: string[];
  geschatteWaarde: string;
}

export interface PresetFind {
  id: string;
  naam: string;
  label: string;
  beschrijving: string;
  imageUrl: string;
}
