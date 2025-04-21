export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(secs).padStart(2, '0')}S`;
};

export const delay = (s: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return date.toLocaleString('en-US', options).replace(',', '');
}