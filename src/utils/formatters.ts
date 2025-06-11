
/**
 * Utility functions for formatting data display
 */

/**
 * Format a number as currency with Australian Dollar symbol
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'AUD',
  decimals: number = 2
): string => {
  const symbol = currency === 'AUD' ? '$' : '$';
  
  if (amount === 0) return `${symbol}0.00`;
  
  // Handle negative numbers
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Format large numbers with K, M, B suffixes
  if (absoluteAmount >= 1000000000) {
    const formatted = (absoluteAmount / 1000000000).toFixed(1);
    return `${isNegative ? '-' : ''}${symbol}${formatted}B`;
  } else if (absoluteAmount >= 1000000) {
    const formatted = (absoluteAmount / 1000000).toFixed(1);
    return `${isNegative ? '-' : ''}${symbol}${formatted}M`;
  } else if (absoluteAmount >= 1000) {
    const formatted = (absoluteAmount / 1000).toFixed(1);
    return `${isNegative ? '-' : ''}${symbol}${formatted}K`;
  }
  
  // Standard formatting for smaller amounts
  const formatter = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${isNegative ? '-' : ''}${symbol}${formatter.format(absoluteAmount)}`;
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2,
  includeSign: boolean = true
): string => {
  if (value === 0) return '0.00%';
  
  const percentage = value * 100;
  const isPositive = percentage > 0;
  const sign = includeSign && isPositive ? '+' : '';
  
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Format a price with appropriate decimal places
 */
export const formatPrice = (
  price: number,
  currency: string = 'AUD',
  maxDecimals: number = 8
): string => {
  if (price === 0) return formatCurrency(0, currency);
  
  // Determine appropriate decimal places based on price magnitude
  let decimals = 2;
  if (price < 0.01) decimals = Math.min(8, maxDecimals);
  else if (price < 1) decimals = Math.min(4, maxDecimals);
  else if (price < 100) decimals = Math.min(3, maxDecimals);
  
  return formatCurrency(price, currency, decimals);
};

/**
 * Format a cryptocurrency amount with appropriate decimal places
 */
export const formatCryptoAmount = (
  amount: number,
  symbol: string = 'BTC',
  maxDecimals: number = 8
): string => {
  if (amount === 0) return `0 ${symbol}`;
  
  // Determine decimal places based on amount
  let decimals = maxDecimals;
  if (amount >= 1000) decimals = 2;
  else if (amount >= 1) decimals = 4;
  else if (amount >= 0.01) decimals = 6;
  
  const formatter = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
  
  return `${formatter.format(amount)} ${symbol}`;
};

/**
 * Format a large number with K/M/B suffixes
 */
export const formatLargeNumber = (num: number, decimals: number = 1): string => {
  if (num === 0) return '0';
  
  const isNegative = num < 0;
  const absoluteNum = Math.abs(num);
  
  if (absoluteNum >= 1000000000) {
    return `${isNegative ? '-' : ''}${(absoluteNum / 1000000000).toFixed(decimals)}B`;
  } else if (absoluteNum >= 1000000) {
    return `${isNegative ? '-' : ''}${(absoluteNum / 1000000).toFixed(decimals)}M`;
  } else if (absoluteNum >= 1000) {
    return `${isNegative ? '-' : ''}${(absoluteNum / 1000).toFixed(decimals)}K`;
  }
  
  return num.toLocaleString('en-AU');
};

/**
 * Format a timestamp as a relative time string
 */
export const formatTimeAgo = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-AU');
};

/**
 * Format a time duration in seconds to human readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};

/**
 * Format a number with appropriate color class for positive/negative values
 */
export const getValueColor = (value: number): string => {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-red-500';
  return 'text-slate-400';
};

/**
 * Format market cap rank with ordinal suffix
 */
export const formatRank = (rank: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = rank % 100;
  return rank + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};

/**
 * Truncate a string to specified length with ellipsis
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Format a wallet address with ellipsis in the middle
 */
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
