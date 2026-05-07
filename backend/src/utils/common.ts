export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const exponentialBackoff = (attempt: number, baseDelay: number = 1000) => {
  return Math.pow(2, attempt) * baseDelay;
};

export const generateCustomId = (prefix: string = 'MINICOM') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${random}`;
};
