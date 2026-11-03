
export function paymentLabel(method: string): string {
  if (method === "EFECTIVO") {
    return "Efectivo";
  }
  if (method === "SINPE") {
    return "SINPE";
  }
  if (method === "CREDITO") {
    return "Crédito";
  }
  return "Tarjeta";
}