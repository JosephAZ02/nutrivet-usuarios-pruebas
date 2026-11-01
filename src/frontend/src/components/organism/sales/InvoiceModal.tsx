import type { InvoiceResponse } from "../../../interfaces/Sale";
import { exportInvoicePdf } from "../../../utils/exportInvoicePdf";
import Button from "../../atoms/Button";
import InvoiceView from "./InvoiceView";
import "./InvoiceModal.css";

interface InvoiceModalProps {
    invoice: InvoiceResponse; //factura que se muestra
    onClose: () => void; //se ejecuta al cerrar la ventana
}

function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
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
                    </div>

                    <div className="modal-footer">
                        <Button variant="outline" onClick={() => window.print()}>
                            <i className="bi bi-printer me-2" aria-hidden="true"></i>
                            Imprimir
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