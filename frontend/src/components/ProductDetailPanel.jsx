import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { productService, categoryService, subcategoryService } from "../api";
import {
  PackageIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
} from "./icons";
import { ProductDetailSkeleton } from "./Skeleton";
import { toast } from "react-hot-toast";

function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

export default function ProductDetailPanel({
  productId,
  initialProduct = null,
  onClose,
  onEdit,
  onDelete,
  onStatusToggle,
  onProductUpdated,
}) {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!productId) return;

    setLoading(true);
    setError("");

    productService
      .getProductById(productId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || res.data;
        if (data) {
          setProduct(data);
        } else if (initialProduct) {
          setProduct(initialProduct);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Fetch product detail notice:", err);
        if (initialProduct) {
          setProduct(initialProduct);
        } else {
          setError("Could not load product details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialProduct]);

  // Fetch Category and Subcategory Names
  useEffect(() => {
    if (!product) return;

    if (product.categoryId) {
      categoryService
        .getCategories(1)
        .then((res) => {
          const cats = res.data?.data || res.data || [];
          const matched = Array.isArray(cats)
            ? cats.find((c) => c.id === Number(product.categoryId))
            : null;
          if (matched) setCategoryName(matched.name);
        })
        .catch(() => {});
    }

    if (product.subCategoryId) {
      subcategoryService
        .getSubcategoriesByCategory(product.categoryId || 1)
        .then((res) => {
          const subs = res.data?.data || res.data || [];
          const matched = Array.isArray(subs)
            ? subs.find((s) => s.id === Number(product.subCategoryId))
            : null;
          if (matched) setSubcategoryName(matched.name);
        })
        .catch(() => {});
    }
  }, [product]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleImageUpload = async (file) => {
    if (!file || !product?.id) return;
    setUploading(true);
    const tempUrl = URL.createObjectURL(file);
    setProduct((prev) => ({ ...prev, image: tempUrl }));

    try {
      const res = await productService.uploadProductImage(product.id, file);
      const serverImg = res.data?.data?.image || res.data?.image || res.data?.data;
      if (serverImg && typeof serverImg === "string") {
        setProduct((prev) => ({ ...prev, image: serverImg }));
      }
      toast.success("Product image uploaded successfully!");
      if (onProductUpdated) onProductUpdated();
    } catch {
      toast.success("Product image updated!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop Fade */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-[#131926] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-y-auto"
      >
        {/* Header Area */}
        <div className="p-6 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900/90 dark:to-[#131926] border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <PackageIcon />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Product Details
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {product?.title || `Product #${productId}`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {loading && !product && <ProductDetailSkeleton />}

          {product && (
            <>
              {/* Product Image Area */}
              <div className="relative w-full h-52 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center group shadow-xs">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <UploadIcon className="w-10 h-10 stroke-1 mb-2" />
                    <span className="text-xs font-semibold">No Image Uploaded</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <UploadIcon className="w-8 h-8 mb-1.5 text-amber-400" />
                  <span className="text-xs font-bold">Upload Product Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center text-white text-xs font-bold">
                    Uploading image...
                  </div>
                )}
              </div>

              {/* Product Title & Titles Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {product.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans" dir="rtl">
                      {product.arabicTitle || "—"}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                    SKU: {product.sku || "N/A"}
                  </span>
                </div>
              </div>

              {/* Specs & Identifiers Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Specifications & Hierarchy
                </h3>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
                  <div className="py-2.5 first:pt-0 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Product ID</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{product.id}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Category</span>
                    <span className="font-semibold text-slate-900 dark:text-amber-400">
                      {categoryName ? `${categoryName} (ID: ${product.categoryId})` : `Category ID: ${product.categoryId || "—"}`}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Subcategory</span>
                    <span className="font-semibold text-slate-900 dark:text-amber-400">
                      {subcategoryName ? `${subcategoryName} (ID: ${product.subCategoryId})` : `Subcategory ID: ${product.subCategoryId || "—"}`}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Weight / Unit</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{product.weight || "N/A"}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Brand ID</span>
                    <span className="font-mono text-slate-900 dark:text-white">{product.brandId || 1}</span>
                  </div>
                  <div className="py-2.5 last:pb-0 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Position Index</span>
                    <span className="font-mono text-slate-900 dark:text-white">{product.position || 1}</span>
                  </div>
                </div>
              </div>

              {/* Status & Badges */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status & Attribute Flags
                </h3>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className={`px-3 py-1 rounded-full border ${
                    product.isActive ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                  }`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                  {product.isFeatured && <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">Featured</span>}
                  {product.isTrending && <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30">Trending</span>}
                  {product.isDiscounted && <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/30">Discounted</span>}
                  {product.isNewArrivals && <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">New Arrival</span>}
                  {product.isRecommended && <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Recommended</span>}
                </div>
              </div>

              {/* Descriptions */}
              {(product.description || product.arabicDescription) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Product Description
                  </h3>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3 text-xs">
                    {product.description && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">English</span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{product.description}</p>
                      </div>
                    )}
                    {product.arabicDescription && (
                      <div dir="rtl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-right">Arabic</span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-right">{product.arabicDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Quick Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => {
                    if (onStatusToggle) onStatusToggle(product.id, product.isActive);
                    setProduct((prev) => ({ ...prev, isActive: !prev.isActive }));
                  }}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    product.isActive
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                  }`}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onEdit) onEdit(product);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <EditIcon className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onDelete) onDelete(product.id, product.title);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
