// src/components/pricing1/pricingPackHelpers.ts

import type { PackPricing } from './pricingPackTypes';

/**
 * Retourne le pack référencé par un autre pack.
 */
export const getReferencePack = (
  pack: PackPricing,
  packs: PackPricing[]
): PackPricing | undefined => {
  if (!pack.referencePackId) {
    return undefined;
  }

  return packs.find(
    (item) => item.id === pack.referencePackId
  );
};

/**
 * Retourne toutes les prestations héritées d'un pack
 * sans inclure ses propres prestations.
 *
 * Exemple :
 *
 * Pack Or
 *   -> référence Pack Rêve
 *
 * getInheritedItems(Pack Or)
 *   => prestations du Pack Rêve
 */
export const getInheritedItems = (
  pack: PackPricing,
  packs: PackPricing[],
  visited = new Set<string>()
): string[] => {
  if (visited.has(pack.id)) {
    return [];
  }

  const nextVisited = new Set(visited);
  nextVisited.add(pack.id);

  const referencePack = getReferencePack(pack, packs);

  if (!referencePack) {
    return [];
  }

  return [
    ...getInheritedItems(
      referencePack,
      packs,
      nextVisited
    ),
    ...referencePack.includedItems,
  ];
};

/**
 * Retourne toutes les prestations réellement disponibles
 * dans le pack :
 *
 * prestations héritées
 * +
 * prestations propres
 */
export const getAllIncludedItems = (
  pack: PackPricing,
  packs: PackPricing[],
  visited = new Set<string>()
): string[] => {
  if (visited.has(pack.id)) {
    return [];
  }

  const nextVisited = new Set(visited);
  nextVisited.add(pack.id);

  const referencePack = getReferencePack(
    pack,
    packs
  );

  const inheritedItems = referencePack
    ? getAllIncludedItems(
        referencePack,
        packs,
        nextVisited
      )
    : [];

  return [
    ...inheritedItems,
    ...pack.includedItems,
  ];
};

/**
 * Prestations propres au pack uniquement.
 */
export const getOwnIncludedItems = (
  pack: PackPricing
): string[] => {
  return pack.includedItems;
};

/**
 * Vérifie si un pack peut référencer un autre pack.
 *
 * On empêche :
 * - le pack de se référencer lui-même ;
 * - une référence circulaire.
 */
export const canReferencePack = (
  packId: string,
  referencePackId: string,
  packs: PackPricing[]
): boolean => {
  if (!referencePackId) {
    return true;
  }

  if (packId === referencePackId) {
    return false;
  }

  let current = packs.find(
    (pack) => pack.id === referencePackId
  );

  const visited = new Set<string>();

  while (current) {
    if (visited.has(current.id)) {
      return false;
    }

    visited.add(current.id);

    if (current.referencePackId === packId) {
      return false;
    }

    if (!current.referencePackId) {
      return true;
    }

    current = packs.find(
      (pack) =>
        pack.id === current?.referencePackId
    );
  }

  return true;
};