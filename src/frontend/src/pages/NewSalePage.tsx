import { useEffect, useState } from "react";
import type Product from "../interfaces/Product";
import type ProductCategory from "../interfaces/ProductCategory";
import type CartItem from "../interfaces/CartItem";
import type Client from "../interfaces/Client";
import type CreditData from "../interfaces/CreditData";
import type { InvoiceResponse, PaymentMethod, SaleRequest } from "../interfaces/Sale";
import { getAllProducts, searchProductByCode } from "../services/ProductService";
import { getActiveProductCategories } from "../services/ProductCategoryService";
import { createSale } from "../services/SaleService";
import { addClient, getAllClients } from "../services/ClientService";
import { showConfirm, showError, showWarning } from "../utils/alerts";
import { formatCurrency } from "../utils/formatCurrency";
import Button from "../components/atoms/Button";
import ProductSearchBar from "../components/molecules/ProductSearchBar";
import CategoryFilter from "../components/molecules/CategoryFilter";
import ProductCard from "../components/molecules/ProductCard";
import Pagination from "../components/molecules/Pagination";
import CartRow from "../components/molecules/CartRow";
import PaymentSummary from "../components/molecules/PaymentSummary";
import InvoiceModal from "../components/organism/sales/InvoiceModal";
import CreditModal from "../components/organism/sales/CreditModal";
import ClientFormModal from "../components/organism/sales/ClientFormModal";

const PAGE_SIZE = 6; // productos por página (llena filas completas de 2 o de 3)

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [amountReceived, setAmountReceived] = useState("");
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [clients, setClients] = useState<Client[]>([]); // clientes para las ventas a crédito
  const [showCredit, setShowCredit] = useState(false); // ventana del crédito abierta
  const [showClientForm, setShowClientForm] = useState(false); // ventana de nuevo cliente abierta
  const [savingClient, setSavingClient] = useState(false);
  const [creditData, setCreditData] = useState<CreditData>({ clientId: "", initialPayment: "", monthlyInstallment: "", dueDate: "" });
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null); // total con el que se confirmó el crédito

  // al abrir la pantalla se cargan los productos y las categorías
  useEffect(() => {
    async function loadData() {
      try {
        const productList = await getAllProducts();
        setProducts(productList.filter((p) => p.productAmount > 0)); // no se muestran los agotados
        setCategories(await getActiveProductCategories());
      } catch (err: any) {
        showError(err, "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // vuelve a pedir los productos para que el catálogo muestre el stock actualizado
  async function refreshProducts() {
    try {
      const productList = await getAllProducts();
      setProducts(productList.filter((p) => p.productAmount > 0));
    } catch (err: any) {
      showError(err, "No se pudieron cargar los productos");
    }
  }

  // productos que se ven según la categoría elegida y el texto del buscador
  const text = searchText.trim().toLowerCase();
  const visibleProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === null || p.category.id === selectedCategoryId;
    const matchesText = text === "" || p.name.toLowerCase().includes(text) || p.code.toLowerCase().includes(text);
    return matchesCategory && matchesText;
  });

  // paginación del catálogo, solo se muestran los productos de la página actual
  const totalPages = Math.ceil(visibleProducts.length / PAGE_SIZE);
  const page = Math.min(currentPage, Math.max(totalPages, 1)); // por si la lista se acorta y la página ya no existe
  const pageProducts = visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // al cambiar la categoría o el texto del buscador se vuelve a la primera página
  function handleCategoryChange(id: number | null) {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  }

  function handleSearchChange(newText: string) {
    setSearchText(newText);
    setCurrentPage(1);
  }

  // total de la venta, suma de precio por cantidad de cada línea
  let total = 0;
  for (const item of cart) {
    total = total + item.product.unitPrice * item.quantity;
  }

  // se puede cobrar si hay productos y, en efectivo, el monto recibido alcanza
  const cashIsEnough = amountReceived !== "" && Number(amountReceived) >= total;

  // el crédito sirve solo si se confirmó con el total actual (si el carrito cambia, hay que confirmarlo de nuevo)
  const creditReady = confirmedTotal !== null && confirmedTotal === total;
  const creditClientName = clients.find((c) => c.id === creditData.clientId)?.name ?? "";

  let methodIsReady = true;
  if (paymentMethod === "EFECTIVO") {
    methodIsReady = cashIsEnough;
  } else if (paymentMethod === "CREDITO") {
    methodIsReady = creditReady;
  }
  const canPay = cart.length > 0 && methodIsReady;

  // mensaje que explica por qué el botón de cobrar está desactivado
  let payHint = "";
  if (cart.length === 0) {
    payHint = "Debes agregar productos al carrito";
  } else if (paymentMethod === "EFECTIVO" && amountReceived === "") {
    payHint = "Ingresa el monto recibido para poder cobrar";
  } else if (paymentMethod === "EFECTIVO" && !cashIsEnough) {
    payHint = "El monto recibido no alcanza para cubrir el total";
  } else if (paymentMethod === "CREDITO" && !creditReady) {
    payHint = "Configura el crédito para poder cobrar";
  }

  // agrega el producto al detalle, o le suma una unidad si ya estaba
  function handleAdd(product: Product) {
    const existing = cart.find((item) => item.product.id === product.id);

    if (existing === undefined) {
      setCart([...cart, { product: product, quantity: 1 }]);
    } else if (existing.quantity < product.productAmount) {
      handleQuantityChange(product, existing.quantity + 1);
    } else {
      showWarning("Sin más existencias", `Solo hay ${product.productAmount} unidades de "${product.name}"`);
    }
  }

  // cambia la cantidad de una línea; si llega a 0 la quita del detalle
  function handleQuantityChange(product: Product, quantity: number) {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== product.id));
    } else {
      setCart(cart.map((item) => (item.product.id === product.id ? { product: product, quantity: quantity } : item)));
    }
  }

  // vacía el detalle de venta
  function handleClear() {
    setCart([]);
    setAmountReceived("");
  }

  // abre la ventana del crédito (carga los clientes la primera vez)
  async function handleConfigureCredit() {
    if (cart.length === 0) {
      showWarning("Carrito vacío", "Primero agrega productos para configurar el crédito");
      return;
    }

    setShowCredit(true);

    try {
      setClients(await getAllClients());
    } catch (err: any) {
      showError(err, "No se pudieron cargar los clientes");
    }
  }

  // al elegir un método de pago; con crédito se abre su ventana
  function handleMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method === "CREDITO") {
      handleConfigureCredit();
    }
  }

  // el crédito queda confirmado con el total actual de la venta
  function handleConfirmCredit() {
    setConfirmedTotal(total);
    setShowCredit(false);
  }

  // registra un cliente nuevo y lo deja elegido en el crédito
  async function handleSaveClient(client: Client) {
    setSavingClient(true);

    try {
      const savedClient = await addClient(client);
      setClients([...clients, savedClient]);
      setCreditData({ ...creditData, clientId: savedClient.id });
      setShowClientForm(false);
    } catch (err: any) {
      showError(err, "No se pudo registrar el cliente");
    } finally {
      setSavingClient(false);
    }
  }

  // registra la venta en el backend
  async function handleCompleteSale() {
    // resumen que se muestra antes de cobrar
    let summary = `Total: <b>${formatCurrency(total)}</b><br>`;
    if (paymentMethod === "EFECTIVO") {
      summary += `Recibido: <b>${formatCurrency(Number(amountReceived))}</b><br>`;
      summary += `Vuelto: <b>${formatCurrency(Number(amountReceived) - total)}</b>`;
    } else if (paymentMethod === "SINPE") {
      summary += "Pago con SINPE";
    } else if (paymentMethod === "CREDITO") {
      const initial = creditData.initialPayment === "" ? 0 : Number(creditData.initialPayment);
      summary += `Cliente: <b>${creditClientName}</b><br>`;
      summary += `Abono inicial: <b>${formatCurrency(initial)}</b><br>`;
      summary += `Saldo pendiente: <b>${formatCurrency(total - initial)}</b><br>`;
      summary += `Abono mensual: <b>${formatCurrency(Number(creditData.monthlyInstallment))}</b><br>`;
      summary += `Fecha límite: <b>${creditData.dueDate.split("-").reverse().join("/")}</b>`;
    } else {
      summary += "Pago con tarjeta";
    }

    const confirmed = await showConfirm("¿Completar la venta?", summary, "Sí, cobrar");
    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const request: SaleRequest = {
        paymentMethod: paymentMethod,
        amountReceived: paymentMethod === "EFECTIVO" ? Number(amountReceived) : null,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      };

      if (paymentMethod === "CREDITO") {
        request.clientId = creditData.clientId;
        request.initialPayment = creditData.initialPayment === "" ? null : Number(creditData.initialPayment);
        request.monthlyInstallment = Number(creditData.monthlyInstallment);
        request.dueDate = creditData.dueDate;
      }

      const newInvoice = await createSale(request);
      setInvoice(newInvoice); // se muestra la factura en una ventana
      setCart([]);
      setAmountReceived("");
      setConfirmedTotal(null);
      setCreditData({ clientId: "", initialPayment: "", monthlyInstallment: "", dueDate: "" });
    } catch (err: any) {
      showError(err, "No se pudo registrar la venta");
    } finally {
      setSaving(false);
    }

    refreshProducts(); // si el stock cambió (o pudo haber cambiado), se actualiza el catálogo
  }


  async function handleSearchSubmit() {
    const code = searchText.trim();
    if (code === "") {
      return;
    }

    try {
      const product = await searchProductByCode(code);

      if (product.productAmount <= 0) {
        showWarning("Producto sin existencias", `"${product.name}" no tiene existencias disponibles`);
        return;
      }

      handleAdd(product);
      handleSearchChange(""); // se limpia el buscador para el siguiente producto
    } catch (err: any) {
      if (err.response?.status === 404) {
        // no hay un producto con ese código: el texto queda como búsqueda por nombre
        if (visibleProducts.length === 0) {
          showWarning("Sin resultados", `No se encontró ningún producto con "${code}"`);
        }
      } else {
        showError(err, "No se pudo buscar el producto");
      }
    }
  }

  return (
    <div className="p-4">
      <div className="row g-4">

        <div className="col-lg-8">
          <small className="text-success fw-semibold text-uppercase">Punto de venta</small>
          <h1 className="h3 mb-4">Nueva venta</h1>

          <div className="mb-3">
            <ProductSearchBar value={searchText} onChange={handleSearchChange} onSubmit={handleSearchSubmit} />
          </div>

          <div className="mb-4">
            <CategoryFilter categories={categories} selectedId={selectedCategoryId} onSelect={handleCategoryChange} />
          </div>

          {loading && (
            <div className="text-center text-muted py-5">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p className="mb-0">Cargando productos...</p>
            </div>
          )}

          {!loading && visibleProducts.length === 0 && <p className="text-muted">No hay productos disponibles.</p>}

          {!loading && visibleProducts.length > 0 && (
            <>
              <div className="row g-3">
                {pageProducts.map((product) => (
                  <div key={product.id} className="col-12 col-md-6 col-xxl-4">
                    <ProductCard product={product} onAdd={handleAdd} />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Detalle de venta</h2>
              <button type="button" className="btn btn-link btn-sm text-success text-decoration-none" onClick={handleClear}>
                Limpiar
              </button>
            </div>
            <small className="text-muted">{cart.length === 1 ? "1 producto" : `${cart.length} productos`}</small>

            <div className="mt-2 pe-2" style={{ maxHeight: "320px", overflowY: "auto" }}>
              {cart.length === 0 ? (
                <p className="text-muted py-4 text-center">Agrega productos para iniciar la venta.</p>
              ) : (
                cart.map((item) => <CartRow key={item.product.id} item={item} onQuantityChange={handleQuantityChange} />)
              )}
            </div>

            <div className="d-flex justify-content-between mt-3">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
              <span>Total</span>
              <strong className="fs-4">{formatCurrency(total)}</strong>
            </div>

            <div className="mt-3">
              <PaymentSummary
                total={total}
                paymentMethod={paymentMethod}
                onMethodChange={handleMethodChange}
                amountReceived={amountReceived}
                onAmountChange={setAmountReceived}
                creditData={creditReady ? creditData : null}
                creditClientName={creditClientName}
                onConfigureCredit={handleConfigureCredit}
              />
            </div>

            <div className="mt-3" title={payHint}>
              <Button variant="success" className="w-100 d-flex justify-content-between" disabled={!canPay || saving} onClick={handleCompleteSale}>
                <span>{saving ? "Registrando..." : "Completar venta"}</span>
                <span>{formatCurrency(total)}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {invoice !== null && <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />}

      {showCredit && (
        <CreditModal
          total={total}
          clients={clients}
          data={creditData}
          onChange={setCreditData}
          onNewClient={() => setShowClientForm(true)}
          onConfirm={handleConfirmCredit}
          onClose={() => setShowCredit(false)}
        />
      )}

      {showClientForm && <ClientFormModal saving={savingClient} onSave={handleSaveClient} onClose={() => setShowClientForm(false)} />}
    </div>
  );
}