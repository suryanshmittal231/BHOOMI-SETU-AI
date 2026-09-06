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
    const fractionMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (fractionMatch) {
      const num = parseFloat(fractionMatch[1]);
      const den = parseFloat(fractionMatch[2]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
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
 * Automatically recalculates and updates the (XX%) percentage representation
 * whenever a fraction like "1/4", "1/4 (50%)", "2/3" or decimal is entered.
 */
export function formatShareRatioWithPercentage(shareRatio: string): { formatted: string; fraction: number } {
  if (!shareRatio) return { formatted: '', fraction: 0 };
  const trimmed = shareRatio.trim();

  // 1. Check for fraction pattern "num / den"
  const fractionMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?:\s*\(.*?\))?/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (!isNaN(num) && !isNaN(den) && den > 0) {
      const frac = num / den;
      const pct = frac * 100;
      const pctStr = Number.isInteger(pct) ? pct.toString() : pct.toFixed(2);
      return {
        formatted: `${fractionMatch[1]}/${fractionMatch[2]} (${pctStr}%)`,
        fraction: frac
      };
    }
  }

  // 2. Percentage pattern "XX%"
  const pctMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*%(?:\s*\(.*?\))?/);
  if (pctMatch) {
    const val = parseFloat(pctMatch[1]);
    if (!isNaN(val)) {
      return {
        formatted: `${val}% (${val}%)`,
        fraction: val / 100
      };
    }
  }

  // 3. Decimal pattern "0.25"
  const dec = parseFloat(trimmed);
  if (!isNaN(dec) && dec > 0 && dec <= 1 && !trimmed.includes('/')) {
    const pct = dec * 100;
    const pctStr = Number.isInteger(pct) ? pct.toString() : pct.toFixed(2);
    return {
      formatted: `${dec} (${pctStr}%)`,
      fraction: dec
    };
  }

  const frac = parseShareFraction(shareRatio);
  return { formatted: shareRatio, fraction: frac };
}

/**
 * Formats Hectare area into clean localized string
 */
export function formatArea(hectares: number, primaryUnit: AreaUnit = 'HECTARE'): string {
  const primaryVal = convertArea(hectares, 'HECTARE', primaryUnit);
  const unitInfo = UNIT_LABELS[primaryUnit];
  return `${primaryVal.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${unitInfo.symbol} (${hectares.toFixed(4)} ha)`;
}
