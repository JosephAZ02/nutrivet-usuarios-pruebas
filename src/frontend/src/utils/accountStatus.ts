import type { AccountStatus } from "../interfaces/ReceivableAccount";


type BadgeVariant = "success" | "warning" | "danger" | "secondary";


export function statusLabel(status: AccountStatus): string {
  if (status === "PAGADA") {
    return "Pagada";
  }
  if (status === "VENCIDA") {
    return "Vencida";
  }
  return "Pendiente";
}


export function statusVariant(status: AccountStatus): BadgeVariant {
  if (status === "PAGADA") {
    return "success";
  }
  if (status === "VENCIDA") {
    return "danger";
  }
  return "warning";
}