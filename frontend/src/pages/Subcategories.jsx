import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subcategoryService, categoryService } from "../api";
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

export default function Subcategories({ isTab = false }) {
  const [categories, setCategories] = useState([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(true);
  const [subViewMode, setSubViewMode] = useState("table");
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [activeSubcategoriesOnly, setActiveSubcategoriesOnly] = useState(false);

  // Modals
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [uploadingSubId, setUploadingSubId] = useState(null);

  // Form State
  const [subName, setSubName] = useState("");
  const [subArabicName, setSubArabicName] = useState("");
  const [subParentCategoryId, setSubParentCategoryId] = useState("");
  const [subLevel, setSubLevel] = useState("ONE");
  const [subStatus, setSubStatus] = useState(true);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Parent Categories for dropdown
  const fetchParentCategories = useCallback(async () => {
    try {
      const res = await categoryService.getCategories(1);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [data];
      setCategories(list);
      if (list.length > 0 && !selectedParentCategoryId) {
        setSelectedParentCategoryId(list[0].id.toString());
      }
    } catch (err) {
      console.error("fetchParentCategories error:", err);
    }
  }, [selectedParentCategoryId]);

  // Fetch Subcategories
  const fetchSubcategories = useCallback(async () => {
    setSubcategoriesLoading(true);
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
      console.warn("fetchSubcategories notice:", err);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, [selectedParentCategoryId, activeSubcategoriesOnly]);

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  const filteredSubcategories = useMemo(() => {
    if (!subSearchQuery.trim()) return subcategories;
    const q = subSearchQuery.toLowerCase().trim();
    return subcategories.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.arabicName && s.arabicName.toLowerCase().includes(q)) ||
        (s.id && s.id.toString().includes(q))
    );
  }, [subcategories, subSearchQuery]);

  const resetSubForm = () => {
    setSubName("");
    setSubArabicName("");
    setSubParentCategoryId(selectedParentCategoryId || (categories[0]?.id?.toString() ?? ""));
    setSubLevel("ONE");
    setSubStatus(true);
    setSelectedSubcategory(null);
  };

  const handleSubImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingSubId(id);
    const tempUrl = URL.createObjectURL(file);
    setSubcategories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, image: tempUrl } : s))
    );

    try {
      const res = await subcategoryService.uploadSubcategoryImage(id, file);
      const serverImg = res.data?.data?.image || res.data?.image || res.data?.data;
      if (serverImg && typeof serverImg === "string") {
        setSubcategories((prev) =>
          prev.map((s) => (s.id === id ? { ...s, image: serverImg } : s))
        );
      }
      toast.success("Subcategory image uploaded successfully!");
    } catch (err) {
      console.error("Upload subcategory image error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to upload subcategory image.");
      toast.error(msg);
    } finally {
      setUploadingSubId(null);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
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
      resetSubForm();
      fetchSubcategories();
      toast.success("Subcategory created successfully!");
    } catch (err) {
      console.error("Create subcategory error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to create subcategory.");
      toast.error(msg);
    }
  };

  const handleEditSubcategory = async (e) => {
    e.preventDefault();
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
      resetSubForm();
      fetchSubcategories();
      toast.success("Subcategory updated successfully!");
    } catch (err) {
      console.error("Update subcategory error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to update subcategory.");
      toast.error(msg);
    }
  };

  const openEditSubModal = (sub) => {
    setSelectedSubcategory(sub);
    setSubName(sub.name || "");
    setSubArabicName(sub.arabicName || "");
    setSubParentCategoryId(sub.categoryId?.toString() || selectedParentCategoryId);
    setSubLevel(sub.level || "ONE");
    setSubStatus(sub.status ?? true);
    setIsEditSubModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await subcategoryService.deleteSubcategory(deleteTarget.id);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchSubcategories();
      toast.success("Subcategory deleted successfully!");
    } catch (err) {
      console.error("Delete subcategory error:", err?.response?.data || err);
      const msg = extractErrorMessage(err, "Failed to delete subcategory.");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Parent Category:</span>
            <select
              value={selectedParentCategoryId}
              onChange={(e) => setSelectedParentCategoryId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ID: {c.id})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={activeSubcategoriesOnly}
              onChange={(e) => setActiveSubcategoriesOnly(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span>Show Active Only</span>
          </label>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by subcategory name..."
              value={subSearchQuery}
              onChange={(e) => setSubSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setSubViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                subViewMode === "grid" ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setSubViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                subViewMode === "table" ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <TableIcon />
            </button>
          </div>

          <button
            onClick={() => {
              resetSubForm();
              setIsAddSubModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
          >
            + Add Subcategory
          </button>
        </div>
      </div>

      {subViewMode === "grid" ? (
        subcategoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : filteredSubcategories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <PackageIcon className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-600 stroke-1 mb-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Subcategories Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubcategories.map((sub) => (
              <motion.div
                key={sub.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center group">
                    {sub.image ? (
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadIcon className="w-8 h-8 stroke-1 mb-1" />
                        <span className="text-[10px]">No Subcategory Image</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <UploadIcon className="w-6 h-6 mb-1 text-amber-400" />
                      <span className="text-[10px] font-bold">Upload Sub-Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSubImageUpload(sub.id, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {sub.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        Sub ID: {sub.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium font-sans text-right" dir="rtl">
                      {sub.arabicName || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => openEditSubModal(sub)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => { setDeleteTarget({ type: "subcategory", id: sub.id, name: sub.name }); setIsDeleteModalOpen(true); }}
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
                {subcategoriesLoading ? (
                  <TableRowsSkeleton rows={5} columnsCount={8} />
                ) : filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No Subcategories Found
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((sub) => (
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
                      <td className="p-4 font-mono text-slate-500">{sub.categoryId}</td>
                      <td className="p-4">{sub.level || "ONE"}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          sub.status ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                        }`}>
                          {sub.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditSubModal(sub)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 cursor-pointer">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeleteTarget({ type: "subcategory", id: sub.id, name: sub.name }); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer">
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

      {/* Add/Edit Subcategory Modals */}
      <AnimatePresence>
        {(isAddSubModalOpen || isEditSubModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isAddSubModalOpen ? "Add New Subcategory" : "Edit Subcategory"}
                </h3>
                <button onClick={() => { setIsAddSubModalOpen(false); setIsEditSubModalOpen(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={isAddSubModalOpen ? handleAddSubcategory : handleEditSubcategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Parent Category</label>
                  <select
                    value={subParentCategoryId}
                    onChange={(e) => setSubParentCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Subcategory Name</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="e.g. Basmati Rice"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Arabic Name</label>
                  <input
                    type="text"
                    value={subArabicName}
                    onChange={(e) => setSubArabicName(e.target.value)}
                    placeholder="e.g. أرز بسمتي"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-right font-sans"
                    dir="rtl"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsAddSubModalOpen(false); setIsEditSubModalOpen(false); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer shadow-xs"
                  >
                    {isAddSubModalOpen ? "Create Subcategory" : "Save Changes"}
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
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Subcategory?</h3>
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
