import { useEffect, useState } from "react";
import type Product from "../interfaces/Product";
import type ProductCategory from "../interfaces/ProductCategory";
import type CartItem from "../interfaces/CartItem";
import { getAllProducts } from "../services/ProductService";
import { getActiveProductCategories } from "../services/ProductCategoryService";
import { showError } from "../utils/alerts";
import { formatCurrency } from "../utils/formatCurrency";
import ProductSearchBar from "../components/molecules/ProductSearchBar";
import CategoryFilter from "../components/molecules/CategoryFilter";
import ProductCard from "../components/molecules/ProductCard";
import CartRow from "../components/molecules/CartRow";

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // al abrir la pantalla se cargan los productos y las categorías
  useEffect(() => {
    async function loadData() {
      try {
        const productList = await getAllProducts();
        setProducts(productList.filter((p) => p.productAmount > 0)); // no se muestran los agotados
        setCategories(await getActiveProductCategories());
      } catch (err: any) {
        showError(err, "No se pudieron cargar los productos");
      }
    }
    loadData();
  }, []);

  // productos que se ven según la categoría elegida y el texto del buscador
  const text = searchText.trim().toLowerCase();
  const visibleProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === null || p.category.id === selectedCategoryId;
    const matchesText = text === "" || p.name.toLowerCase().includes(text) || p.code.toLowerCase().includes(text);
    return matchesCategory && matchesText;
  });

  // total de la venta: suma de precio por cantidad de cada línea
  let total = 0;
  for (const item of cart) {
    total = total + item.product.unitPrice * item.quantity;
  }

  // agrega el producto al detalle, o le suma una unidad si ya estaba
  function handleAdd(product: Product) {
    const existing = cart.find((item) => item.product.id === product.id);

    if (existing === undefined) {
      setCart([...cart, { product: product, quantity: 1 }]);
    } else if (existing.quantity < product.productAmount) {
      handleQuantityChange(product, existing.quantity + 1);
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
  }

  // pendiente: aquí se agregará por código de barras al presionar Enter
  function handleSearchSubmit() {}

  return (
    <div className="p-4">
      <div className="row g-4">

        <div className="col-lg-8">
          <small className="text-success fw-semibold text-uppercase">Punto de venta</small>
          <h1 className="h3 mb-4">Nueva venta</h1>

          <div className="mb-3">
            <ProductSearchBar value={searchText} onChange={setSearchText} onSubmit={handleSearchSubmit} />
          </div>

          <div className="mb-4">
            <CategoryFilter categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
          </div>

          {visibleProducts.length === 0 ? (
            <p className="text-muted">No hay productos disponibles.</p>
          ) : (
            <div className="row g-3">
              {visibleProducts.map((product) => (
                <div key={product.id} className="col-12 col-md-6 col-xxl-4">
                  <ProductCard product={product} onAdd={handleAdd} />
                </div>
              ))}
            </div>
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
          </div>
        </div>

      </div>
    </div>
  );
}