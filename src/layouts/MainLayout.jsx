import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Package, ShoppingBag, LogOut, Scale } from "lucide-react";
import { useState } from "react";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data jabatan dan email dari memori browser
  const [role] = useState(localStorage.getItem("userRole") || "sales");
  const [email] = useState(
    localStorage.getItem("userEmail") || "admin@sekartama.com",
  );

  const [cartItems, setCartItems] = useState([]);
  const [compareItems, setCompareItems] = useState([]);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Bikin nama tampilan (Misal faza.alega@... jadi Faza Alega)
  const displayName = email
    .split("@")[0]
    .replace(".", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Bikin inisial (Misal Faza Alega jadi FA)
  const getInitials = (name) => {
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Menu standar buat semua orang (Sales & Admin) - Tanpa Icon biar persis screenshot
  const commonMenu = [
    { name: "DASHBOARD", path: "/dashboard" },
    { name: "KATALOG", path: "/catalogue" },
    { name: "PROMO", path: "/promo" },
    { name: "PESANAN", path: "/pesanan" },
  ];

  // Menu EXCLUSIVE cuma buat Admin
  const adminMenu = [
    { name: "KELOLA PRODUK", path: "/admin/products" },
    { name: "KELOLA PROMO", path: "/admin/promos" },
    { name: "KELOLA AKUN", path: "/admin/accounts" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* FLOATING NAVBAR (Kapsul Melayang) */}
      <nav className="fixed top-6 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl z-50">
        <div className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-full h-16 px-4 md:px-6 flex items-center justify-between shadow-sm">
          {/* KIRI - Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-sm">
              <Package className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[11px] font-bold tracking-[0.15em] uppercase leading-none">
                Sekartama
              </h1>
              <p className="text-[8px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
                E-Catalogue
              </p>
            </div>
          </div>

          {/* TENGAH - Menu Navigasi */}
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

            {/* LOGIKA ROLE-BASED: Menu Khusus Admin */}
            {role === "admin" && (
              <>
                <div className="w-1 h-1 bg-zinc-300 rounded-full mx-2"></div>{" "}
                {/* Titik Pemisah */}
                {adminMenu.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider transition-all ${
                      location.pathname === item.path
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* KANAN - Keranjang, Profile, Logout */}
          <div className="flex items-center gap-3">
            {/* Bandingkan & Keranjang Icons */}
            <div className="flex items-center gap-1 mr-2">
              <button
                className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
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
                className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Pesanan / Keranjang"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
            <div className="w-px h-6 bg-zinc-200 hidden sm:block"></div>{" "}
            {/* Garis Pemisah */}
            {/* Profile & Logout */}
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
                className="p-1.5 ml-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Jarak (pt-32) dibesarin biar konten nggak nabrak kapsul navbar */}
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Outlet
          context={{ cartItems, setCartItems, compareItems, setCompareItems }}
        />
      </main>
    </div>
  );
};

export default MainLayout;
