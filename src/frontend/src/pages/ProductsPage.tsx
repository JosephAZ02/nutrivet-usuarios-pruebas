import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ProductsTable from "../components/organism/products/ProductsTable";
import type Product from "../interfaces/Product";
import type ProductCategory from "../interfaces/ProductCategory";
import { getActiveProductCategories, addProductCategory } from "../services/ProductCategoryService";
import { getAllProducts, addProduct, updateProduct, deleteProduct } from "../services/ProductService";
import type { ProductCreatePayload, ProductForm, ProductUpdatePayload } from "../interfaces/ProductPayload";
import ProductModal from "../components/organism/products/ProductModal";
import ProductCategoryModal from "../components/organism/products/ProductCategoryModal";
import { getCriticalStockProducts } from "../services/ProductService";
import { getAllInventoryMovements } from "../services/InventoryMovementService";
//import type InventoryMovement from "../interfaces/InventoryMovement";



function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
  // para crear nuevo producto
  const [productForm, setProductForm] = useState<ProductForm>({
    code: "", name: "", category: { id: 0 }, unitPrice: 0, productAmount: 0, productCost: 0, transportCost: 0, bulkSale: false
  });

  // imagen del producto
  const [productImage, setProductImage] = useState<File | null>(null);


  //mostrar los productos recien agregados primero y filtrar por busqueda y categoria
  const filteredProducts = [...products].sort((a, b) => b.id - a.id).filter(product => {
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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, selectedStockStatus]);

  //handlers para agregar, editar y eliminar productos
  async function handleAddProduct() {
    if (!productForm.code.trim() || !productForm.name.trim() || productForm.category.id === 0) {
      Swal.fire("Error", "Completa el código, nombre y categoría del producto.", "error");
      return;
    }
    if (productForm.unitPrice === "" || productForm.productAmount === "" || productForm.productCost === "" || productForm.transportCost === "") {
      Swal.fire("Error", "Completa todos los campos numéricos.", "error");
      return;
    }

    if (Number(productForm.unitPrice) <= 0 || Number(productForm.productCost) <= 0 || Number(productForm.transportCost) <= 0 || Number(productForm.productAmount) <= 0) {
      Swal.fire("Error", "El precio de venta, el costo del producto, el transporte y las existencias deben ser mayores que cero.", "error");
      return;
    }

    if (productImage && !["image/jpeg", "image/png"].includes(productImage.type)) {
      Swal.fire("Error", "La fotografía debe estar en formato JPG o PNG.", "error");
      return;
    }

    if (productImage && productImage.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "La fotografía no puede superar los 5 MB.", "error");
      return;
    }
    try {
      setSavingProduct(true);
      const productPayload: ProductCreatePayload = {
        ...productForm, unitPrice: Number(productForm.unitPrice), productAmount: Number(productForm.productAmount),
        productCost: Number(productForm.productCost), transportCost: Number(productForm.transportCost)
      };

      await addProduct(productPayload, productImage);
      Swal.fire({
        text: 'Producto agregado exitosamente.',
        icon: 'success',
      });

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
      Swal.fire("Error", "No se pudo registrar el producto. Verifica los datos e inténtalo nuevamente.", "error");
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

    if (!productForm.code.trim() || !productForm.name.trim() || productForm.category.id === 0) {
      Swal.fire("Error", "Completa el código, nombre y categoría del producto.", "error");
      return;
    }
    if (productForm.unitPrice === "" || productForm.productAmount === "" || productForm.productCost === "" || productForm.transportCost === "") {
      Swal.fire("Error", "Completa todos los campos numéricos.", "error");
      return;
    }

    if (Number(productForm.unitPrice) <= 0 || Number(productForm.productCost) <= 0 || Number(productForm.transportCost) <= 0) {
      Swal.fire("Error", "El precio de venta, el costo del producto y el transporte deben ser mayores que cero.", "error");
      return;
    }


    if (productImage && !["image/jpeg", "image/png"].includes(productImage.type)) {
      Swal.fire("Error", "La fotografía debe estar en formato JPG o PNG.", "error");
      return;
    }

    if (productImage && productImage.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "La fotografía no puede superar los 5 MB.", "error");
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
      Swal.fire({
        text: 'Producto actualizado exitosamente.',
        icon: 'success',
      });

      setEditingProduct(null);
      setProductImage(null);
      setShowProductModal(false);

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      Swal.fire("Error", "No se pudo actualizar el producto. Verifica los datos e inténtalo nuevamente.", "error");
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

    try {
      await deleteProduct(product.id);
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      await loadInventoryStats();
      Swal.fire({
        text: 'Producto desactivado exitosamente.',
        icon: 'success',
      });
    } catch (error) {
      console.error("Error al desactivar el producto:", error);
      Swal.fire("Error", "No se pudo desactivar el producto.", "error");
    }
  }


  async function handleAddCategory() {

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      Swal.fire("Error", "Debes ingresar el nombre de la categoría.", "error");
      return;
    }

    if (!/^[\p{L}\s'-]+$/u.test(trimmedName)) {
      Swal.fire("Error", "El nombre de la categoría solo puede contener letras y espacios.", "error");
      return;
    }

    try {
      setSavingCategory(true);

      await addProductCategory({
        name: categoryName.trim(),
        active: true

      });
      Swal.fire({
        text: 'Categoría creada exitosamente.',
        icon: 'success',
      });

      // actualizar las categorías disponibles
      const updatedCategories = await getActiveProductCategories();
      setCategories(updatedCategories);

      setCategoryName("");
      setShowCategoryModal(false);

    } catch (error) {
      console.error("Error al registrar la categoría:", error);
      Swal.fire("Error", "No se pudo registrar la categoría. Verifica que no exista previamente.", "error");
    } finally {
      setSavingCategory(false);
    }
  }

  //page
  return (
    <div className="products-page">
      <div className="container-fluid p-4">
        {/*cabecera*/}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Gestión de productos</h2>
            <p className="text-muted mb-0">Administra los productos y sus existencias.</p>
          </div>
        </div>
        {/* resumen */}
        <div className="row g-3 mt-3 mb-4 mx-1">

          {/* productos activos */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Productos activos</p>
                  <h3 className="fw-bold mb-0">{products.length}</h3>
                </div>
                <i className="bi bi-box-seam fs-2 text-success"></i>
              </div>
            </div>
          </div>

          {/* stock crítico */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Stock crítico</p>
                  <h3 className="fw-bold mb-0">{criticalStockCount}</h3>
                </div>
                <i className="bi bi-exclamation-triangle fs-2 text-warning"></i>
              </div>
            </div>
          </div>

          {/* movimientos de hoy */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Movimientos hoy</p>
                  <h3 className="fw-bold mb-0">{movementsTodayCount}</h3>
                </div>
                <i className="bi bi-arrow-left-right fs-2 text-primary"></i>
              </div>
            </div>
          </div>

        </div>
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
            <div className="d-flex gap-2 ms-auto">
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
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3"
                onClick={() => setShowCategoryModal(true)}
              >
                <i className="bi bi-tags me-2"></i>
                Agregar categoría
              </button>
            </div>
          </div>

          {/* tabla de productos*/}
          <div className="mt-4">
            {!loading && !error && (
              <ProductsTable
                filteredProducts={filteredProducts}
                currentProducts={currentProducts}
                productsPerPage={productsPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstProduct={indexOfFirstProduct}
                indexOfLastProduct={indexOfLastProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onPageChange={setCurrentPage}
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