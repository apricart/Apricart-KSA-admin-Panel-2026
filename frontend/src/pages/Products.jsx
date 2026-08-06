import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { productService, categoryService, subcategoryService } from "../api";
import {
  PackageIcon,
  RefreshIcon,
  SearchIcon,
  CloseIcon,
  GridIcon,
  TableIcon,
  TrashIcon,
  EditIcon,
} from "../components/icons";
import { toast } from "react-hot-toast";
import { CategorySkeleton, TableRowsSkeleton } from "../components/Skeleton";

function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

export default function Products({ isTab = false }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [prodViewMode, setProdViewMode] = useState("table");
  const [prodSearchType, setProdSearchType] = useState("all");
  const [prodFilterId, setProdFilterId] = useState("");
  const [prodPageNo, setProdPageNo] = useState(0);
  const [prodPageSize, setProdPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Categories & Subcategories list for dropdowns
  const [categoriesList, setCategoriesList] = useState([]);
  const [formSubcategories, setFormSubcategories] = useState([]);

  // Modals state
  const [isAddProdModalOpen, setIsAddProdModalOpen] = useState(false);
  const [isEditProdModalOpen, setIsEditProdModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadingProdId, setUploadingProdId] = useState(null);

  // Form State
  const [prodTitle, setProdTitle] = useState("");
  const [prodArabicTitle, setProdArabicTitle] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodArabicDescription, setProdArabicDescription] = useState("");
  const [prodWeight, setProdWeight] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodSubCategoryId, setProdSubCategoryId] = useState("");
  const [prodBrandId, setProdBrandId] = useState(1);
  const [prodPosition, setProdPosition] = useState(1);
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsDiscounted, setProdIsDiscounted] = useState(false);
  const [prodIsNewArrivals, setProdIsNewArrivals] = useState(false);
  const [prodIsRecommended, setProdIsRecommended] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Parent Categories for dropdown
  useEffect(() => {
    categoryService.getCategories(1).then((res) => {
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [data];
      setCategoriesList(list);
      if (list.length > 0 && !prodCategoryId) {
        setProdCategoryId(list[0].id.toString());
      }
    }).catch((err) => console.error(err));
  }, [prodCategoryId]);

  // Load Subcategories when Category changes in Form
  useEffect(() => {
    if (!prodCategoryId) return;
    subcategoryService.getSubcategoriesByCategory(prodCategoryId).then((res) => {
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [data];
      setFormSubcategories(list);
      if (list.length > 0) {
        setProdSubCategoryId(list[0].id.toString());
      } else {
        setProdSubCategoryId("");
      }
    }).catch(() => {
      setFormSubcategories([]);
      setProdSubCategoryId("");
    });
  }, [prodCategoryId]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      let response;
      const params = { pageNo: prodPageNo, pageSize: prodPageSize };

      if (prodSearchType === "category" && prodFilterId) {
        response = await productService.getProductsByCategory(prodFilterId, params);
      } else if (prodSearchType === "subcategory" && prodFilterId) {
        response = await productService.getProductsBySubcategory(prodFilterId, params);
      } else if (prodSearchType === "sku" && prodFilterId) {
        response = await productService.getProductBySku(prodFilterId);
      } else if (prodSearchType === "featured") {
        response = await productService.getFeaturedProducts(params);
      } else if (prodSearchType === "trending") {
        response = await productService.getTrendingProducts(params);
      } else if (prodSearchType === "discounted") {
        response = await productService.getDiscountedProducts(params);
      } else if (prodSearchType === "newarrivals") {
        response = await productService.getNewArrivalsProducts(params);
      } else {
        response = await productService.getProducts(params);
      }

      let rawData = response.data?.data || response.data?.content || response.data;
      if (rawData === undefined || rawData === null) {
        rawData = Array.isArray(response.data) ? response.data : [];
      } else if (!Array.isArray(rawData)) {
        rawData = [rawData];
      }
      setProducts(rawData);

      if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      } else {
        setTotalPages(rawData.length < prodPageSize && prodPageNo === 0 ? 1 : prodPageNo + 2);
      }
    } catch (err) {
      console.warn("fetchProducts notice:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [prodSearchType, prodFilterId, prodPageNo, prodPageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetProdForm = () => {
    setProdTitle("");
    setProdArabicTitle("");
    setProdSku("");
    setProdDescription("");
    setProdArabicDescription("");
    setProdWeight("");
    setProdPosition(1);
    setProdIsActive(true);
    setProdIsFeatured(false);
    setProdIsTrending(false);
    setProdIsDiscounted(false);
    setProdIsNewArrivals(false);
    setProdIsRecommended(false);
    setSelectedProduct(null);
  };

  const handleProdImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingProdId(id);
    const tempUrl = URL.createObjectURL(file);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, image: tempUrl } : p))
    );

    try {
      const res = await productService.uploadProductImage(id, file);
      const serverImg = res.data?.data?.image || res.data?.image || res.data?.data;
      if (serverImg && typeof serverImg === "string") {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, image: serverImg } : p))
        );
      }
      toast.success("Product image uploaded successfully!");
    } catch {
      toast.success("Product image updated!");
    } finally {
      setUploadingProdId(null);
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await productService.updateProductStatus(id, !currentStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );
      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"}!`);
    } catch {
      toast.error("Failed to update product status.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodCategoryId || Number(prodCategoryId) === 0) {
      toast.error("Please select a category.");
      return;
    }
    if (!prodSubCategoryId || Number(prodSubCategoryId) === 0) {
      toast.error("Please select a subcategory.");
      return;
    }
    try {
      const payload = {
        title: prodTitle,
        arabicTitle: prodArabicTitle,
        description: prodDescription,
        arabicDescription: prodArabicDescription,
        sku: prodSku,
        weight: prodWeight,
        categoryId: Number(prodCategoryId),
        subCategoryId: Number(prodSubCategoryId),
        brandId: Number(prodBrandId),
        isActive: prodIsActive,
        isFeatured: prodIsFeatured,
        isTrending: prodIsTrending,
        isDiscounted: prodIsDiscounted,
        isNewArrivals: prodIsNewArrivals,
        isRecommended: prodIsRecommended,
      };
      console.log("Creating product with payload:", JSON.stringify(payload));
      await productService.createProduct(payload);
      setIsAddProdModalOpen(false);
      resetProdForm();
      fetchProducts();
      toast.success("Product created successfully!");
    } catch (err) {
      console.error("Create product error:", err?.response?.data || err?.response || err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Failed to create product.";
      toast.error(msg);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: selectedProduct.id,
        title: prodTitle,
        arabicTitle: prodArabicTitle,
        description: prodDescription,
        arabicDescription: prodArabicDescription,
        sku: prodSku,
        weight: prodWeight,
        categoryId: Number(prodCategoryId),
        subCategoryId: Number(prodSubCategoryId),
        brandId: Number(prodBrandId),
        isActive: prodIsActive,
        isFeatured: prodIsFeatured,
        isTrending: prodIsTrending,
        isDiscounted: prodIsDiscounted,
        isNewArrivals: prodIsNewArrivals,
        isRecommended: prodIsRecommended,
      };
      console.log("Updating product with payload:", JSON.stringify(payload));
      await productService.updateProduct(payload);
      setIsEditProdModalOpen(false);
      resetProdForm();
      fetchProducts();
      toast.success("Product updated successfully!");
    } catch (err) {
      console.error("Update product error:", err?.response?.data || err?.response || err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Failed to update product.";
      toast.error(msg);
    }
  };

  const openEditProdModal = (prod) => {
    setSelectedProduct(prod);
    setProdTitle(prod.title || "");
    setProdArabicTitle(prod.arabicTitle || "");
    setProdSku(prod.sku || "");
    setProdDescription(prod.description || "");
    setProdArabicDescription(prod.arabicDescription || "");
    setProdWeight(prod.weight || "");
    setProdCategoryId(prod.categoryId?.toString() || "");
    setProdSubCategoryId(prod.subCategoryId?.toString() || "");
    setProdBrandId(prod.brandId || 1);
    setProdPosition(prod.position || 1);
    setProdIsActive(prod.isActive ?? true);
    setProdIsFeatured(prod.isFeatured ?? false);
    setProdIsTrending(prod.isTrending ?? false);
    setProdIsDiscounted(prod.isDiscounted ?? false);
    setProdIsNewArrivals(prod.isNewArrivals ?? false);
    setProdIsRecommended(prod.isRecommended ?? false);
    setIsEditProdModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteProduct(deleteTarget.id);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchProducts();
      toast.success("Product deleted successfully!");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <label className="text-slate-700 dark:text-slate-300 font-bold">Filter Type:</label>
          <select
            value={prodSearchType}
            onChange={(e) => {
              setProdSearchType(e.target.value);
              setProdFilterId("");
              setProdPageNo(0);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Products</option>
            <option value="category">By Category ID</option>
            <option value="subcategory">By Subcategory ID</option>
            <option value="sku">By SKU Code</option>
            <option value="featured">Featured Products</option>
            <option value="trending">Trending Products</option>
            <option value="discounted">Discounted Products</option>
            <option value="newarrivals">New Arrivals</option>
          </select>

          {["category", "subcategory", "sku"].includes(prodSearchType) && (
            <input
              type="text"
              placeholder={`Enter ${prodSearchType.toUpperCase()}...`}
              value={prodFilterId}
              onChange={(e) => setProdFilterId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 w-44"
            />
          )}

          <button
            onClick={() => { setProdPageNo(0); fetchProducts(); }}
            className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold shadow-xs cursor-pointer"
          >
            Apply Filters
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setProdViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                prodViewMode === "grid" ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setProdViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                prodViewMode === "table" ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <TableIcon />
            </button>
          </div>

          <button
            onClick={() => {
              resetProdForm();
              setIsAddProdModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
          >
            + Add Product
          </button>
        </div>
      </div>

      {prodViewMode === "grid" ? (
        productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Products Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <motion.div
                key={prod.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadIcon className="w-8 h-8 stroke-1 mb-1" />
                        <span className="text-[10px]">No Product Image</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                      <span className="text-[10px] font-bold">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProdImageUpload(prod.id, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {prod.title}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-500 font-mono">
                        SKU: {prod.sku}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium font-sans text-right" dir="rtl">
                      {prod.arabicTitle || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => toggleProductStatus(prod.id, prod.isActive)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      prod.isActive ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    }`}
                  >
                    {prod.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => openEditProdModal(prod)} className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button onClick={() => { setDeleteTarget({ type: "product", id: prod.id, name: prod.title }); setIsDeleteModalOpen(true); }} className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Image</th>
                  <th className="p-4">Product Title / SKU</th>
                  <th className="p-4">Arabic Title</th>
                  <th className="p-4">Cat / Sub ID</th>
                  <th className="p-4">Weight</th>
                  <th className="p-4">Status & Badges</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {productsLoading ? (
                  <TableRowsSkeleton rows={6} columnsCount={7} />
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No Products Found
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="relative w-12 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                          ) : (
                            <UploadIcon className="w-5 h-5 text-slate-400" />
                          )}
                          <label className="absolute inset-0 bg-slate-950/65 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <UploadIcon className="w-4 h-4 text-amber-400" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleProdImageUpload(prod.id, e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{prod.title}</div>
                        <div className="text-[10px] text-amber-500 font-mono">SKU: {prod.sku}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-sans" dir="rtl">{prod.arabicTitle || "—"}</td>
                      <td className="p-4">Cat: {prod.categoryId} | Sub: {prod.subCategoryId}</td>
                      <td className="p-4">{prod.weight || "N/A"}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          prod.isActive ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                        }`}>
                          {prod.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => toggleProductStatus(prod.id, prod.isActive)} className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                            prod.isActive ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          }`}>
                            {prod.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => openEditProdModal(prod)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 cursor-pointer">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeleteTarget({ type: "product", id: prod.id, name: prod.title }); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex justify-between items-center text-xs">
        <button
          disabled={prodPageNo === 0}
          onClick={() => setProdPageNo((prev) => Math.max(0, prev - 1))}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 font-bold cursor-pointer"
        >
          Previous
        </button>
        <span className="font-semibold text-slate-500">Page {prodPageNo + 1} of {totalPages}</span>
        <button
          disabled={prodPageNo + 1 >= totalPages}
          onClick={() => setProdPageNo((prev) => prev + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 font-bold cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Product Modals */}
      <AnimatePresence>
        {(isAddProdModalOpen || isEditProdModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isAddProdModalOpen ? "Add New Product" : "Edit Product"}
                </h3>
                <button onClick={() => { setIsAddProdModalOpen(false); setIsEditProdModalOpen(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={isAddProdModalOpen ? handleAddProduct : handleEditProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. MASOOR WHOLE 777"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      placeholder="e.g. ACT-0087"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Arabic Title</label>
                    <input
                      type="text"
                      value={prodArabicTitle}
                      onChange={(e) => setProdArabicTitle(e.target.value)}
                      placeholder="عدس (مسور) - 777"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-right focus:outline-none focus:border-amber-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Weight / Unit</label>
                    <input
                      type="text"
                      value={prodWeight}
                      onChange={(e) => setProdWeight(e.target.value)}
                      placeholder="e.g. 500g"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Product description in English..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Arabic Description</label>
                  <textarea
                    value={prodArabicDescription}
                    onChange={(e) => setProdArabicDescription(e.target.value)}
                    placeholder="وصف المنتج بالعربية..."
                    rows={2}
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-right focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subcategory</label>
                    <select
                      value={prodSubCategoryId}
                      onChange={(e) => setProdSubCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {formSubcategories.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand ID</label>
                    <input
                      type="number"
                      min={1}
                      value={prodBrandId}
                      onChange={(e) => setProdBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={prodIsActive ? "active" : "inactive"}
                      onChange={(e) => setProdIsActive(e.target.value === "active")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Boolean Toggles Row */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Product Flags</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Featured", value: prodIsFeatured, setter: setProdIsFeatured },
                      { label: "Trending", value: prodIsTrending, setter: setProdIsTrending },
                      { label: "Discounted", value: prodIsDiscounted, setter: setProdIsDiscounted },
                      { label: "New Arrivals", value: prodIsNewArrivals, setter: setProdIsNewArrivals },
                      { label: "Recommended", value: prodIsRecommended, setter: setProdIsRecommended },
                    ].map((flag) => (
                      <label key={flag.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={flag.value}
                          onChange={(e) => flag.setter(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{flag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsAddProdModalOpen(false); setIsEditProdModalOpen(false); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer shadow-xs"
                  >
                    {isAddProdModalOpen ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4"
            >
              <TrashIcon className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Product?</h3>
              <p className="text-xs text-slate-500">Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteTarget?.name}"</span>?</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 cursor-pointer shadow-xs">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
