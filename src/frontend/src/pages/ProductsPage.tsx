import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ProductsTable from "../components/organism/products/ProductsTable";
import type Product from "../interfaces/Product";
import type ProductCategory from "../interfaces/ProductCategory";
import { getActiveProductCategories, addProductCategory } from "../services/ProductCategoryService";
import { getAllProducts, addProduct, updateProduct, deleteProduct, getInactiveProducts, reactivateProduct } from "../services/ProductService";
import type { ProductCreatePayload, ProductForm, ProductUpdatePayload } from "../interfaces/ProductPayload";
import ProductModal from "../components/organism/products/ProductModal";
import ProductCategoryModal from "../components/organism/products/ProductCategoryModal";
import { getCriticalStockProducts } from "../services/ProductService";
import { getAllInventoryMovements } from "../services/InventoryMovementService";
import ProductsStats from "../components/organism/products/ProductsStats";
import { showError, showSuccess } from "../utils/alerts";
import { useAuth } from "../context/AuthContext";



function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inactiveProducts, setInactiveProducts] = useState<Product[]>([]);
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);
  const [criticalStockCount, setCriticalStockCount] = useState(0);
  const [movementsTodayCount, setMovementsTodayCount] = useState(0);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [showProductModal, setShowProductModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);


  const { hasPermission } = useAuth();


  // para crear nuevo producto
  const [productForm, setProductForm] = useState<ProductForm>({
    code: "", name: "", category: { id: 0 }, unitPrice: 0, productAmount: 0, productCost: 0, transportCost: 0, bulkSale: false
  });

  // imagen del producto
  const [productImage, setProductImage] = useState<File | null>(null);


  //mostrar los productos recien agregados primero y filtrar por busqueda y categoria
  const productsToShow = showInactiveProducts ? inactiveProducts : products;
  const filteredProducts = [...productsToShow].sort((a, b) => b.id - a.id).filter(product => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch = product.name.toLowerCase().includes(search) || product.code.toLowerCase().includes(search);

    const matchesCategory = selectedCategory === "all" || product.category.id === Number(selectedCategory);

    const matchesStock =
      selectedStockStatus === "all" ||
      (selectedStockStatus === "Crítico" && product.productAmount <= 5) ||
      (selectedStockStatus === "Bajo" && product.productAmount > 5 && product.productAmount < 20) ||
      (selectedStockStatus === "Bueno" && product.productAmount >= 20);

    return matchesSearch && matchesCategory && matchesStock;
  });

  //paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // cargar estadísticas del inventario
  async function loadInventoryStats() {
    try {
      const criticalProducts = await getCriticalStockProducts();
      setCriticalStockCount(criticalProducts.length);
    } catch (error) {
      console.error("Error al cargar el stock crítico:", error);
    }

    try {
      const movements = await getAllInventoryMovements();

      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const todayMovements = movements.filter(
        (movement) => movement.movementDate.slice(0, 10) === todayString
      );

      setMovementsTodayCount(todayMovements.length);
    } catch (error) {
      console.error("Error al cargar los movimientos:", error);
    }
  }


  async function loadInactiveProducts() {
    try {
      const data = await getInactiveProducts();
      setInactiveProducts(data);
    } catch (error) {
      console.error("Error al cargar productos desactivados:", error);
      Swal.fire("Error", "No se pudieron cargar los productos desactivados.", "error");
    }
  }

  useEffect(() => { loadInventoryStats(); }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const productsData = await getAllProducts();
        const categoriesData = await getActiveProductCategories();

        setProducts(productsData);
        setCategories(categoriesData);

      } catch (error) {
        console.error("Error al cargar los productos:", error);
        setError("No se pudieron cargar los datos de los productos.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, selectedStockStatus, showInactiveProducts]);

  //handlers para agregar, editar y eliminar productos
  async function handleAddProduct() {
    if (!productForm.code.trim() || !productForm.name.trim() || productForm.category.id === 0) {
      showError(error, "Completa el código, nombre y categoría del producto.");
      return;
    }
    if (productForm.unitPrice === "" || productForm.productAmount === "" || productForm.productCost === "" || productForm.transportCost === "") {
      showError(error, "Completa todos los campos numéricos.");
      return;
    }

    if (Number(productForm.unitPrice) <= 0 || Number(productForm.productCost) <= 0 || Number(productForm.transportCost) <= 0 || Number(productForm.productAmount) <= 0) {
      showError(error, "El precio de venta, el costo del producto, el transporte y las existencias deben ser mayores que cero.");
      return;
    }

    if (productImage && !["image/jpeg", "image/png", "image/webp"].includes(productImage.type)) {
      showError(error, "La fotografía debe estar en formato JPG, PNG o WEBP.");
      return;
    }

    if (productImage && productImage.size > 5 * 1024 * 1024) {
      showError(error, "La fotografía no puede superar los 5 MB.");
      return;
    }
    try {
      setSavingProduct(true);
      const productPayload: ProductCreatePayload = {
        ...productForm, unitPrice: Number(productForm.unitPrice), productAmount: Number(productForm.productAmount),
        productCost: Number(productForm.productCost), transportCost: Number(productForm.transportCost)
      };

      await addProduct(productPayload, productImage);
      showSuccess("Producto registrado", "El producto se registró correctamente.");

      // actualizar lista de productos
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      await loadInventoryStats();

      // limpiar formulario
      setProductForm({ code: "", name: "", category: { id: 0 }, unitPrice: 0, productAmount: 0, productCost: 0, transportCost: 0, bulkSale: false });
      setProductImage(null);

      setShowProductModal(false);
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      showError(error, "No se pudo registrar el producto. Verifica los datos e inténtalo nuevamente.");
    } finally {
      setSavingProduct(false);
    }
  }


  function resetProductForm() {
    setProductForm({ code: "", name: "", category: { id: 0 }, unitPrice: 0, productAmount: 0, productCost: 0, transportCost: 0, bulkSale: false });
    setProductImage(null);
    setEditingProduct(null);
  }

  function handleEditProduct(product: Product) {
    setEditingProduct(product);

    setProductForm({
      code: product.code, name: product.name, category: { id: product.category.id }, unitPrice: product.unitPrice, productAmount: product.productAmount, productCost: product.productCost, transportCost: product.transportCost,
      bulkSale: product.bulkSale
    });

    setProductImage(null);
    setShowProductModal(true);
  }

  async function handleUpdateProduct() {
    if (!editingProduct) return;

    if (hasPermission("PRODUCT_UPDATE") === false) {
      showError(error, "No tienes permiso para actualizar productos.");
      return;
    }

    if (!productForm.code.trim() || !productForm.name.trim() || productForm.category.id === 0) {
      showError(error, "Completa el código, nombre y categoría del producto.");
      return;
    }
    if (productForm.unitPrice === "" || productForm.productAmount === "" || productForm.productCost === "" || productForm.transportCost === "") {
      showError(error, "Completa todos los campos numéricos.");
      return;
    }

    if (Number(productForm.unitPrice) <= 0 || Number(productForm.productCost) <= 0 || Number(productForm.transportCost) <= 0) {
      showError(error, "El precio de venta, el costo del producto y el transporte deben ser mayores que cero.");
      return;
    }



    if (productImage && !["image/jpeg", "image/png", "image/webp"].includes(productImage.type)) {
      showError(error, "La fotografía debe estar en formato JPG, PNG o WEBP.");
      return;
    }

    if (productImage && productImage.size > 5 * 1024 * 1024) {
      showError(error, "La fotografía no puede superar los 5 MB.");
      return;
    }

    const updatePayload: ProductUpdatePayload = {
      code: productForm.code, name: productForm.name, category: productForm.category, unitPrice: Number(productForm.unitPrice),
      productCost: Number(productForm.productCost), transportCost: Number(productForm.transportCost), bulkSale: productForm.bulkSale
    };

    try {
      setSavingProduct(true);

      await updateProduct(editingProduct.id, updatePayload, productImage);

      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      await loadInventoryStats();
      showSuccess("Producto actualizado", "El producto se actualizó correctamente.");
      setEditingProduct(null);
      setProductImage(null);
      setShowProductModal(false);

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      showError(error, "No se pudo actualizar el producto. Verifica los datos e inténtalo nuevamente.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas desactivar el producto "${product.name}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    }).then((result) => result.isConfirmed);

    if (!confirmed) return;

    if (hasPermission("PRODUCT_DELETE") === false) {
      showError(error, "No tienes permiso para desactivar productos.");
      return;
    }

    try {
      await deleteProduct(product.id);
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      await loadInventoryStats();
      showSuccess("Producto desactivado", "El producto se desactivó correctamente.");
    } catch (error) {
      console.error("Error al desactivar el producto:", error);
      showError(error, "No se pudo desactivar el producto.");
    }
  }


  async function handleAddCategory() {

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      showError(error, "Debes ingresar el nombre de la categoría.");
      return;
    }

    if (!/^[\p{L}\s'-]+$/u.test(trimmedName)) {
      showError(error, "El nombre de la categoría solo puede contener letras y espacios.");
      return;
    }

    try {
      setSavingCategory(true);

      await addProductCategory({
        name: categoryName.trim(),
        active: true

      });
      showSuccess("Categoría creada", "La categoría se creó correctamente.");

      // actualizar las categorías disponibles
      const updatedCategories = await getActiveProductCategories();
      setCategories(updatedCategories);

      setCategoryName("");
      setShowCategoryModal(false);

    } catch (error) {
      console.error("Error al registrar la categoría:", error);
      showError(error, "No se pudo registrar la categoría. Verifica que no exista previamente.");
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleReactivateProduct(product: Product) {
    const confirmed = await Swal.fire({
      title: "¿Reactivar producto?",
      text: `¿Deseas volver a activar "${product.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar"
    }).then(result => result.isConfirmed);

    if (!confirmed) return;

    try {
      await reactivateProduct(product.id);

      const updatedProducts = await getAllProducts();
      const updatedInactiveProducts = await getInactiveProducts();

      setProducts(updatedProducts);
      setInactiveProducts(updatedInactiveProducts);

      await loadInventoryStats();

      showSuccess("Producto reactivado", "El producto fue reactivado correctamente.");
    } catch (error) {
      console.error("Error al reactivar el producto:", error);
      showError(error, "No se pudo reactivar el producto.");
    }
  }

  //page
  return (
    <div className="products-page">
      <div className="container-fluid p-4">
        {/*cabecera*/}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <small className="text-success fw-semibold text-uppercase">Catálogo</small>
            <h1 className="h3 mb-1">Gestión de productos</h1>
            <p className="text-muted mb-0">Administra los productos y sus existencias.</p>
          </div>
        </div>
        {/* resumen */}
        <ProductsStats
          totalProducts={products.length}
          criticalStockCount={criticalStockCount}
          movementsTodayCount={movementsTodayCount}
        />
        {/* buscador y filtro */}
        <div className="card border-0 shadow-sm rounded-4 mt-5 mx-2 overflow-hidden">
          <div className="d-flex flex-wrap align-items-center gap-3 p-3 border-bottom">
            {/* buscador */}
            <div className="flex-grow-1" style={{ maxWidth: "350px" }}>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* filtro */}
            <div style={{ minWidth: "220px" }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: "220px" }}>
              <select
                className="form-select"
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="Bueno">Bueno</option>
                <option value="Bajo">Bajo</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="showInactiveProducts"
                checked={showInactiveProducts}
                onChange={async (e) => {
                  const checked = e.target.checked;

                  setShowInactiveProducts(checked);
                  setCurrentPage(1);

                  if (checked) {
                    await loadInactiveProducts();
                  }
                }}
              />
              <label className="form-check-label" htmlFor="showInactiveProducts">
                Mostrar únicamente productos desactivados
              </label>
            </div>
            <div className="d-flex gap-2 ms-auto">

              {hasPermission("PRODUCT_CREATE") && (
                <button
                  type="button"
                  className="btn btn-success px-4 py-2 fw-semibold rounded-3 shadow-sm"
                  onClick={() => {
                    resetProductForm();
                    setShowProductModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Agregar producto
                </button>)}

              {hasPermission("PRODUCT_CATEGORY_CREATE") && (
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <i className="bi bi-tags me-2"></i>
                  Agregar categoría
                </button>
              )}
            </div>
          </div>
          <div className="px-3 pt-3">
          </div>

          {/* tabla de productos*/}
          <div className="mt-4">
            {!loading && !error && (
              <ProductsTable
                filteredProducts={filteredProducts}
                currentProducts={currentProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstProduct={indexOfFirstProduct}
                indexOfLastProduct={indexOfLastProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onPageChange={setCurrentPage}
                showInactiveProducts={showInactiveProducts}
                onReactivate={handleReactivateProduct}
              />
            )}
          </div>
        </div>

        {/* mensajes de carga y errores */}
        {loading && <p>Cargando información...</p>}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
      </div>
      {/*modal para agregar y editar*/}
      {showProductModal && (
        <ProductModal
          editingProduct={editingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          setProductImage={setProductImage}
          categories={categories}
          savingProduct={savingProduct}
          onClose={() => setShowProductModal(false)}
          onCancel={() => {
            setShowProductModal(false);
            resetProductForm();
          }}
          onSave={() => {
            if (editingProduct) {
              handleUpdateProduct();
            } else {
              handleAddProduct();
            }
          }}
        />
      )}
      {/* modal para agregar categoría */}
      {showCategoryModal && (
        <ProductCategoryModal
          categoryName={categoryName}
          setCategoryName={setCategoryName}
          savingCategory={savingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSave={handleAddCategory}
        />
      )}
    </div>
  );
}
export default ProductsPage;