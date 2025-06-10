
export const formatCurrency = (amount: number, currency: string = 'AUD', decimals: number = 2): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (num: number, decimals: number = 2): string => {
  return `${num >= 0 ? '+' : ''}${formatNumber(num, decimals)}%`;
};

export const formatLargeNumber = (num: number): string => {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  if (num >= billion) {
    return `${formatNumber(num / billion, 1)}B`;
  } else if (num >= million) {
    return `${formatNumber(num / million, 1)}M`;
  } else if (num >= thousand) {
    return `${formatNumber(num / thousand, 1)}K`;
  }
  return formatNumber(num);
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
