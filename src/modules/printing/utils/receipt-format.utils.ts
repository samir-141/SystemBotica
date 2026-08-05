export function formatMoney(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}

export function formatMoneyWithSymbol(value: number): string {
  return `S/ ${formatMoney(value)}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function padRight(value: string, width: number): string {
  return value.padEnd(width);
}

export function padLeft(value: string, width: number): string {
  return value.padStart(width);
}

export function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return String(qty);
  return qty.toFixed(2).replace(/\.?0+$/, "");
}
