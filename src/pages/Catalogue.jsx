import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Plus, Scale } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Catalogue = () => {
  const { cartItems, setCartItems, compareItems, setCompareItems } =
    useOutletContext();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [products, setProducts] = useState([]);

  // Kategori dinamis dari DB
  const dynamicCategories = [
    "Semua",
    ...new Set(products.map((product) => product.category)),
  ].filter(Boolean);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error narik data produk:", error);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();

    const productSubscription = supabase
      .channel("realtime-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProducts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) =>
              prev.filter((item) => item.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      activeCategory === "Semua" || product.category === activeCategory;
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (product) => {
    const cart_id = `${product.id}-normal`; // KTP Unik Normal

    setCartItems((prevItems) => {
      const isExist = prevItems.find((item) => item.cart_id === cart_id);
      const totalQtyAllTypes = prevItems
        .filter((ci) => ci.id === product.id)
        .reduce((sum, ci) => sum + ci.qty, 0);

      if (isExist) {
        if (totalQtyAllTypes >= product.stock) return prevItems;
        return prevItems.map((item) =>
          item.cart_id === cart_id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      if (totalQtyAllTypes >= product.stock) return prevItems;

      return [
        ...prevItems,
        { ...product, cart_id: cart_id, type: "Harga Normal", qty: 1 },
      ];
    });
  };

  const toggleCompare = (product) => {
    setCompareItems((prev) => {
      const isExist = prev.find((item) => item.id === product.id);
      if (isExist) return prev.filter((item) => item.id !== product.id);
      if (prev.length >= 3) {
        alert("Maksimal bandingkan 3 produk!");
        return prev;
      }
      return [...prev, product];
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Katalog Produk
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Telusuri dan tambahkan produk ke pesanan klien.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </h3>
              <button
                onClick={() => {
                  setActiveCategory("Semua");
                  setSearchQuery("");
                }}
                className="text-[11px] font-medium text-zinc-400 hover:text-zinc-900"
              >
                Reset
              </button>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Kategori Produk
              </p>

              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${activeCategory === cat ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200/80 rounded-lg focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-400 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.length === 0 ? (
              <div className="col-span-full py-10 text-center text-zinc-500 text-sm">
                Memuat produk dari database...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-10 text-center text-zinc-500 text-sm">
                Produk tidak ditemukan.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isCompared = compareItems.some(
                  (item) => item.id === product.id,
                );

                // LOGIKA FALLBACK GAMBAR DIPERBAIKI BIAR BEDA-BEDA
                const getFallbackImage = (cat) => {
                  if (!cat)
                    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";
                  const lowerCat = cat.toLowerCase();
                  if (lowerCat.includes("pintu"))
                    return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80";
                  if (lowerCat.includes("jendela"))
                    return "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80";
                  if (lowerCat.includes("kaca"))
                    return "https://images.unsplash.com/photo-1582298681283-8a3070433ba9?w=600&q=80";
                  return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";
                };

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
                  >
                    <div className="aspect-[4/3] bg-zinc-100/50 border-b border-zinc-100 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={
                          product.image_url ||
                          getFallbackImage(product.category)
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                          {product.category}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md">
                          Stok: {product.stock}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 mb-4 leading-snug line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-900">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(product.price)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCompare(product)}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all border ${isCompared ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"}`}
                            title="Bandingkan Produk"
                          >
                            <Scale className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${product.stock <= 0 ? "bg-zinc-300 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"}`}
                            title={
                              product.stock <= 0
                                ? "Stok Habis"
                                : "Tambah ke Pesanan"
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
