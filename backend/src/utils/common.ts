export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const exponentialBackoff = (attempt: number, baseDelay: number = 1000) => {
  return Math.pow(2, attempt) * baseDelay;
};
