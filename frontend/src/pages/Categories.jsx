import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryService } from "../api";
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
import { extractErrorMessage } from "../utils/errorHelper";

function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

export default function Categories({ isTab = false }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [catViewMode, setCatViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Form State
  const [categoryName, setCategoryName] = useState("");
  const [categoryArabicName, setCategoryArabicName] = useState("");
  const [categoryLevel, setCategoryLevel] = useState("ONE");
  const [categoryPosition, setCategoryPosition] = useState(1);
  const [categoryStatus, setCategoryStatus] = useState(true);
  const [isDiscounted, setIsDiscounted] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError("");
    try {
      const [res1, res2] = await Promise.allSettled([
        categoryService.getCategories(1),
        categoryService.getCategories(2),
      ]);

      const combinedMap = new Map();
      [res1, res2].forEach((r) => {
        if (r.status === "fulfilled" && r.value?.data) {
          let items = r.value.data?.data;
          if (items === undefined || items === null) items = r.value.data;
          if (!Array.isArray(items)) items = [items];
          items.forEach((cat) => {
            if (cat && cat.id != null) {
              combinedMap.set(cat.id, cat);
            }
          });
        }
      });

      const combined = Array.from(combinedMap.values());
      setCategories(combined);
    } catch (err) {
      console.error("fetchCategories error:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Live Instant Typing Search Filter for Categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.arabicName && c.arabicName.toLowerCase().includes(q)) ||
        (c.id && c.id.toString().includes(q))
    );
  }, [categories, searchQuery]);

  const resetForm = () => {
    setCategoryName("");
    setCategoryArabicName("");
    setCategoryLevel("ONE");
    setCategoryPosition(1);
    setCategoryStatus(true);
    setIsDiscounted(false);
    setSelectedCategory(null);
  };

  const handleCategorySearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await fetchCategories();
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    setError("");
    const tempUrl = URL.createObjectURL(file);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, image: tempUrl } : c))
    );

    try {
      const res = await categoryService.uploadCategoryImage(id, file);
      const serverImg = res.data?.data?.image || res.data?.image || res.data?.data;
      if (serverImg && typeof serverImg === "string") {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, image: serverImg } : c))
        );
      }
      toast.success("Category image uploaded successfully!");
    } catch (err) {
      console.error("Upload category image error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to upload category image.");
      toast.error(msg);
    } finally {
      setUploadingId(null);
    }
  };

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
      console.log("Creating category with payload:", JSON.stringify(payload));
      const res = await categoryService.createCategory(payload);
      console.log("Create category response:", res.data);
      const newCat = res.data?.data || res.data;
      setIsAddModalOpen(false);
      resetForm();

      if (newCat && newCat.id) {
        setCategories((prev) => [newCat, ...prev.filter((c) => c.id !== newCat.id)]);
      }
      await fetchCategories();
      toast.success("Category created successfully!");
    } catch (err) {
      console.error("Create category error:", err?.response?.data || err?.response || err);
      const msg = extractErrorMessage(err, "Failed to create category.");
      toast.error(msg);
    }
  };

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
      console.log("Updating category with payload:", JSON.stringify(payload));
      await categoryService.updateCategory(payload);
      setIsEditModalOpen(false);
      resetForm();
      await fetchCategories();
      toast.success("Category updated successfully!");
    } catch (err) {
      console.error("Update category error:", err?.response?.data || err?.response || err);
      const msg = extractErrorMessage(err, "Failed to update category.");
      toast.error(msg);
    }
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setCategoryName(cat.name || "");
    setCategoryArabicName(cat.arabicName || "");
    setCategoryLevel(cat.level || "ONE");
    setCategoryPosition(cat.position || 1);
    setCategoryStatus(cat.status ?? true);
    setIsDiscounted(cat.isDiscountedCategory ?? false);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchCategories();
      toast.success("Category deleted successfully!");
    } catch (err) {
      console.error("Delete category error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to delete category.");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <form onSubmit={handleCategorySearch} className="flex gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Category Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white hover:bg-[#07132B] font-bold text-xs shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setCatViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${catViewMode === "grid"
                ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
                }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setCatViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${catViewMode === "table"
                ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
                }`}
            >
              <TableIcon />
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
          >
            + Add Category
          </button>
        </div>
      </div>

      {catViewMode === "grid" ? (
        categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 mb-2 stroke-1" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Categories Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadIcon className="w-8 h-8 stroke-1 mb-1" />
                        <span className="text-[10px]">No Image Uploaded</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                      <span className="text-[10px] font-bold">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(cat.id, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {cat.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        ID: {cat.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium font-sans text-right" dir="rtl">
                      {cat.arabicName || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget({ type: "category", id: cat.id, name: cat.name });
                      setIsDeleteModalOpen(true);
                    }}
                    className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
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
                  <th className="p-4">Name</th>
                  <th className="p-4">Arabic Name</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {categoriesLoading ? (
                  <TableRowsSkeleton rows={5} columnsCount={7} />
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No Categories Found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
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
                      <td className="p-4">{cat.position || 1}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.status ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                          }`}>
                          {cat.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditModal(cat)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 cursor-pointer">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeleteTarget({ type: "category", id: cat.id, name: cat.name }); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer">
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

      {/* Add / Edit Category Modals */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isAddModalOpen ? "Add New Category" : "Edit Category"}
                </h3>
                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleAddCategory : handleEditCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Pulses & Lentils"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Arabic Name</label>
                  <input
                    type="text"
                    value={categoryArabicName}
                    onChange={(e) => setCategoryArabicName(e.target.value)}
                    placeholder="e.g. البقوليات والعدس"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Level</label>
                    <select
                      value={categoryLevel}
                      onChange={(e) => setCategoryLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ONE">ONE</option>
                      <option value="TWO">TWO</option>
                      <option value="THREE">THREE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Position</label>
                    <input
                      type="number"
                      min={1}
                      value={categoryPosition}
                      onChange={(e) => setCategoryPosition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status</label>
                    <select
                      value={categoryStatus ? "active" : "inactive"}
                      onChange={(e) => setCategoryStatus(e.target.value === "active")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Discounted?</label>
                    <select
                      value={isDiscounted ? "yes" : "no"}
                      onChange={(e) => setIsDiscounted(e.target.value === "yes")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer shadow-xs"
                  >
                    {isAddModalOpen ? "Create Category" : "Save Changes"}
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
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Category?</h3>
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
