import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/MainLayout";
import { categoryService } from "../api";
import {
  PackageIcon,
  RefreshIcon,
  SearchIcon,
  CloseIcon,
} from "../components/icons";

// Simple upload icon
function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

// Simple edit icon
function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

// Simple delete icon
function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default function ProductsAndCategories() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Subcategory Product viewer state
  const [subcategoryId, setSubcategoryId] = useState("23");
  const [warehouseId, setWarehouseId] = useState("1");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryArabicName, setCategoryArabicName] = useState("");
  const [categoryLevel, setCategoryLevel] = useState("ONE");
  const [categoryPosition, setCategoryPosition] = useState(1);
  const [categoryStatus, setCategoryStatus] = useState(true);
  const [isDiscounted, setIsDiscounted] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await categoryService.getCategories(2);
      setCategories(response.data?.data || response.data || []);
    } catch (err) {
      setError("Failed to fetch categories from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Products by Subcategory
  const fetchProducts = useCallback(async () => {
    if (!subcategoryId) return;
    setProductsLoading(true);
    setProductsError("");
    try {
      const response = await categoryService.getSubcategoryProducts(subcategoryId, warehouseId);
      setProducts(response.data?.data || response.data || []);
    } catch (err) {
      setProductsError("Failed to fetch products for the selected subcategory.");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [subcategoryId, warehouseId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  // Handle Search Categories (hits API if exact name, otherwise client side filter)
  const handleCategorySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCategories();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await categoryService.getCategoryByName(searchQuery.trim());
      const data = response.data?.data || response.data;
      if (data) {
        setCategories(Array.isArray(data) ? data : [data]);
      } else {
        setCategories([]);
      }
    } catch {
      // Fallback to client-side filtering if search endpoint fails or returns 404
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategories(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: categoryName,
        arabicName: categoryArabicName,
        level: categoryLevel,
        position: Number(categoryPosition),
        status: categoryStatus,
        isDiscountedCategory: isDiscounted,
      };
      await categoryService.createCategory(payload);
      setIsAddModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError("Failed to create category. Please check backend compatibility.");
    }
  };

  // Edit Category Handler
  const handleEditCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        id: selectedCategory.id,
        name: categoryName,
        arabicName: categoryArabicName,
        level: categoryLevel,
        position: Number(categoryPosition),
        status: categoryStatus,
        isDiscountedCategory: isDiscounted,
      };
      await categoryService.updateCategory(payload);
      setIsEditModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError("Failed to update category.");
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete category.");
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    setError("");
    try {
      await categoryService.uploadCategoryImage(id, file);
      fetchCategories();
    } catch (err) {
      setError("Failed to upload category image.");
    } finally {
      setUploadingId(null);
    }
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setCategoryName(cat.name);
    setCategoryArabicName(cat.arabicName);
    setCategoryLevel(cat.level || "ONE");
    setCategoryPosition(cat.position || 1);
    setCategoryStatus(cat.status ?? true);
    setIsDiscounted(cat.isDiscountedCategory ?? false);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryArabicName("");
    setCategoryLevel("ONE");
    setCategoryPosition(1);
    setCategoryStatus(true);
    setIsDiscounted(false);
    setSelectedCategory(null);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        {/* Main Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory & Categories
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage product categories, upload brand assets, and audit subcategories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={activeTab === "categories" ? fetchCategories : fetchProducts}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh List"
            >
              <RefreshIcon className={loading || productsLoading ? "animate-spin" : ""} />
            </button>

            {activeTab === "categories" && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                + Add Category
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Product Categories
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Subcategory Products
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* TAB 1: Categories Panel */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleCategorySearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Category Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold text-xs shadow-md border border-slate-800"
              >
                Search
              </button>
            </form>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-500">
                <RefreshIcon className="animate-spin text-amber-500 w-6 h-6 mr-2" />
                Loading Categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Categories Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try creating a category or resetting the search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview / Upload Click area */}
                      <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <UploadIcon className="w-8 h-8 stroke-1 mb-1 text-slate-400" />
                            <span className="text-[10px]">No Image Uploaded</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                          <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                          <span className="text-[10px] font-bold">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(cat.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {uploadingId === cat.id && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-xs font-semibold">
                            <RefreshIcon className="animate-spin text-amber-500 w-5 h-5 mr-1" />
                            Uploading...
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {cat.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                            ID: {cat.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium font-sans text-right" dir="rtl">
                          {cat.arabicName || "—"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-semibold">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            cat.status
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                          }`}>
                            {cat.status ? "Active" : "Inactive"}
                          </span>
                          {cat.isDiscountedCategory && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Discounted Category
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                            Position: {cat.position}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Subcategory Products Viewer */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Control Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span>Subcategory ID:</span>
                <input
                  type="number"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span>Warehouse ID:</span>
                <input
                  type="number"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                onClick={fetchProducts}
                className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold border border-slate-800"
              >
                Fetch Products
              </button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center items-center py-20 text-slate-500">
                <RefreshIcon className="animate-spin text-amber-500 w-6 h-6 mr-2" />
                Loading Products...
              </div>
            ) : productsError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {productsError}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Products Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another Subcategory ID or Warehouse ID.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <motion.div
                    key={prod.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                            <PackageIcon className="w-8 h-8 stroke-1 mb-1 text-slate-400" />
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {prod.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                          <div>
                            <span className="text-slate-400">Rate:</span>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {prod.rate} SAR
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Current Rate:</span>
                            <p className="font-bold text-emerald-500">
                              {prod.currentRate} SAR
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Weight:</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              {prod.weight || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Brand:</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              {prod.brandName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-semibold">
                      <span className={`px-2 py-0.5 rounded-full border ${
                        prod.inStock
                          ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                      }`}>
                        {prod.inStock ? `In Stock (${prod.inStockQuantity})` : "Out of Stock"}
                      </span>
                      {prod.tax && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                          {prod.tax.taxName} ({prod.tax.taxPercentage})
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: Add Category */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Category</h2>
                  <button onClick={() => setIsAddModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Name</label>
                    <input
                      type="text"
                      required
                      value={categoryArabicName}
                      onChange={(e) => setCategoryArabicName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-right focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Level</label>
                      <select
                        value={categoryLevel}
                        onChange={(e) => setCategoryLevel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ONE">ONE</option>
                        <option value="TWO">TWO</option>
                        <option value="THREE">THREE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Position</label>
                      <input
                        type="number"
                        required
                        value={categoryPosition}
                        onChange={(e) => setCategoryPosition(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryStatus}
                        onChange={(e) => setCategoryStatus(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active Status</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDiscounted}
                        onChange={(e) => setIsDiscounted(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Discounted Category</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Edit Category */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Category Details</h2>
                  <button onClick={() => setIsEditModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleEditCategory} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Name</label>
                    <input
                      type="text"
                      required
                      value={categoryArabicName}
                      onChange={(e) => setCategoryArabicName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-right focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Level</label>
                      <select
                        value={categoryLevel}
                        onChange={(e) => setCategoryLevel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ONE">ONE</option>
                        <option value="TWO">TWO</option>
                        <option value="THREE">THREE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Position</label>
                      <input
                        type="number"
                        required
                        value={categoryPosition}
                        onChange={(e) => setCategoryPosition(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryStatus}
                        onChange={(e) => setCategoryStatus(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active Status</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDiscounted}
                        onChange={(e) => setIsDiscounted(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Discounted Category</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  );
}
