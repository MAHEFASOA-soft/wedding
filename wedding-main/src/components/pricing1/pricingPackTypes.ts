export interface PricingGrid {
  headers: string[];
  rows: {
    label: string;
    values: number[];
  }[];
}

export interface PackPricing {
  id: string;
  category: string;
  name: string;
  description: string;
  badge?: string | null;
  popular?: boolean;
  basePrice: number;
  referencePackId?: string | null;
  referenceText?: string | null;
  includedItems: string[];
  pricingGrid?: PricingGrid | null;
  extraInfo?: string | null;
}