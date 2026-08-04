import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { RefreshIcon, XCircleIcon, NoteIcon, TagIcon } from "./icons";

export default function SettingsModal({ isOpen, onClose }) {
  const { settings, settingsLoading, settingsError, fetchSettings } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  // Extract real object if settings is an array
  const data = Array.isArray(settings) ? settings[0] || {} : settings || {};

  // Separate regular key-values from long text documents (e.g. privacyPolicy, terms)
  const metaFields = [];
  const longTextFields = [];

  if (typeof data === "object" && data !== null) {
    Object.entries(data).forEach(([key, val]) => {
      const stringVal = String(val ?? "");
      if (
        typeof val === "string" &&
        (stringVal.length > 100 || stringVal.includes("\n") || key.toLowerCase().includes("policy") || key.toLowerCase().includes("terms"))
      ) {
        longTextFields.push({ key, label: formatKey(key), value: stringVal });
      } else {
        metaFields.push({ key, label: formatKey(key), value: val });
      }
    });
  }

  function formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#131926] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                System Settings & Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Endpoint: <code className="text-amber-500 font-mono font-medium">GET /auth/open/settings</code>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs (if long texts exist) */}
          {longTextFields.length > 0 && (
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0 gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <TagIcon className="w-4 h-4" />
                Overview & Config
              </button>

              {longTextFields.map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => setActiveTab(doc.key)}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === doc.key
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <NoteIcon className="w-4 h-4" />
                  {doc.label}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {settingsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <RefreshIcon className="animate-spin text-amber-500 w-8 h-8" />
                <span className="text-sm font-medium">Fetching settings from server...</span>
              </div>
            ) : settingsError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium">
                {settingsError}
              </div>
            ) : data && Object.keys(data).length > 0 ? (
              <>
                {/* TAB 1: Overview & Metadata Grid */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                      Configuration Parameters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metaFields.map(({ key, label, value }) => (
                        <div
                          key={key}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-1"
                        >
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {label}
                          </span>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-amber-400 break-all">
                            {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Preview Cards for Long Documents */}
                    {longTextFields.length > 0 && (
                      <div className="pt-3 space-y-3">
                        <h3 className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                          Legal & Policies Documents
                        </h3>
                        {longTextFields.map((doc) => (
                          <div
                            key={doc.key}
                            onClick={() => setActiveTab(doc.key)}
                            className="p-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                                <NoteIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                  {doc.label}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {doc.value.replace(/\\n|\n/g, " ")}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-amber-500 group-hover:translate-x-1 transition-transform">
                              View →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2+: Individual Document View */}
                {longTextFields.map(
                  (doc) =>
                    activeTab === doc.key && (
                      <div key={doc.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {doc.label}
                          </h3>
                          <button
                            onClick={() => setActiveTab("overview")}
                            className="text-xs text-amber-500 font-semibold hover:underline"
                          >
                            ← Back to Config
                          </button>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                          {doc.value.replace(/\\n/g, "\n")}
                        </div>
                      </div>
                    )
                )}
              </>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                No system settings data available.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={fetchSettings}
              disabled={settingsLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshIcon className={`w-4 h-4 ${settingsLoading ? "animate-spin text-amber-500" : ""}`} />
              Reload Settings
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
