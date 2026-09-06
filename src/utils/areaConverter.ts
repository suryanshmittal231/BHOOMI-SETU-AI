export type AreaUnit = 'HECTARE' | 'ACRE' | 'BIGHA' | 'BISWA' | 'GUNTHA' | 'SQ_METER' | 'SQ_FEET';

// Conversion factors relative to 1 HECTARE (10,000 sq meters)
export const AREA_CONVERSIONS_TO_HECTARE: Record<AreaUnit, number> = {
  HECTARE: 1,
  ACRE: 0.404686,
  BIGHA: 0.2529, // Standard UP/MP Pucca Bigha (~2529.28 sq meters)
  BISWA: 0.012646, // 1/20 of Pucca Bigha
  GUNTHA: 0.010117, // Maharashtra / Karnataka / Gujarat (101.17 sq meters)
  SQ_METER: 0.0001,
  SQ_FEET: 0.0000092903
};

export const UNIT_LABELS: Record<AreaUnit, { en: string; hi: string; symbol: string }> = {
  HECTARE: { en: 'Hectare', hi: 'हेक्टेयर', symbol: 'ha' },
  ACRE: { en: 'Acre', hi: 'एकड़', symbol: 'ac' },
  BIGHA: { en: 'Bigha (Pucca)', hi: 'बीघा (पक्का)', symbol: 'bigha' },
  BISWA: { en: 'Biswa', hi: 'बिस्वा', symbol: 'biswa' },
  GUNTHA: { en: 'Guntha', hi: 'गुंठा', symbol: 'guntha' },
  SQ_METER: { en: 'Square Meter', hi: 'वर्ग मीटर', symbol: 'sq m' },
  SQ_FEET: { en: 'Square Feet', hi: 'वर्ग फुट', symbol: 'sq ft' }
};

/**
 * Converts area from one unit to another
 */
export function convertArea(amount: number, fromUnit: AreaUnit, toUnit: AreaUnit): number {
  if (!amount || isNaN(amount)) return 0;
  const inHectares = amount * AREA_CONVERSIONS_TO_HECTARE[fromUnit];
  const converted = inHectares / AREA_CONVERSIONS_TO_HECTARE[toUnit];
  return Number(converted.toFixed(4));
}

/**
 * Parses fractional share strings like "1/2", "1/4", "33.33%", "0.5" into numeric fraction
 */
export function parseShareFraction(shareRatio: string): number {
  if (!shareRatio) return 0;
  const trimmed = shareRatio.trim();
  
  if (trimmed.includes('/')) {
    const [num, den] = trimmed.split('/').map(s => parseFloat(s.trim()));
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }
  
  if (trimmed.includes('%')) {
    const val = parseFloat(trimmed.replace('%', ''));
    if (!isNaN(val)) return val / 100;
  }
  
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats Hectare area into clean localized string
 */
export function formatArea(hectares: number, primaryUnit: AreaUnit = 'HECTARE'): string {
  const primaryVal = convertArea(hectares, 'HECTARE', primaryUnit);
  const unitInfo = UNIT_LABELS[primaryUnit];
  return `${primaryVal.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${unitInfo.symbol} (${hectares.toFixed(4)} ha)`;
}
