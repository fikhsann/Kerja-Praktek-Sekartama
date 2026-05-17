import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LogOut,
  Scale,
  X,
  CheckCircle2,
  ChevronDown, // <-- Ikon panah baru buat dropdown
} from "lucide-react";
import { useState, useEffect } from "react";

// 1. IMPORT LOGO LU DI SINI
import logoSekartama from "../assets/logo-sekartama.png";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [role] = useState(localStorage.getItem("userRole") || "sales");
  const [email] = useState(
    localStorage.getItem("userEmail") || "admin@sekartama.com",
  );

  const [cartItems, setCartItems] = useState([]);
  const [compareItems, setCompareItems] = useState([]);

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // ==========================================
  // LOGIKA BOM WAKTU (SESI 7 HARI)
  // ==========================================
  useEffect(() => {
    const loginTime = localStorage.getItem("loginTimestamp");

    if (loginTime) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - parseInt(loginTime);

      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (timeDifference > sevenDays) {
        alert(
          "Sesi Anda telah berakhir setelah 7 hari. Silakan login kembali demi keamanan.",
        );
        localStorage.clear();
        navigate("/login");
      }
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);
  // ==========================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const displayName = email
    .split("@")[0]
    .replace(".", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const getInitials = (name) => {
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const commonMenu = [
    { name: "DASHBOARD", path: "/dashboard" },
    { name: "KATALOG", path: "/catalogue" },
    { name: "PROMO", path: "/promo" },
    { name: "PESANAN", path: "/pesanan" },
  ];

  const adminMenu = [
    { name: "KELOLA PRODUK", path: "/admin/products" },
    { name: "KELOLA PROMO", path: "/admin/promos" },
    { name: "KELOLA PESANAN", path: "/admin/orders" },
    { name: "KELOLA AKUN", path: "/admin/accounts" },
  ];

  const removeCompareItem = (id) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
    if (compareItems.length <= 1) setIsCompareOpen(false);
  };

  // Rumus hitung total QTY
  const totalCartQty = cartItems.reduce(
    (total, item) => total + (item.qty || 1),
    0,
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 relative">
      {/* FLOATING NAVBAR */}
      <nav className="fixed top-6 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl z-40">
        <div className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-full h-16 px-4 md:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center px-4 gap-3">
            <img
              src={logoSekartama}
              alt="Logo Sekartama"
              className="h-8 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-[11px] font-bold tracking-[0.15em] uppercase leading-none">
                Sekartama
              </h1>
              <p className="text-[8px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
                E-Catalogue
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {commonMenu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider transition-all ${
                  location.pathname === item.path
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* ========================================= */}
            {/* MENU ADMIN DIUBAH JADI DROPDOWN DI SINI */}
            {/* ========================================= */}
            {role === "admin" && (
              <>
                <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full mx-2"></div>

                <div className="relative group">
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold tracking-wider transition-all ${
                      location.pathname.includes("/admin")
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    ADMIN PANEL
                    <ChevronDown className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Isi Dropdown (Membuka ke bawah saat di-hover) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white border border-zinc-200/80 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 flex flex-col z-50 overflow-hidden">
                    {adminMenu.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`px-5 py-3 text-[11px] font-bold tracking-wider transition-colors text-center ${
                          location.pathname === item.path
                            ? "text-indigo-600 bg-indigo-50/50"
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
            {/* ========================================= */}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setIsCompareOpen(true)}
                className="relative p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Bandingkan"
              >
                <Scale className="h-4 w-4" />
                {compareItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-white">
                    {compareItems.length}
                  </span>
                )}
              </button>

              <Link
                to="/pesanan"
                className="relative p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Pesanan / Keranjang"
              >
                <ShoppingBag className="h-4 w-4" />
                {totalCartQty > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-white">
                    {totalCartQty}
                  </span>
                )}
              </Link>
            </div>

            <div className="w-px h-6 bg-zinc-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {getInitials(displayName)}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-900 leading-none">
                    {displayName}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1.5 leading-none">
                    {role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 ml-1 text-zinc-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Outlet
          context={{ cartItems, setCartItems, compareItems, setCompareItems }}
        />
      </main>

      {/* POP-UP BANDINGKAN */}
      {compareItems.length > 0 && !isCompareOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-full shadow-xl shadow-indigo-500/20 flex items-center gap-3 transition-all active:scale-95 border border-indigo-500"
          >
            <Scale className="h-5 w-5" />
            <span className="text-sm font-bold tracking-wide">
              Bandingkan {compareItems.length} Produk
            </span>
          </button>
        </div>
      )}

      {/* MODAL PERBANDINGAN */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsCompareOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Komparasi Spesifikasi Produk
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                    Membandingkan {compareItems.length} produk UPVC terpilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto overflow-y-auto">
              {compareItems.length === 0 ? (
                <div className="text-center py-12">
                  <Scale className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-zinc-900">
                    Belum ada produk yang dibandingkan
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Silakan pilih produk dari katalog terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="flex gap-6 min-w-max">
                  {compareItems.map((item) => (
                    <div
                      key={item.id}
                      className="w-64 flex-shrink-0 flex flex-col"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-video mb-4 border border-zinc-200/60">
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-4 flex-1">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-900 mt-2 leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 space-y-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                              Harga Beli
                            </p>
                            <p className="text-sm font-bold text-zinc-900">
                              Rp {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                              Ketersediaan Stok
                            </p>
                            <p className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{" "}
                              {item.stock} Unit Ready
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                              Material Utama
                            </p>
                            <p className="text-xs font-semibold text-zinc-700">
                              UPVC Premium Anti-Rayap
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeCompareItem(item.id)}
                        className="mt-6 w-full py-2.5 rounded-xl border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        Hapus dari Komparasi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
