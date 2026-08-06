import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/MainLayout";
import { categoryService, subcategoryService, productService } from "../api";
import {
  PackageIcon,
  RefreshIcon,
  SearchIcon,
  CloseIcon,
  GridIcon,
  TableIcon,
} from "../components/icons";
import Toast from "../components/Toast";
import { toast } from "react-hot-toast";

// Icons
function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// Skeleton loading components
function CategorySkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm animate-pulse flex flex-col justify-between h-[340px]">
      <div>
        <div className="w-full h-36 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 ml-auto mb-4" />
        <div className="flex gap-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-14" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-12" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-10" />
      </div>
    </div>
  );
}

function SubcategorySkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm animate-pulse flex flex-col justify-between h-[340px]">
      <div>
        <div className="w-full h-36 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 ml-auto mb-4" />
        <div className="flex gap-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-12" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-10" />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm animate-pulse flex flex-col justify-between h-[450px]">
      <div>
        <div className="w-full h-36 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
        <div className="flex justify-between items-center mb-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
        </div>
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 ml-auto mb-3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full mb-1" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 mb-4" />
        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-10" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-14" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-10" />
      </div>
    </div>
  );
}

export default function ProductsAndCategories() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");

  // View Modes ('grid' | 'table')
  const [catViewMode, setCatViewMode] = useState("table");
  const [subViewMode, setSubViewMode] = useState("table");
  const [prodViewMode, setProdViewMode] = useState("table");

  // Categories Tab states
  const [searchQuery, setSearchQuery] = useState("");

  // Subcategories Tab states
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [activeSubcategoriesOnly, setActiveSubcategoriesOnly] = useState(false);

  // Products Tab states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [prodSearchQuery, setProdSearchQuery] = useState("");
  const [prodSearchType, setProdSearchType] = useState("all"); // all, featured, trending, discounted, newarrivals, ordered, category, subcategory, sku, id
  const [prodFilterId, setProdFilterId] = useState(""); // Category ID, Subcategory ID, Sku, or Product ID depending on search type
  const [prodPageNo, setProdPageNo] = useState(0);
  const [prodPageSize, setProdPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Category Form Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Custom Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, name }

  // Subcategory Form Modals state
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Product Form Modals state
  const [isAddProdModalOpen, setIsAddProdModalOpen] = useState(false);
  const [isEditProdModalOpen, setIsEditProdModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Image Upload helper states
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadingSubId, setUploadingSubId] = useState(null);
  const [uploadingProdId, setUploadingProdId] = useState(null);

  // Category fields
  const [categoryName, setCategoryName] = useState("");
  const [categoryArabicName, setCategoryArabicName] = useState("");
  const [categoryLevel, setCategoryLevel] = useState("ONE");
  const [categoryPosition, setCategoryPosition] = useState(1);
  const [categoryStatus, setCategoryStatus] = useState(true);
  const [isDiscounted, setIsDiscounted] = useState(false);

  // Subcategory fields
  const [subName, setSubName] = useState("");
  const [subArabicName, setSubArabicName] = useState("");
  const [subParentCategoryId, setSubParentCategoryId] = useState("");
  const [subLevel, setSubLevel] = useState("ONE");
  const [subStatus, setSubStatus] = useState(true);

  // Product fields
  const [prodTitle, setProdTitle] = useState("");
  const [prodArabicTitle, setProdArabicTitle] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodArabicDescription, setProdArabicDescription] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodWeight, setProdWeight] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodSubCategoryId, setProdSubCategoryId] = useState("");
  const [prodBrandId, setProdBrandId] = useState(1);
  const [prodPosition, setProdPosition] = useState(1);
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodIsFeatured, setProdIsFeatured] = useState(true);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsDiscounted, setProdIsDiscounted] = useState(false);
  const [prodIsNewArrivals, setProdIsNewArrivals] = useState(true);
  const [prodIsRecommended, setProdIsRecommended] = useState(true);

  // Form Subcategories helper state for dynamically loading subcategories on category selection in add/edit modals
  const [formSubcategories, setFormSubcategories] = useState([]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError("");
    try {
      const response = await categoryService.getCategories(2);
      let rawData = response.data?.data;
      if (rawData === undefined || rawData === null) {
        rawData = Array.isArray(response.data) ? response.data : [];
      } else if (!Array.isArray(rawData)) {
        rawData = [rawData];
      }
      setCategories(rawData);
      if (rawData.length > 0 && !selectedParentCategoryId) {
        setSelectedParentCategoryId(rawData[0].id.toString());
      }
    } catch (err) {
      setError("Failed to fetch categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [selectedParentCategoryId]);

  // Fetch Subcategories
  const fetchSubcategories = useCallback(async () => {
    setSubcategoriesLoading(true);
    setError("");
    try {
      let response;
      if (activeSubcategoriesOnly) {
        response = await subcategoryService.getActiveSubcategories();
      } else if (selectedParentCategoryId) {
        response = await subcategoryService.getSubcategoriesByCategory(selectedParentCategoryId);
      } else {
        setSubcategories([]);
        setSubcategoriesLoading(false);
        return;
      }
      let rawData = response.data?.data;
      if (rawData === undefined || rawData === null) {
        rawData = Array.isArray(response.data) ? response.data : [];
      } else if (!Array.isArray(rawData)) {
        rawData = [rawData];
      }
      setSubcategories(rawData);
    } catch (err) {
      setError("Failed to fetch subcategories.");
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, [selectedParentCategoryId, activeSubcategoriesOnly]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      let response;
      const params = { pageNo: prodPageNo, pageSize: prodPageSize };
      
      switch (prodSearchType) {
        case "featured":
          response = await productService.getFeaturedProducts(params);
          break;
        case "trending":
          response = await productService.getTrendingProducts(params);
          break;
        case "discounted":
          response = await productService.getDiscountedProducts(params);
          break;
        case "newarrivals":
          response = await productService.getNewArrivalsProducts(params);
          break;
        case "ordered":
          response = await productService.getOrderedProducts(params);
          break;
        case "category":
          if (!prodFilterId) {
            setProducts([]);
            setProductsLoading(false);
            return;
          }
          response = await productService.getProductsByCategory(prodFilterId, params);
          break;
        case "subcategory":
          if (!prodFilterId) {
            setProducts([]);
            setProductsLoading(false);
            return;
          }
          response = await productService.getProductsBySubcategory(prodFilterId, params);
          break;
        case "sku":
          if (!prodFilterId) {
            setProducts([]);
            setProductsLoading(false);
            return;
          }
          response = await productService.getProductBySku(prodFilterId);
          break;
        case "id":
          if (!prodFilterId) {
            setProducts([]);
            setProductsLoading(false);
            return;
          }
          response = await productService.getProductById(prodFilterId);
          break;
        case "all":
        default:
          response = await productService.getProducts(params);
          break;
      }

      let rawData = response.data?.data;
      if (rawData === undefined || rawData === null) {
        rawData = Array.isArray(response.data) ? response.data : [];
      } else if (!Array.isArray(rawData)) {
        rawData = [rawData];
      }
      setProducts(rawData);

      // Handle pagination properties if present, else calculate
      if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      } else {
        setTotalPages(rawData.length < prodPageSize && prodPageNo === 0 ? 1 : prodPageNo + 2);
      }
    } catch (err) {
      setProductsError("Failed to fetch products catalog.");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [prodSearchType, prodFilterId, prodPageNo, prodPageSize]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "subcategories") {
      fetchSubcategories();
    }
  }, [activeTab, fetchSubcategories]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  // Load Subcategories for Modal Forms dynamically on Category selection
  const loadFormSubcategories = async (catId) => {
    if (!catId) return;
    try {
      const response = await subcategoryService.getSubcategoriesByCategory(catId);
      const data = response.data?.data || response.data || [];
      setFormSubcategories(Array.isArray(data) ? data : [data]);
      if (data.length > 0) {
        setProdSubCategoryId(data[0].id.toString());
      } else {
        setProdSubCategoryId("");
      }
    } catch {
      setFormSubcategories([]);
      setProdSubCategoryId("");
    }
  };

  // Search Categories
  const handleCategorySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCategories();
      return;
    }
    setCategoriesLoading(true);
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
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategories(filtered);
    } finally {
      setCategoriesLoading(false);
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
      resetCategoryForm();
      fetchCategories();
      toast.success("Category created successfully!");
    } catch (err) {
      toast.error("Failed to create category.");
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
      resetCategoryForm();
      fetchCategories();
      toast.success("Category updated successfully!");
    } catch (err) {
      toast.error("Failed to update category.");
    }
  };

  // Delete Category
  const handleDeleteCategory = (id, name) => {
    setDeleteTarget({ type: "category", id, name });
    setIsDeleteModalOpen(true);
  };

  // Category Image Upload
  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    setError("");
    try {
      await categoryService.uploadCategoryImage(id, file);
      fetchCategories();
      toast.success("Category image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload category image.");
    } finally {
      setUploadingId(null);
    }
  };

  // Add Subcategory Handler
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: subName,
        arabicName: subArabicName,
        categoryId: Number(subParentCategoryId),
        level: subLevel,
        status: subStatus,
      };
      await subcategoryService.createSubcategory(payload);
      setIsAddSubModalOpen(false);
      resetSubcategoryForm();
      fetchSubcategories();
      toast.success("Subcategory created successfully!");
    } catch (err) {
      toast.error("Failed to create subcategory.");
    }
  };

  // Edit Subcategory Handler
  const handleEditSubcategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        id: selectedSubcategory.id,
        name: subName,
        arabicName: subArabicName,
        categoryId: Number(subParentCategoryId),
        level: subLevel,
        status: subStatus,
      };
      await subcategoryService.updateSubcategory(payload);
      setIsEditSubModalOpen(false);
      resetSubcategoryForm();
      fetchSubcategories();
      toast.success("Subcategory updated successfully!");
    } catch (err) {
      toast.error("Failed to update subcategory.");
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = (id, name) => {
    setDeleteTarget({ type: "subcategory", id, name });
    setIsDeleteModalOpen(true);
  };

  // Subcategory Image Upload
  const handleSubImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingSubId(id);
    setError("");
    try {
      await subcategoryService.uploadSubcategoryImage(id, file);
      fetchSubcategories();
      toast.success("Subcategory image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload subcategory image.");
    } finally {
      setUploadingSubId(null);
    }
  };

  // Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductsError("");
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
        position: Number(prodPosition),
        isActive: prodIsActive,
        isFeatured: prodIsFeatured,
        isTrending: prodIsTrending,
        isDiscounted: prodIsDiscounted,
        isNewArrivals: prodIsNewArrivals,
        isRecommended: prodIsRecommended,
      };
      await productService.createProduct(payload);
      setIsAddProdModalOpen(false);
      resetProductForm();
      fetchProducts();
      toast.success("Product created successfully!");
    } catch (err) {
      toast.error("Failed to create product. Make sure SKU is unique.");
    }
  };

  // Edit Product Handler
  const handleEditProduct = async (e) => {
    e.preventDefault();
    setProductsError("");
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
        position: Number(prodPosition),
        isActive: prodIsActive,
        isFeatured: prodIsFeatured,
        isTrending: prodIsTrending,
        isDiscounted: prodIsDiscounted,
        isNewArrivals: prodIsNewArrivals,
        isRecommended: prodIsRecommended,
      };
      await productService.updateProduct(payload);
      setIsEditProdModalOpen(false);
      resetProductForm();
      fetchProducts();
      toast.success("Product updated successfully!");
    } catch (err) {
      toast.error("Failed to update product details.");
    }
  };

  // Update Product Active Status Switch
  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await productService.updateProductStatus(id, !currentStatus);
      fetchProducts();
      toast.success("Product status updated successfully!");
    } catch (err) {
      toast.error("Failed to update product status.");
    }
  };

  // Update Product Positioning Order
  const handlePositionUpdate = async (id, posVal) => {
    const numericPos = Number(posVal);
    if (isNaN(numericPos)) return;
    try {
      await productService.updateProductPosition(id, numericPos);
      fetchProducts();
      toast.success(`Product position updated to ${numericPos}!`);
    } catch (err) {
      toast.error("Failed to update product position.");
    }
  };

  // Delete Product
  const handleDeleteProduct = (id, name) => {
    setDeleteTarget({ type: "product", id, name });
    setIsDeleteModalOpen(true);
  };

  // Product Image Upload
  const handleProdImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingProdId(id);
    setProductsError("");
    try {
      await productService.uploadProductImage(id, file);
      fetchProducts();
      toast.success("Product image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload product image.");
    } finally {
      setUploadingProdId(null);
    }
  };

  // Confirm delete logic handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, name } = deleteTarget;
    setIsDeleteModalOpen(false);
    try {
      if (type === "category") {
        await categoryService.deleteCategory(id);
        toast.success(`Category "${name}" deleted successfully!`);
        fetchCategories();
      } else if (type === "subcategory") {
        await subcategoryService.deleteSubcategory(id);
        toast.success(`Subcategory "${name}" deleted successfully!`);
        fetchSubcategories();
      } else if (type === "product") {
        await productService.deleteProduct(id);
        toast.success(`Product "${name}" deleted successfully!`);
        fetchProducts();
      }
    } catch (err) {
      toast.error(`Failed to delete ${type}.`);
    } finally {
      setDeleteTarget(null);
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

  const openEditSubModal = (sub) => {
    setSelectedSubcategory(sub);
    setSubName(sub.name);
    setSubArabicName(sub.arabicName);
    setSubParentCategoryId(sub.categoryId?.toString() || selectedParentCategoryId);
    setSubLevel(sub.level || "ONE");
    setSubStatus(sub.status ?? true);
    setIsEditSubModalOpen(true);
  };

  const openEditProdModal = async (prod) => {
    setSelectedProduct(prod);
    setProdTitle(prod.title);
    setProdArabicTitle(prod.arabicTitle);
    setProdDescription(prod.description);
    setProdArabicDescription(prod.arabicDescription);
    setProdSku(prod.sku);
    setProdWeight(prod.weight || "");
    setProdCategoryId(prod.categoryId?.toString() || "");
    setProdBrandId(prod.brandId || 1);
    setProdPosition(prod.position || 1);
    setProdIsActive(prod.isActive ?? true);
    setProdIsFeatured(prod.isFeatured ?? true);
    setProdIsTrending(prod.isTrending ?? false);
    setProdIsDiscounted(prod.isDiscounted ?? false);
    setProdIsNewArrivals(prod.isNewArrivals ?? true);
    setProdIsRecommended(prod.isRecommended ?? true);

    // Fetch related subcategories for this category first
    if (prod.categoryId) {
      await loadFormSubcategories(prod.categoryId);
      setProdSubCategoryId(prod.subCategoryId?.toString() || "");
    }
    setIsEditProdModalOpen(true);
  };

  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryArabicName("");
    setCategoryLevel("ONE");
    setCategoryPosition(1);
    setCategoryStatus(true);
    setIsDiscounted(false);
    setSelectedCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubName("");
    setSubArabicName("");
    setSubParentCategoryId(selectedParentCategoryId || (categories[0]?.id?.toString() || ""));
    setSubLevel("ONE");
    setSubStatus(true);
    setSelectedSubcategory(null);
  };

  const resetProductForm = () => {
    setProdTitle("");
    setProdArabicTitle("");
    setProdDescription("");
    setProdArabicDescription("");
    setProdSku("");
    setProdWeight("");
    setProdCategoryId(categories[0]?.id?.toString() || "");
    setProdSubCategoryId("");
    setProdBrandId(1);
    setProdPosition(1);
    setProdIsActive(true);
    setProdIsFeatured(true);
    setProdIsTrending(false);
    setProdIsDiscounted(false);
    setProdIsNewArrivals(true);
    setProdIsRecommended(true);
    setSelectedProduct(null);
  };

  // Search/Filter subcategories locally based on name
  const filteredSubcategories = Array.isArray(subcategories)
    ? subcategories.filter((sub) =>
        sub && sub.name && typeof sub.name === "string"
          ? sub.name.toLowerCase().includes(subSearchQuery.toLowerCase())
          : false
      )
    : [];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory & Catalog
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage categories, subcategories, image media, and audit products catalog.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "categories") fetchCategories();
                else if (activeTab === "subcategories") fetchSubcategories();
                else fetchProducts();
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Current List"
            >
              <RefreshIcon className={categoriesLoading || subcategoriesLoading || productsLoading ? "animate-spin" : ""} />
            </button>

            {activeTab === "categories" && (
              <button
                onClick={() => {
                  resetCategoryForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                + Add Category
              </button>
            )}

            {activeTab === "subcategories" && (
              <button
                onClick={() => {
                  resetSubcategoryForm();
                  setIsAddSubModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                + Add Subcategory
              </button>
            )}

            {activeTab === "products" && (
              <button
                onClick={() => {
                  resetProductForm();
                  if (categories.length > 0) {
                    setProdCategoryId(categories[0].id.toString());
                    loadFormSubcategories(categories[0].id);
                  }
                  setIsAddProdModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                + Add Product
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "categories"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Product Categories
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "subcategories"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Subcategories
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "products"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Products Catalog
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
            {/* Search & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <form onSubmit={handleCategorySearch} className="flex gap-2 max-w-md flex-1">
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
                  className="px-4 py-2.5 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold text-xs shadow-md border border-slate-800 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* View Switcher */}
              <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
                <button
                  onClick={() => setCatViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    catViewMode === "grid"
                      ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setCatViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    catViewMode === "table"
                      ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Table View"
                >
                  <TableIcon />
                </button>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Categories Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try creating a category or resetting the search.</p>
              </div>
            ) : catViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview / Upload Area */}
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
                              Discounted
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
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Categories Table View */
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Image</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Arabic Name</th>
                        <th className="p-4">ID</th>
                        <th className="p-4">Position</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="relative w-12 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <UploadIcon className="w-5 h-5 text-slate-400" />
                              )}
                              <label className="absolute inset-0 bg-slate-950/65 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadIcon className="w-4 h-4 text-amber-400" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(cat.id, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-sans" dir="rtl">{cat.arabicName || "—"}</td>
                          <td className="p-4 font-mono text-slate-500">{cat.id}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                              {cat.position}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              cat.status
                                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                            }`}>
                              {cat.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(cat)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                                title="Edit"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Subcategories Panel */}
        {activeTab === "subcategories" && (
          <div className="space-y-4">
            {/* Filter, Search & View Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span>Parent Category:</span>
                  <select
                    value={selectedParentCategoryId}
                    onChange={(e) => {
                      setActiveSubcategoriesOnly(false);
                      setSelectedParentCategoryId(e.target.value);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeSubcategoriesOnly}
                      onChange={(e) => setActiveSubcategoriesOnly(e.target.checked)}
                      className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Show Active Only</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64 text-xs">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Filter by subcategory name..."
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* View Switcher */}
                <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setSubViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      subViewMode === "grid"
                        ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <GridIcon />
                  </button>
                  <button
                    onClick={() => setSubViewMode("table")}
                    className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      subViewMode === "table"
                        ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Table View"
                  >
                    <TableIcon />
                  </button>
                </div>
              </div>
            </div>

            {subcategoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SubcategorySkeleton key={i} />
                ))}
              </div>
            ) : filteredSubcategories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Subcategories Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another parent category or check active filter settings.</p>
              </div>
            ) : subViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubcategories.map((sub) => (
                  <motion.div
                    key={sub.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Subcategory Image Upload Area */}
                      <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <UploadIcon className="w-8 h-8 stroke-1 mb-1 text-slate-400" />
                            <span className="text-[10px]">No Subcategory Image</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                          <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                          <span className="text-[10px] font-bold">Upload Sub-Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSubImageUpload(sub.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {uploadingSubId === sub.id && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-xs font-semibold">
                            <RefreshIcon className="animate-spin text-amber-500 w-5 h-5 mr-1" />
                            Uploading...
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {sub.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                            Sub ID: {sub.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium font-sans text-right" dir="rtl">
                          {sub.arabicName || "—"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-semibold">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            sub.status
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                          }`}>
                            {sub.status ? "Active" : "Inactive"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                            Category ID: {sub.categoryId}
                          </span>
                          {sub.level && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800 font-mono">
                              Level: {sub.level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => openEditSubModal(sub)}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Subcategories Table View */
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Image</th>
                        <th className="p-4">Sub Name</th>
                        <th className="p-4">Arabic Name</th>
                        <th className="p-4">Sub ID</th>
                        <th className="p-4">Category ID</th>
                        <th className="p-4">Level</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filteredSubcategories.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="relative w-12 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group">
                              {sub.image ? (
                                <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                              ) : (
                                <UploadIcon className="w-5 h-5 text-slate-400" />
                              )}
                              <label className="absolute inset-0 bg-slate-950/65 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadIcon className="w-4 h-4 text-amber-400" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSubImageUpload(sub.id, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-sans" dir="rtl">{sub.arabicName || "—"}</td>
                          <td className="p-4 font-mono text-slate-500">{sub.id}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                              {sub.categoryId}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                              {sub.level || "ONE"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              sub.status
                                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                            }`}>
                              {sub.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditSubModal(sub)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                                title="Edit"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Products Catalog Dashboard */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Filter, Control & View Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Filter Type:</span>
                  <select
                    value={prodSearchType}
                    onChange={(e) => {
                      setProdSearchType(e.target.value);
                      setProdFilterId("");
                      setProdPageNo(0);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="featured">Featured Only</option>
                    <option value="trending">Trending Only</option>
                    <option value="discounted">Discounted Only</option>
                    <option value="newarrivals">New Arrivals Only</option>
                    <option value="ordered">Ordered Products</option>
                    <option value="category">By Category ID</option>
                    <option value="subcategory">By Subcategory ID</option>
                    <option value="sku">By SKU</option>
                    <option value="id">By Product ID</option>
                  </select>
                </div>

                {/* Dynamic filter input if type is category, subcategory, sku, id */}
                {["category", "subcategory", "sku", "id"].includes(prodSearchType) && (
                  <div className="flex items-center gap-2">
                    <span>Enter {prodSearchType.toUpperCase()}:</span>
                    <input
                      type="text"
                      value={prodFilterId}
                      onChange={(e) => setProdFilterId(e.target.value)}
                      placeholder={`e.g. ${prodSearchType === "category" ? "11" : prodSearchType === "subcategory" ? "23" : "ACT-0087"}`}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setProdPageNo(0);
                    fetchProducts();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold border border-slate-800 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>

              {/* View Switcher */}
              <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setProdViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    prodViewMode === "grid"
                      ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setProdViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    prodViewMode === "table"
                      ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Table View"
                >
                  <TableIcon />
                </button>
              </div>
            </div>

            {productsError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {productsError}
              </div>
            )}

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Products Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another filter parameter or create a product.</p>
              </div>
            ) : prodViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <motion.div
                    key={prod.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Click/Upload */}
                      <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                            <UploadIcon className="w-8 h-8 stroke-1 mb-1 text-slate-400" />
                            <span className="text-[10px]">No Product Image</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                          <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                          <span className="text-[10px] font-bold">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProdImageUpload(prod.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {uploadingProdId === prod.id && (
                          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-xs font-semibold">
                            <RefreshIcon className="animate-spin text-amber-500 w-5 h-5 mr-1" />
                            Uploading...
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

                        {/* Badges/labels */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[9px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${prod.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {prod.isActive ? "Active" : "Inactive"}
                          </span>
                          {prod.isFeatured && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">Featured</span>}
                          {prod.isTrending && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">Trending</span>}
                          {prod.isDiscounted && <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">Discounted</span>}
                          {prod.isNewArrivals && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">New</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                          <div>
                            <span className="text-slate-400">Position ID:</span>
                            <input
                              type="number"
                              defaultValue={prod.position || 1}
                              onBlur={(e) => handlePositionUpdate(prod.id, e.target.value)}
                              className="w-12 ml-1 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-slate-400">Weight:</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{prod.weight || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Category ID:</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{prod.categoryId}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Sub ID:</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{prod.subCategoryId}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => toggleProductStatus(prod.id, prod.isActive)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                          prod.isActive
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                        }`}
                      >
                        {prod.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => openEditProdModal(prod)}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title)}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Products Catalog Table View */
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
                      {products.map((prod) => (
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
                            <div className="text-[11px] font-mono text-amber-500 mt-0.5">SKU: {prod.sku}</div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-sans" dir="rtl">{prod.arabicTitle || "—"}</td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                                Cat: {prod.categoryId}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800">
                                Sub: {prod.subCategoryId}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{prod.weight || "—"}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                prod.isActive
                                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                              }`}>
                                {prod.isActive ? "Active" : "Inactive"}
                              </span>
                              {prod.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                                  Featured
                                </span>
                              )}
                              {prod.isDiscounted && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                  Discounted
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleProductStatus(prod.id, prod.isActive)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                                  prod.isActive
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                                }`}
                              >
                                {prod.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => openEditProdModal(prod)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                                title="Edit"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                Page {prodPageNo + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={prodPageNo === 0}
                  onClick={() => {
                    setProdPageNo((p) => Math.max(0, p - 1));
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={products.length < prodPageSize}
                  onClick={() => {
                    setProdPageNo((p) => p + 1);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
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
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
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
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Add Subcategory */}
        <AnimatePresence>
          {isAddSubModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Subcategory</h2>
                  <button onClick={() => setIsAddSubModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleAddSubcategory} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Subcategory Name</label>
                    <input
                      type="text"
                      required
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Name</label>
                    <input
                      type="text"
                      required
                      value={subArabicName}
                      onChange={(e) => setSubArabicName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-right focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Parent Category</label>
                      <select
                        value={subParentCategoryId}
                        onChange={(e) => setSubParentCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Level</label>
                      <select
                        value={subLevel}
                        onChange={(e) => setSubLevel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ONE">ONE</option>
                        <option value="TWO">TWO</option>
                        <option value="THREE">THREE</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subStatus}
                        onChange={(e) => setSubStatus(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active Status</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddSubModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      Save Subcategory
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Edit Subcategory */}
        <AnimatePresence>
          {isEditSubModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Subcategory Details</h2>
                  <button onClick={() => setIsEditSubModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleEditSubcategory} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Subcategory Name</label>
                    <input
                      type="text"
                      required
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Name</label>
                    <input
                      type="text"
                      required
                      value={subArabicName}
                      onChange={(e) => setSubArabicName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-right focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Parent Category</label>
                      <select
                        value={subParentCategoryId}
                        onChange={(e) => setSubParentCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Level</label>
                      <select
                        value={subLevel}
                        onChange={(e) => setSubLevel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="ONE">ONE</option>
                        <option value="TWO">TWO</option>
                        <option value="THREE">THREE</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subStatus}
                        onChange={(e) => setSubStatus(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active Status</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditSubModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Add Product */}
        <AnimatePresence>
          {isAddProdModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Catalog Product</h2>
                  <button onClick={() => setIsAddProdModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-semibold overflow-y-auto flex-1 pr-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Title</label>
                      <input
                        type="text"
                        required
                        value={prodArabicTitle}
                        onChange={(e) => setProdArabicTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white text-right focus:outline-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Product Description</label>
                      <textarea
                        rows={2}
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Description</label>
                      <textarea
                        rows={2}
                        value={prodArabicDescription}
                        onChange={(e) => setProdArabicDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white text-right focus:outline-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">SKU</label>
                      <input
                        type="text"
                        required
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Weight</label>
                      <input
                        type="text"
                        value={prodWeight}
                        onChange={(e) => setProdWeight(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                        placeholder="e.g. 1 KG"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand ID</label>
                      <input
                        type="number"
                        value={prodBrandId}
                        onChange={(e) => setProdBrandId(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                      <select
                        value={prodCategoryId}
                        onChange={(e) => {
                          setProdCategoryId(e.target.value);
                          loadFormSubcategories(e.target.value);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Subcategory</label>
                      <select
                        value={prodSubCategoryId}
                        onChange={(e) => setProdSubCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      >
                        {formSubcategories.length === 0 && (
                          <option value="">No Subcategories Found</option>
                        )}
                        {formSubcategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Position</label>
                      <input
                        type="number"
                        value={prodPosition}
                        onChange={(e) => setProdPosition(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 py-2 border-t border-b border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Featured</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsTrending}
                        onChange={(e) => setProdIsTrending(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Trending</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsDiscounted}
                        onChange={(e) => setProdIsDiscounted(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Discounted</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsNewArrivals}
                        onChange={(e) => setProdIsNewArrivals(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>New Arrival</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsRecommended}
                        onChange={(e) => setProdIsRecommended(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Recommended</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddProdModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Edit Product */}
        <AnimatePresence>
          {isEditProdModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Product Details</h2>
                  <button onClick={() => setIsEditProdModalOpen(false)}>
                    <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <form onSubmit={handleEditProduct} className="space-y-4 text-xs font-semibold overflow-y-auto flex-1 pr-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Title</label>
                      <input
                        type="text"
                        required
                        value={prodArabicTitle}
                        onChange={(e) => setProdArabicTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white text-right focus:outline-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Product Description</label>
                      <textarea
                        rows={2}
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Arabic Description</label>
                      <textarea
                        rows={2}
                        value={prodArabicDescription}
                        onChange={(e) => setProdArabicDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white text-right focus:outline-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">SKU</label>
                      <input
                        type="text"
                        required
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Weight</label>
                      <input
                        type="text"
                        value={prodWeight}
                        onChange={(e) => setProdWeight(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand ID</label>
                      <input
                        type="number"
                        value={prodBrandId}
                        onChange={(e) => setProdBrandId(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                      <select
                        value={prodCategoryId}
                        onChange={(e) => {
                          setProdCategoryId(e.target.value);
                          loadFormSubcategories(e.target.value);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Subcategory</label>
                      <select
                        value={prodSubCategoryId}
                        onChange={(e) => setProdSubCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      >
                        {formSubcategories.length === 0 && (
                          <option value="">No Subcategories Found</option>
                        )}
                        {formSubcategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Position</label>
                      <input
                        type="number"
                        value={prodPosition}
                        onChange={(e) => setProdPosition(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 py-2 border-t border-b border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Featured</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsTrending}
                        onChange={(e) => setProdIsTrending(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Trending</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsDiscounted}
                        onChange={(e) => setProdIsDiscounted(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Discounted</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsNewArrivals}
                        onChange={(e) => setProdIsNewArrivals(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>New Arrival</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsRecommended}
                        onChange={(e) => setProdIsRecommended(e.target.checked)}
                        className="rounded border-slate-200 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Recommended</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditProdModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Custom Delete Confirmation */}
        <AnimatePresence>
          {isDeleteModalOpen && deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden text-center"
              >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/30 mb-4">
                  <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Confirm Delete
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 px-2">
                  Are you sure you want to delete the {deleteTarget.type} <span className="font-bold text-slate-800 dark:text-slate-200">"{deleteTarget.name}"</span>? This action cannot be undone.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeleteTarget(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Toast />
      </motion.div>
    </MainLayout>
  );
}
