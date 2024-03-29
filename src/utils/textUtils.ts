export const shortcutText = (text: string) => {
  // Cut it to the first and last 5 symbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(text) || [];

  return start && end ? `${start}...${end}` : text;
};

export const capitalize = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

export const formatAmount = (amount: number | string) => {
  if (!amount) return '0';
  const parts = amount.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

export const formatBlockNumber = (blockNumber: number | undefined) => {
  if (!blockNumber) return '';

  return blockNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatKusamaBalance = (balance: string | number, decimals = 12) => {
  const balanceValue = Number(balance);
  return (balanceValue / Math.pow(10, decimals)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

export const formatFiatPrice = (price: string | number) => {
  const priceValue = Number(price);
  return (priceValue / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};
