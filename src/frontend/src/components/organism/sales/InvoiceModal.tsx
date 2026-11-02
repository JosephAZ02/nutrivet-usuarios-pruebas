import type { InvoiceResponse } from "../../../interfaces/Sale";
import { exportInvoicePdf } from "../../../utils/exportInvoicePdf";
import Button from "../../atoms/Button";
import InvoiceView from "./InvoiceView";
import InvoiceTicket from "./InvoiceTicket";
import "./InvoiceModal.css";

interface InvoiceModalProps {
    invoice: InvoiceResponse; //factura que se muestra
    onClose: () => void; //se ejecuta al cerrar la ventana
}

function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {

    // imprime el formato de ticket de 80 mm; al terminar vuelve al formato normal
    function printTicket() {
        document.body.classList.add("print-ticket");
        window.addEventListener("afterprint", () => document.body.classList.remove("print-ticket"), { once: true });
        window.print();
    }

    return (
        <div className="modal d-block invoice-modal" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Venta registrada</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <InvoiceView invoice={invoice} />
                        <InvoiceTicket invoice={invoice} />
                    </div>

                    <div className="modal-footer">
                        <Button variant="outline" onClick={() => window.print()}>
                            <i className="bi bi-printer me-2" aria-hidden="true"></i>
                            Imprimir factura
                        </Button>
                        <Button variant="outline" onClick={printTicket}>
                            <i className="bi bi-receipt me-2" aria-hidden="true"></i>
                            Imprimir ticket
                        </Button>
                        <Button variant="outline" onClick={() => exportInvoicePdf(invoice)}>
                            <i className="bi bi-download me-2" aria-hidden="true"></i>
                            Descargar PDF
                        </Button>
                        <Button variant="success" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default InvoiceModal;