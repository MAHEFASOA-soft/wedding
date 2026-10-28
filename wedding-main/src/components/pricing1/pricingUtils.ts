// src/components/pricing1/pricingUtils.ts
import type { PackPricing } from './pricingPackTypes';

/**
 * Un pack référencé utilise son tarif de base comme supplément du pack parent.
 */
export const getPackSupplement = (pack: PackPricing): number =>
  pack.referencePackId ? pack.basePrice : 0;

/** Extrait le nombre d'invités depuis un en-tête de colonne (ex: "200 PERS." -> 200). */
export const getGuestCountFromHeader = (header: string): number => {
  const match = header.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

/** Retourne l'index de la colonne la plus proche du nombre d'invités demandé. */
export const findClosestColumnIndex = (headers: string[], guests: number): number => {
  let closestIndex = 0;
  let minDiff = Infinity;
  headers.forEach((header, index) => {
    const diff = Math.abs(getGuestCountFromHeader(header) - guests);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = index;
    }
  });
  return closestIndex;
};

const normalizeMealType = (value: string): string =>
  value.toLowerCase().replace(/[éèê]/g, 'e').replace(/[\s-]/g, '') === 'service'
    ? 'servis'
    : value.toLowerCase().replace(/[éèê]/g, 'e').replace(/[\s-]/g, '');

/**
 * Prix de base « Servis » du pack pour un nombre d'invités donné.
 * Retombe sur `basePrice` lorsque le pack n'a pas de grille tarifaire.
 */
export const getPackBasePrice = (pack: PackPricing, guests: number, mealType = 'Servis'): number => {
  if (!pack.pricingGrid) return pack.referencePackId ? 0 : pack.basePrice;

  const index = findClosestColumnIndex(pack.pricingGrid.headers, guests);
  const selectedRow = pack.pricingGrid.rows.find(
    (row) => normalizeMealType(row.label) === normalizeMealType(mealType)
  ) || pack.pricingGrid.rows[0];
  return selectedRow?.values[index] ?? (pack.referencePackId ? 0 : pack.basePrice);
};
