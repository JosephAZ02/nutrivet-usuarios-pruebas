import { useEffect, useState } from "react";
import type Product from "../interfaces/Product";
import type ProductCategory from "../interfaces/ProductCategory";
import type CartItem from "../interfaces/CartItem";
import type { InvoiceResponse, PaymentMethod, SaleRequest } from "../interfaces/Sale";
import { getAllProducts, searchProductByCode } from "../services/ProductService";
import { getActiveProductCategories } from "../services/ProductCategoryService";
import { createSale } from "../services/SaleService";
import { showError, showWarning } from "../utils/alerts";
import { formatCurrency } from "../utils/formatCurrency";
import Button from "../components/atoms/Button";
import ProductSearchBar from "../components/molecules/ProductSearchBar";
import CategoryFilter from "../components/molecules/CategoryFilter";
import ProductCard from "../components/molecules/ProductCard";
import Pagination from "../components/molecules/Pagination";
import CartRow from "../components/molecules/CartRow";
import PaymentSummary from "../components/molecules/PaymentSummary";
import InvoiceModal from "../components/organism/sales/InvoiceModal";

const PAGE_SIZE = 6; // productos por página

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // true mientras se cargan los productos
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [amountReceived, setAmountReceived] = useState("");
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null); // factura recién cobrada

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

  
  const cashIsEnough = amountReceived !== "" && Number(amountReceived) >= total;
  const canPay = cart.length > 0 && (paymentMethod === "TARJETA" || cashIsEnough);

  // mensajes que explican por qué el botón de cobrar está desactivado
  let payHint = "";
  if (cart.length === 0) {
    payHint = "Debes agregar productos al carrito";
  } else if (paymentMethod === "EFECTIVO" && amountReceived === "") {
    payHint = "Ingresa el monto recibido para poder cobrar";
  } else if (paymentMethod === "EFECTIVO" && !cashIsEnough) {
    payHint = "El monto recibido no alcanza para cubrir el total";
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

  // registra la venta en el backend
  async function handleCompleteSale() {
    setSaving(true);

    try {
      const request: SaleRequest = {
        paymentMethod: paymentMethod,
        amountReceived: paymentMethod === "EFECTIVO" ? Number(amountReceived) : null,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      };

      const newInvoice = await createSale(request);
      setInvoice(newInvoice); // se muestra la factura en una ventana
      setCart([]);
      setAmountReceived("");
    } catch (err: any) {
      showError(err, "No se pudo registrar la venta");
    } finally {
      setSaving(false);
    }

    refreshProducts(); // si el stock cambió (o pudo haber cambiado), se actualiza el catálogo
  }

  // al presionar Enter (o al escanear un código) se busca el producto por código y se agrega al detalle
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

            <div className="mt-2">
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
                onMethodChange={setPaymentMethod}
                amountReceived={amountReceived}
                onAmountChange={setAmountReceived}
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
    </div>
  );
}