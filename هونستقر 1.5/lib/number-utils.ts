/**
 * Formats a number to a string with English (Latin) digits.
 * Useful for ensuring English digits are displayed even in Arabic locales.
 */
export function formatEnglishNumber(
  value: number | string,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  // Explicitly use 'en-US' to get Latin digits
  return new Intl.NumberFormat('en-US', options).format(num);
}

/**
 * Replaces any Arabic digits in a string with English digits.
 */
export function toEnglishDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (w) => arabicDigits.indexOf(w).toString());
}
