import { useEffect, useState } from "react";
import ReportResults from "../components/organism/ReportResults";
import type SupplierInvoice from "../interfaces/SupplierInvoice";
import {
    getAllSupplierPayments,
    getInvoiceList,
    getSupplierPaymentsByInvoiceId,
    deleteSupplierInvoice,
    rejectSupplierInvoice,
    reviewSupplierInvoice,
    saveSupplierPayment,
} from "../services/SupplierInvoiceService";
import { getSupplierById } from "../services/SupplierService";
import { ModalPaymentSupplierInvoice } from "../components/organism/ModalPaymentSupplierInvoice";
import { ModalSupplierPayments } from "../components/organism/ModalSupplierPayments";
import type Supplier from "../interfaces/Supplier";
import type SupplierPayment from "../interfaces/SupplierPayment";
import type { SupplierPaymentCreate } from "../interfaces/SupplierPayment";
import type SupplierInvoiceReview from "../interfaces/SupplierInvoiceReview";
import { ModalReviewSupplierInvoice } from "../components/organism/ModalReviewSupplierInvoice";
import { showConfirm, showError, showSuccess } from "../utils/alerts";



export function AccountsPayablePage() {
    const headers = [
        "Proveedor",
        "Fecha",
        "Total",
        "Saldo pendiente",
        "Condición",
        "Vencimiento",
        "Estado",
        "Acciones",
    ];
    const [rows, setRows] = useState<(string | number)[][]>([]);
    const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState("ALL");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentsHistoryModal, setShowPaymentsHistoryModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
    const [payments, setPayments] = useState<SupplierPayment[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedSupplier, setSelectedSupplier] =
        useState<Supplier | null>(null);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);



    const getToday = () => {
        const today = new Date();
        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");
    };

    const getInvoiceState = (invoice: SupplierInvoice) => {
        const condition = invoice.condition?.trim().toUpperCase();
        const state = invoice.state?.trim().toUpperCase();

        if (condition === "CASH") {
            return "PAID";
        }

        if (
            state === "PENDING" &&
            invoice.dueDate &&
            invoice.dueDate < getToday()
        ) {
            return "OVERDUE";
        }

        return state;
    };

    const filteredInvoices = invoices.filter((invoice) =>
        selectedState === "ALL" || getInvoiceState(invoice) === selectedState
    );

    const filteredRows = filteredInvoices.map((invoice) => {
        const invoiceIndex = invoices.findIndex((item) => item.id === invoice.id);
        return rows[invoiceIndex];
    }).filter((row): row is (string | number)[] => row !== undefined);

    async function fetchData() {
        try {
            setLoading(true);
            const [response, payments] = await Promise.all([
                getInvoiceList(),
                getAllSupplierPayments(),
            ]);

            const invoicesWithDiscount = response.map((invoice) => {
                const paidAmount = payments
                    .filter((payment) => payment.idSupplierInvoice === invoice.id)
                    .reduce((total, payment) => total + payment.amount, 0);
                const pendingAmount = Math.max(invoice.totalAmount - paidAmount, 0);
                const condition = invoice.condition?.trim().toUpperCase();
                const state = condition === "CASH"
                    ? "PAID"
                    : invoice.state?.trim().toUpperCase() === "REVIEW"
                        ? "REVIEW"
                        : invoice.state?.trim().toUpperCase() === "CANCELLED"
                            ? "CANCELLED"
                            : pendingAmount <= 0.000001
                                ? "PAID"
                                : "PENDING";

                return {
                    ...invoice,
                    pendingAmount,
                    state,
                };
            });

            setInvoices(invoicesWithDiscount);
            const stateLabels: Record<string, string> = {
                PENDING: "Pendiente",
                REVIEW: "Por revisar",
                PAID: "Pagada",
                CANCELLED: "Cancelada",
                OVERDUE: "Vencida",
            };
            const conditionsLabels: Record<string, string> = {
                CASH: "Contado",
                CONTADO: "Contado",
                CREDIT: "Crédito",
                CREDITO: "Crédito",
            };

            const rows = await Promise.all(
                invoicesWithDiscount.map(async (invoice: SupplierInvoice) => {
                    return [
                        (await getSupplierById(invoice.idSupplier)).name,
                        invoice.date,
                        invoice.totalAmount,
                        invoice.pendingAmount,
                        conditionsLabels[invoice.condition?.trim().toUpperCase()] ?? "—",
                        invoice.dueDate,
                        stateLabels[getInvoiceState(invoice)] ?? invoice.state,
                    ];
                })
            );
            setRows(rows);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);



    const handleSavePayment = async (payment: SupplierPaymentCreate) => {
        try {
            setSaving(true);
            setMessage(null);
            await saveSupplierPayment(payment);
            await fetchData();
            setMessage({ type: "success", text: "Pago registrado correctamente." });
            setShowPaymentModal(false);
        } catch (error) {
            console.error(error);
            setMessage({ type: "danger", text: "No se pudo registrar el pago." });
        } finally {
            setSaving(false);
        }
    };



    const handlePayment = async (invoiceSupplierId: number) => {
        const invoice = invoices.find((item) => item.id === invoiceSupplierId);
        if (!invoice) return;

        setSelectedInvoice(invoice);
        setSelectedSupplier(null);
        setMessage(null);
        setShowPaymentModal(true);
        setSelectedSupplier(await getSupplierById(invoice.idSupplier));
    };

    const handleReview = async (invoiceSupplierId: number) => {
        const invoice = invoices.find((item) => item.id === invoiceSupplierId);
        if (!invoice) return;

        setSelectedInvoice(invoice);
        setSelectedSupplier(null);
        setShowReviewModal(true);
        setSelectedSupplier(await getSupplierById(invoice.idSupplier));
    };

    const handleAcceptReview = async (review: SupplierInvoiceReview) => {
        if (!selectedInvoice) return;
        try {
            setSaving(true);
            await reviewSupplierInvoice(selectedInvoice.id, review);
            await fetchData();
            setShowReviewModal(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleRejectReview = async () => {
        if (!selectedInvoice) return;
        try {
            setSaving(true);
            await rejectSupplierInvoice(selectedInvoice.id);
            await fetchData();
            setShowReviewModal(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (invoiceSupplierId: number) => {
        const invoice = invoices.find((item) => item.id === invoiceSupplierId);
        if (!invoice) return;

        const confirmed = await showConfirm(
            "¿Quitar factura?",
            "La factura será eliminada permanentemente.",
            "Quitar"
        );
        if (!confirmed) return;

        try {
            setSaving(true);
            await deleteSupplierInvoice(invoice);
            await fetchData();
            showSuccess("Factura eliminada", "La factura se quitó correctamente.");
        } catch (error) {
            console.error(error);
            showError(error, "No se pudo quitar la factura.");
        } finally {
            setSaving(false);
        }
    };

    const handleViewPayments = async (invoiceSupplierId: number) => {
        const invoice = invoices.find(
            (invoice) => invoice.id === invoiceSupplierId
        );

        if (!invoice) return;

        setSelectedInvoice(invoice);
        setPaymentsLoading(true);
        setShowPaymentsHistoryModal(true);
        try {
            setPayments(await getSupplierPaymentsByInvoiceId(invoice.id));
        } catch (error) {
            console.error(error);
            setPayments([]);
        } finally {
            setPaymentsLoading(false);
        }
    };
    return (
        <div className="p-4">
            <small className="text-success fw-semibold text-uppercase">Finanzas</small>
            <h1 className="h3">Cuentas por pagar</h1>
            <p className="text-muted mb-4">Facturas electrónicas recibidas de proveedores</p>
            <ModalPaymentSupplierInvoice
                supplierInvoice={selectedInvoice}
                supplier={selectedSupplier}
                onSave={handleSavePayment}
                saving={saving}
                message={message}
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
            />

            <ModalReviewSupplierInvoice
                show={showReviewModal}
                invoice={selectedInvoice}
                supplier={selectedSupplier}
                saving={saving}
                onClose={() => setShowReviewModal(false)}
                onAccept={handleAcceptReview}
                onReject={handleRejectReview}
            />

            <ModalSupplierPayments
                show={showPaymentsHistoryModal}
                onClose={() => setShowPaymentsHistoryModal(false)}
                supplierInvoice={selectedInvoice}
                payments={payments}
                loading={paymentsLoading}
            />

            <div className="mb-3 d-flex align-items-center gap-2">
                <label htmlFor="supplier-invoice-state" className="form-label mb-0">
                    Estado:
                </label>
                <select
                    id="supplier-invoice-state"
                    className="form-select w-auto"
                    value={selectedState}
                    onChange={(event) => setSelectedState(event.target.value)}
                >
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="REVIEW">Por revisar</option>
                    <option value="OVERDUE">Vencidas</option>
                    <option value="PAID">Pagadas</option>
                    <option value="CANCELLED">Canceladas</option>
                </select>
            </div>

            <ReportResults
                headers={headers}
                rows={filteredRows}
                loading={loading}
                title="Cuentas por pagar"
                invoiceIds={filteredInvoices.map((invoice) => invoice.id)}
                onPayment={handlePayment}
                onViewPayments={handleViewPayments}
                onRemove={handleRemove}
                reviewInvoiceIds={filteredInvoices
                    .filter((invoice) => invoice.state === "REVIEW")
                    .map((invoice) => invoice.id)}
                onReview={handleReview}
            />
        </div>
    );
}