/**
 * Helper utility functions for recipe costing calculations
 */

/**
 * Convert units to grams for standardized calculations
 * @param value - The numeric value to convert
 * @param unit - The unit to convert from (g, kg, lb, oz, ml, l, pcs)
 * @returns The value in grams
 */
export function convertToGrams(value: number, unit: string): number {
  const conversions: { [key: string]: number } = {
    'g': 1,
    'kg': 1000,
    'lb': 453.592,
    'oz': 28.3495,
    'ml': 1, // Assuming 1ml = 1g for liquids (water density)
    'l': 1000,
    'pcs': 1, // Pieces don't convert, treat as 1:1
  };
  
  return value * (conversions[unit] || 1);
}

/**
 * Calculate price per gram for a vendor
 * @param price - The vendor's price
 * @param weight - The weight/quantity for that price
 * @param packageSize - The unit of the package (g, kg, lb, oz, ml, l, pcs)
 * @returns Price per gram
 */
export function calculatePricePerGram(
  price: number,
  weight: number,
  packageSize: string
): number {
  if (!price || !weight) return 0;
  
  const weightInGrams = convertToGrams(weight, packageSize);
  return price / weightInGrams;
}

/**
 * Calculate ingredient cost based on quantity and vendor pricing
 * @param quantity - Amount of ingredient needed
 * @param unit - Unit of the quantity (g, kg, lb, oz, ml, l, pcs)
 * @param pricePerGram - Price per gram from vendor
 * @returns Total cost for the ingredient
 */
export function calculateIngredientCost(
  quantity: number,
  unit: string,
  pricePerGram: number
): number {
  const quantityInGrams = convertToGrams(quantity, unit);
  return quantityInGrams * pricePerGram;
}

/**
 * Format currency value to 2 decimal places
 * @param value - Numeric value to format
 * @returns Formatted currency string with $ symbol
 */
export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Get the default price for a product based on default vendor index
 * @param product - Product object with vendor pricing
 * @returns Default vendor price
 */
export function getDefaultPrice(product: any): number {
  const prices = [
    product.vendor1_price,
    product.vendor2_price,
    product.vendor3_price
  ];
  return prices[product.default_vendor_index] || 0;
}

/**
 * Get the default vendor weight for a product based on default vendor index
 * @param product - Product object with vendor weights
 * @returns Default vendor weight
 */
export function getDefaultWeight(product: any): number {
  const weights = [
    product.vendor1_weight,
    product.vendor2_weight,
    product.vendor3_weight
  ];
  return weights[product.default_vendor_index] || 0;
}

/**
 * Get the default vendor package size for a product based on default vendor index
 * @param product - Product object with vendor package sizes
 * @returns Default vendor package size
 */
export function getDefaultPackageSize(product: any): string {
  const packageSizes = [
    product.vendor1_package_size,
    product.vendor2_package_size,
    product.vendor3_package_size
  ];
  return packageSizes[product.default_vendor_index] || 'g';
}

/**
 * Get the default vendor name for a product based on default vendor index
 * @param product - Product object with vendor names
 * @returns Default vendor name
 */
export function getDefaultVendorName(product: any): string {
  const vendorNames = [
    product.vendor1_name,
    product.vendor2_name,
    product.vendor3_name
  ];
  return vendorNames[product.default_vendor_index] || 'N/A';
}

/**
 * Calculate price per gram for the default vendor
 * @param product - Product object with vendor pricing and weights
 * @returns Price per gram for default vendor
 */
export function getDefaultPricePerGram(product: any): number {
  const price = getDefaultPrice(product);
  const weight = getDefaultWeight(product);
  const packageSize = getDefaultPackageSize(product);
  
  return calculatePricePerGram(price, weight, packageSize);
}

/**
 * Safe number parser that returns 0 for invalid values
 * @param value - Value to parse
 * @returns Parsed number or 0
 */
export function safeParseFloat(value: any): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Safe number parser for integers that returns 0 for invalid values
 * @param value - Value to parse
 * @returns Parsed integer or 0
 */
export function safeParseInt(value: any): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}
