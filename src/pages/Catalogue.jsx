import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Scale,
  X,
  Eye,
  CheckCircle2,
  SearchX, // ✨ IMPORT ICON BARU BUAT KOTAK KOSONG
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Catalogue = () => {
  const { cartItems, setCartItems, compareItems, setCompareItems } =
    useOutletContext();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
            setSelectedProduct((prev) =>
              prev && prev.id === payload.new.id ? payload.new : prev,
            );
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) =>
              prev.filter((item) => item.id !== payload.old.id),
            );
            setSelectedProduct((prev) =>
              prev && prev.id === payload.old.id ? null : prev,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
    };
  }, []);

  // ✨ FUNGSI SIHIR BUAT NGASIH TITIK RIBUAN ✨
  const formatInputHarga = (angka) => {
    if (!angka) return "";
    const numberString = angka.toString().replace(/\D/g, ""); // Buang huruf/karakter aneh
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Kasih titik tiap 3 digit
  };

  const handlePriceChange = (e, setter) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Simpen angka aslinya aja ke state
    setter(rawValue);
  };

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      activeCategory === "Semua" || product.category === activeCategory;
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const price = product.price;
    const isMinValid = minPrice === "" || price >= parseInt(minPrice);
    const isMaxValid = maxPrice === "" || price <= parseInt(maxPrice);

    return matchCategory && matchSearch && isMinValid && isMaxValid;
  });

  const handleAddToCart = (product) => {
    const cart_id = `${product.id}-normal`;

    setCartItems((prevItems) => {
      const isExist = prevItems.find((item) => item.cart_id === cart_id);

      const actualTotalQtyAllTypes = prevItems
        .filter((ci) => ci.id === product.id)
        .reduce((sum, ci) => sum + ci.qty, 0);

      if (isExist) {
        if (actualTotalQtyAllTypes >= product.stock) return prevItems;
        return prevItems.map((item) =>
          item.cart_id === cart_id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      if (actualTotalQtyAllTypes >= product.stock) return prevItems;

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
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
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-[11px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
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

            <div className="space-y-3 pt-5 border-t border-zinc-100 mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Rentang Harga
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Min (Rp)"
                  value={formatInputHarga(minPrice)}
                  onChange={(e) => handlePriceChange(e, setMinPrice)}
                  className="w-full px-2.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-zinc-400"
                />
                <span className="text-zinc-400 text-xs">-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max (Rp)"
                  value={formatInputHarga(maxPrice)}
                  onChange={(e) => handlePriceChange(e, setMaxPrice)}
                  className="w-full px-2.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-zinc-400"
                />
              </div>
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
              /* ✨ TAMPILAN KOSONG BARU YANG LEBIH CAKEP ✨ */
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
                  <SearchX className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Waduh, Produk Nggak Ketemu!
                </h3>
                <p className="text-[12px] text-zinc-500 mt-1.5 max-w-sm">
                  {minPrice &&
                  maxPrice &&
                  parseInt(minPrice) > parseInt(maxPrice)
                    ? "Harga Max lebih kecil dari Min nih Bos. Coba benerin rentang harganya ya!"
                    : "Coba ubah kata kunci pencarian, ganti kategori, atau perlebar rentang harga Anda."}
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("Semua");
                    setSearchQuery("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="mt-5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isCompared = compareItems.some(
                  (item) => item.id === product.id,
                );

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
                  >
                    <div
                      onClick={() => setSelectedProduct(product)}
                      className="aspect-[4/3] bg-zinc-100/50 border-b border-zinc-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
                    >
                      <img
                        src={
                          product.image_url ||
                          getFallbackImage(product.category)
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white text-zinc-900 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <Eye className="h-3.5 w-3.5" /> Lihat Detail
                        </span>
                      </div>
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

                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="text-sm font-semibold text-zinc-900 mb-4 leading-snug line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
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

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedProduct(null)}
          ></div>

          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 max-h-[90vh]">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 h-8 w-8 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white shadow-sm transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-zinc-100 relative">
              <img
                src={
                  selectedProduct.image_url ||
                  getFallbackImage(selectedProduct.category)
                }
                alt={selectedProduct.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col bg-white overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {selectedProduct.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${selectedProduct.stock > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} Tersedia`
                      : "Habis"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight mb-2">
                  {selectedProduct.name}
                </h2>

                <p className="text-2xl font-black text-zinc-900 mb-6">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(selectedProduct.price)}
                </p>

                <div className="space-y-5 text-sm text-zinc-600 border-t border-zinc-100 pt-6">
                  <p className="leading-relaxed">
                    Produk kualitas premium dengan standar pabrikasi tinggi.
                    Material kuat, tahan lama, dan dirancang khusus untuk
                    memenuhi kebutuhan proyek konstruksi dan perumahan modern.
                  </p>

                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 shadow-sm">
                    <h4 className="text-[11px] font-bold uppercase text-zinc-900 mb-3 tracking-wider flex items-center gap-2">
                      Spesifikasi Teknis
                    </h4>
                    <ul className="space-y-2">
                      {selectedProduct.spesifikasi_teknis ? (
                        selectedProduct.spesifikasi_teknis
                          .split(",")
                          .map((item, idx) => {
                            const [label, value] = item.split(":");
                            return (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-xs pb-2 border-b border-zinc-100/80 last:border-0 last:pb-0"
                              >
                                <span className="text-zinc-500 font-medium">
                                  {label?.trim()}
                                </span>
                                <span className="text-zinc-900 font-bold text-right">
                                  {value?.trim()}
                                </span>
                              </li>
                            );
                          })
                      ) : (
                        <li className="text-xs text-zinc-400 italic">
                          Data spesifikasi teknis belum tersedia.
                        </li>
                      )}
                    </ul>
                  </div>

                  <ul className="space-y-2.5 mt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        Material anti-rayap dan tahan perubahan cuaca ekstrim.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Desain minimalis presisi tinggi.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Garansi distributor resmi Sekartama.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                  }}
                  disabled={selectedProduct.stock <= 0}
                  className="flex-1 h-12 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-sm shadow-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  {selectedProduct.stock <= 0
                    ? "Stok Habis"
                    : "Tambah ke Pesanan"}
                </button>

                <button
                  onClick={() => {
                    toggleCompare(selectedProduct);
                  }}
                  className={`h-12 px-5 flex items-center justify-center rounded-xl transition-all border font-bold text-sm ${compareItems.some((item) => item.id === selectedProduct.id) ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"}`}
                  title="Bandingkan Produk"
                >
                  <Scale className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogue;
