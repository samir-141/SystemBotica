// src/components/venta/utils.ts
export const formatMoney = (amount: number, simbolo = "S/") => `${simbolo} ${amount.toFixed(2)}`;
