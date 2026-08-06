import { useState } from "react";
import MainLayout from "../components/MainLayout";
import Categories from "./Categories";
import Subcategories from "./Subcategories";
import Products from "./Products";

export default function ProductsAndCategories() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <MainLayout
      headerTitle="Inventory & Catalog"
      headerSubtitle="Manage categories, subcategories, image media, and audit products catalog."
    >
      <div className="space-y-6">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-8 text-sm font-bold">
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-4 transition-all duration-200 relative cursor-pointer ${
                activeTab === "categories"
                  ? "text-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Product Categories
              {activeTab === "categories" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("subcategories")}
              className={`pb-4 transition-all duration-200 relative cursor-pointer ${
                activeTab === "subcategories"
                  ? "text-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Subcategories
              {activeTab === "subcategories" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`pb-4 transition-all duration-200 relative cursor-pointer ${
                activeTab === "products"
                  ? "text-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Products Catalog
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === "categories" && <Categories isTab={true} />}
        {activeTab === "subcategories" && <Subcategories isTab={true} />}
        {activeTab === "products" && <Products isTab={true} />}
      </div>
    </MainLayout>
  );
}
