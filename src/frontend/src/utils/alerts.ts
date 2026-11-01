import Swal from "sweetalert2";

// muestra el error que manda el backend (texto plano) o un mensaje de respaldo
export function showError(err: any, fallback: string) {
  let message = fallback;

  if (err.response?.status === 403) {
    message = "No tiene permiso para realizar esta acción";
  } else if (typeof err.response?.data === "string" && err.response.data !== "") {
    message = err.response.data;
  }

  Swal.fire({
    icon: "error",
    title: "No se pudo completar",
    text: message,
    confirmButtonText: "Aceptar",
  });
}

export function showSuccess(title: string, text: string) {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
  });
}

export function showWarning(title: string, text: string) {
  Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
  });
}