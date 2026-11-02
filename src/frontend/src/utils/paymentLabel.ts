// nombre del método de pago como se muestra en la factura
export function paymentLabel(method: string): string {
  if (method === "EFECTIVO") {
    return "Efectivo";
  }
  if (method === "SINPE") {
    return "SINPE";
  }
  return "Tarjeta";
}