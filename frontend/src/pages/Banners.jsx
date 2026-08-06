import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import apiClient from "../api/client";
import MainLayout from "../components/MainLayout";
import Toast from "../components/Toast";
import {
  BannerIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
  GridIcon,
  TableIcon,
  CloseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ImageIcon,
} from "../components/icons";
import { Skeleton, TableRowsSkeleton } from "../components/Skeleton";

const BONES_LEVELS = ["ONE", "TWO", "THREE", "FOUR"];
const BONES_POSITIONS = ["TOP", "MIDDLE", "BOTTOM", "SIDEBAR", "FOOTER"];

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'grid' | 'table'
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'active'
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    arabicName: "",
    status: true,
    level: "ONE",
    position: "TOP",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Image Upload Modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [targetBannerForImage, setTargetBannerForImage] = useState(null);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  // Delete Confirmation Modal
  const [deleteTargetBanner, setDeleteTargetBanner] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Banners from API
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filterMode === "active" ? "auth/open/banners/active" : "auth/open/banners";
      const response = await apiClient.get(endpoint);
      const data = response.data?.data || response.data || [];
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Banners Error:", err);
      toast.error(err.response?.data?.message || "Could not load banners from API.");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Open Form Modal for Create
  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      name: "",
      arabicName: "",
      status: true,
      level: "ONE",
      position: "TOP",
    });
    setSelectedFile(null);
    setFilePreview(null);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      name: banner.name || "",
      arabicName: banner.arabicName || "",
      status: Boolean(banner.status),
      level: banner.level || "ONE",
      position: banner.position || "TOP",
    });
    setSelectedFile(null);
    setFilePreview(null);
    setIsFormModalOpen(true);
  };

  // Open Image Upload Modal
  const handleOpenImageModal = (banner) => {
    setTargetBannerForImage(banner);
    setUploadFile(null);
    setUploadPreview(null);
    setIsImageModalOpen(true);
  };

  // File Select Handler
  const handleFileChange = (e, setFile, setPrev) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPrev(URL.createObjectURL(file));
    }
  };

  // Handle Submit Form (Create / Update Banner)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a Banner name.");
      return;
    }

    setFormSubmitting(true);
    try {
      let bannerId = formData.id;

      if (editingBanner) {
        // PUT auth/open/banners
        const payload = {
          id: formData.id,
          name: formData.name,
          arabicName: formData.arabicName,
          status: formData.status,
          level: formData.level,
          position: formData.position,
        };
        await apiClient.put("auth/open/banners", payload);
        toast.success("Banner updated successfully!");
      } else {
        // POST auth/open/banners
        const payload = {
          name: formData.name,
          arabicName: formData.arabicName,
          status: formData.status,
          level: formData.level,
          position: formData.position,
        };
        const response = await apiClient.post("auth/open/banners", payload);
        toast.success("Banner created successfully!");

        const newBannerData = response.data?.data || response.data;
        if (newBannerData?.id) {
          bannerId = newBannerData.id;
        }
      }

      // Upload image if file selected during creation/update
      if (selectedFile && bannerId) {
        try {
          const fileData = new FormData();
          fileData.append("file", selectedFile);
          await apiClient.post(`auth/open/banners/image/update/${bannerId}`, fileData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Banner image uploaded!");
        } catch (imgErr) {
          console.error("Image upload error:", imgErr);
          toast.error("Banner created, but image upload failed.");
        }
      }

      setIsFormModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error("Save Banner Error:", err);
      toast.error(err.response?.data?.message || "Failed to save banner.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Upload Image Handler
  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!uploadFile || !targetBannerForImage) {
      toast.error("Please select an image file to upload.");
      return;
    }

    setImageSubmitting(true);
    try {
      const fileData = new FormData();
      fileData.append("file", uploadFile);
      await apiClient.post(`auth/open/banners/image/update/${targetBannerForImage.id}`, fileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Banner image updated successfully!");
      setIsImageModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error("Upload Image Error:", err);
      toast.error(err.response?.data?.message || "Failed to upload banner image.");
    } finally {
      setImageSubmitting(false);
    }
  };

  // Toggle Banner Active Status
  const handleToggleStatus = async (banner) => {
    try {
      const payload = {
        id: banner.id,
        name: banner.name,
        arabicName: banner.arabicName,
        status: !banner.status,
        level: banner.level,
        position: banner.position,
      };
      await apiClient.put("auth/open/banners", payload);
      toast.success(`Banner status set to ${!banner.status ? "Active" : "Inactive"}`);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, status: !b.status } : b))
      );
    } catch (err) {
      console.error("Toggle Status Error:", err);
      toast.error("Could not update banner status.");
    }
  };

  // Delete Banner Handler
  const handleDeleteBanner = async () => {
    if (!deleteTargetBanner) return;
    setDeleting(true);
    try {
      await apiClient.delete(`auth/open/banners/${deleteTargetBanner.id}`);
      toast.success("Banner deleted successfully!");
      setBanners((prev) => prev.filter((b) => b.id !== deleteTargetBanner.id));
      setDeleteTargetBanner(null);
    } catch (err) {
      console.error("Delete Banner Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete banner.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search Banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.arabicName && b.arabicName.includes(searchQuery));
      return matchSearch;
    });
  }, [banners, searchQuery]);

  // Statistics calculation
  const totalCount = banners.length;
  const activeCount = banners.filter((b) => b.status).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <MainLayout onRefresh={fetchBanners} refreshing={loading}>
      <Toast />
      <div className="space-y-6">
        {/* Header Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <BannerIcon className="text-amber-500 w-7 h-7" />
              Banners Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, update, toggle active status, and upload banner promotional images
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Switcher */}
            <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Grid View"
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-amber-500 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Table View"
              >
                <TableIcon />
              </button>
            </div>

            {/* Create Banner Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusIcon />
              <span>Create Banner</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <BannerIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Banners</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? "..." : totalCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Banners</p>
              <p className="text-2xl font-bold text-emerald-500">{loading ? "..." : activeCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <XCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Inactive Banners</p>
              <p className="text-2xl font-bold text-rose-500">{loading ? "..." : inactiveCount}</p>
            </div>
          </div>
        </section>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#131926] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Active / All Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === "all"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All Banners
            </button>
            <button
              onClick={() => setFilterMode("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === "active"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Active Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search banners by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content Area: Grid View vs Table View */}
        {/* Content Area: Grid View vs Table View */}
        {viewMode === "grid" ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] space-y-4 animate-pulse">
                  <Skeleton variant="rounded" width="100%" height={140} className="rounded-xl" />
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              ))}
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] text-slate-500 dark:text-slate-400 space-y-3">
              <BannerIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <p className="font-bold text-slate-700 dark:text-slate-200 text-base">No Banners Found</p>
              <p className="text-xs">Click "Create Banner" to add your first promotional banner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBanners.map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  {/* Banner Image Preview Container */}
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden group">
                    {banner.image || banner.imageUrl ? (
                      <img
                        src={banner.image || banner.imageUrl}
                        alt={banner.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-[11px] font-semibold">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Top Status & Level Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md cursor-pointer transition-all ${
                          banner.status
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        }`}
                      >
                        {banner.status ? "Active" : "Inactive"}
                      </button>
                      {banner.level && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                          Lvl: {banner.level}
                        </span>
                      )}
                    </div>

                    {/* Position Badge */}
                    {banner.position && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-sky-400 border border-sky-500/30 backdrop-blur-md">
                          {banner.position}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                        {banner.name}
                      </h3>
                      {banner.arabicName && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 dir-rtl font-sans">
                          {banner.arabicName}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenImageModal(banner)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UploadIcon />
                        <span>Image</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Edit Banner"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setDeleteTargetBanner(banner)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                        title="Delete Banner"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Data Table View */
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Preview</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Arabic Name</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {loading ? (
                    <TableRowsSkeleton rows={5} columnsCount={7} />
                  ) : filteredBanners.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-semibold">
                        No Banners Found
                      </td>
                    </tr>
                  ) : (
                    filteredBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                            {banner.image || banner.imageUrl ? (
                              <img src={banner.image || banner.imageUrl} alt={banner.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{banner.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-sans">{banner.arabicName || "—"}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {banner.level || "ONE"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                            {banner.position || "TOP"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(banner)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                              banner.status
                                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                            }`}
                          >
                            {banner.status ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-start gap-1.5">
                            <button
                              onClick={() => handleOpenImageModal(banner)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                              title="Upload Image"
                            >
                              <UploadIcon />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(banner)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => setDeleteTargetBanner(banner)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon />
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
      </div>

      {/* CREATE / EDIT BANNER MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => !formSubmitting && setIsFormModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <BannerIcon />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingBanner ? "Edit Banner" : "Create New Banner"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSubmitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Name English */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Banner Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Promotion Banner"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Name Arabic */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Arabic Name (اسم البنر)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. بنر عروض الصيف"
                    value={formData.arabicName}
                    onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dir-rtl font-sans"
                  />
                </div>

                {/* Level & Position Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {BONES_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {BONES_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Active Status</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Enable banner on store app</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Image File Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Banner Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setSelectedFile, setFilePreview)}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
                  />
                  {filePreview && (
                    <div className="mt-2 h-28 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={filePreview} alt="Preview" className="h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    disabled={formSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      <>
                        <RefreshIcon className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingBanner ? "Update Banner" : "Create Banner"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD IMAGE MODAL */}
      <AnimatePresence>
        {isImageModalOpen && targetBannerForImage && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => !imageSubmitting && setIsImageModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <UploadIcon />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upload Banner Image</h2>
                    <p className="text-[11px] text-slate-400 truncate">{targetBannerForImage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  disabled={imageSubmitting}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleUploadImage} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Select Image File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleFileChange(e, setUploadFile, setUploadPreview)}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
                  />
                  {uploadPreview && (
                    <div className="mt-3 h-36 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={uploadPreview} alt="Upload Preview" className="h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    disabled={imageSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={imageSubmitting || !uploadFile}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {imageSubmitting ? (
                      <>
                        <RefreshIcon className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Upload Image</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTargetBanner && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => !deleting && setDeleteTargetBanner(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
                <TrashIcon className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Banner?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-200">"{deleteTargetBanner.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetBanner(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBanner}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <RefreshIcon className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
