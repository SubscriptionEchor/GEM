export const formatNumber = (num: number): string => {
  return Math.floor(num).toString();
};

export const formatUSDT = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
}