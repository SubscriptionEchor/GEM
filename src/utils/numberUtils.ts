export const formatNumber = (num: number): string => {
  return num.toFixed(5);
};

export const formatUSDT = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
}