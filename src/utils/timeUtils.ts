export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(secs).padStart(2, '0')}S`;
};