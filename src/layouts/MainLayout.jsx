import { useState, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { Package, LogOut, ShoppingBag, Scale, X, Check } from "lucide-react";

const MainLayout = () => {
  // State Keranjang
  const [cartItems, setCartItems] = useState([]);
  const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);

  // State Bandingkan (Compare) - Maksimal 3 barang
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // State Smart Navbar
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinkClass = ({ isActive }) =>
    `text-[12px] font-bold tracking-widest uppercase transition-all px-4 py-2 rounded-full ${
      isActive
        ? "text-zinc-900 bg-zinc-100/80"
        : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50/50"
    }`;

  // Helper hapus item dari perbandingan
  const removeCompare = (id) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
    if (compareItems.length <= 1) setIsCompareOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50/30 font-sans relative">
      {/* NAVBAR */}
      <div
        className={`sticky top-6 z-40 px-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-[150%] opacity-0 pointer-events-none"}`}
      >
        <nav className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-full px-4 h-16 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 pl-1">
            <div className="h-10 w-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-sm">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center hidden sm:flex">
              <h1 className="text-sm font-bold tracking-[0.15em] text-zinc-900 uppercase leading-none">
                Sekartama
              </h1>
              <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
                E-Catalogue
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              DASHBOARD
            </NavLink>
            <NavLink to="/catalogue" className={navLinkClass}>
              KATALOG
            </NavLink>
            <NavLink to="/promo" className={navLinkClass}>
              PROMO
            </NavLink>
            <NavLink to="/pesanan" className={navLinkClass}>
              PESANAN
            </NavLink>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pr-1">
            <Link
              to="/pesanan"
              className="relative p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white box-content shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="h-5 w-[1px] bg-zinc-200 mx-1"></div>
            <div className="flex items-center gap-1">
              <Link
                to="/akun"
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-zinc-100 transition-all group"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Faza+Alega&background=18181b&color=fff&bold=true"
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover group-hover:scale-105 transition-transform shadow-sm"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-zinc-900 leading-none">
                    Faza Alega
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-zinc-400 mt-1">
                    SALES
                  </span>
                </div>
              </Link>
              <button className="p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 mt-4 pb-32">
        {/* Lempar state compareItems ke halaman Katalog */}
        <Outlet
          context={{ cartItems, setCartItems, compareItems, setCompareItems }}
        />
      </main>

      {/* FLOATING COMPARE BAR DI BAWAH LAYAR */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 p-2 rounded-2xl shadow-2xl z-40 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 px-4">
            <Scale className="h-5 w-5 text-zinc-400" />
            <span className="text-sm font-semibold text-white">
              {compareItems.length}/3 Produk Dibandingkan
            </span>
          </div>
          <button
            onClick={() => setIsCompareOpen(true)}
            disabled={compareItems.length < 2}
            className="bg-white text-zinc-900 px-5 py-2 rounded-xl text-sm font-bold tracking-wide hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Bandingkan
          </button>
          <button
            onClick={() => setCompareItems([])}
            className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors pr-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* MODAL TABEL PERBANDINGAN */}
      {/* MODAL TABEL PERBANDINGAN DENGAN AUTO-HIGHLIGHT */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
            {/* Header Modal */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Analisa Perbandingan
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium italic">
                    *Baris hijau menunjukkan spesifikasi unggulan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            {/* Konten Tabel */}
            <div className="p-8 overflow-auto">
              <div className="flex min-w-[800px] gap-8">
                {/* Kolom Kategori Spesifikasi */}
                <div className="w-1/5 flex flex-col justify-end gap-0 text-[11px] font-bold tracking-widest uppercase text-zinc-400 pb-2">
                  <div className="h-40 mb-6"></div> {/* Spacer gambar */}
                  <div className="h-16 flex items-center border-b border-zinc-100">
                    Harga Jual
                  </div>
                  <div className="h-16 flex items-center border-b border-zinc-100">
                    Ketebalan Kaca
                  </div>
                  <div className="h-16 flex items-center border-b border-zinc-100">
                    Tipe Profil
                  </div>
                  <div className="h-16 flex items-center border-b border-zinc-100">
                    Masa Garansi
                  </div>
                </div>

                {/* Kolom Produk */}
                {compareItems.map((item, idx) => {
                  // LOGIC AUTO-HIGHLIGHT: Cari tau siapa yang paling oke
                  const maxWarranty = Math.max(
                    ...compareItems.map((i) => parseInt(i.specs.garansi)),
                  );
                  const isBestWarranty =
                    parseInt(item.specs.garansi) === maxWarranty;

                  const minPrice = Math.min(
                    ...compareItems.map((i) => i.price),
                  );
                  const isBestPrice = item.price === minPrice;

                  return (
                    <div
                      key={item.id}
                      className="flex-1 flex flex-col gap-0 relative group"
                    >
                      <button
                        onClick={() => removeCompare(item.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white shadow-md text-zinc-400 hover:text-rose-500 rounded-full border border-zinc-100 z-10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {/* Card Produk */}
                      <div className="h-40 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center justify-center text-center p-4 mb-6 shadow-sm group-hover:border-indigo-200 transition-colors">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-zinc-900 leading-tight">
                          {item.name}
                        </span>
                      </div>

                      {/* Baris Harga (Highlight yang termurah) */}
                      <div
                        className={`h-16 flex items-center px-4 border-b border-zinc-100 transition-colors ${isBestPrice ? "bg-emerald-50/50 border-emerald-100" : ""}`}
                      >
                        <div>
                          <div className="text-sm font-bold text-zinc-900">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(item.price)}
                          </div>
                          {isBestPrice && (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">
                              Harga Terbaik
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Baris Kaca */}
                      <div className="h-16 flex items-center px-4 border-b border-zinc-100 text-sm font-semibold text-zinc-600">
                        {item.specs.kaca}
                      </div>

                      {/* Baris Profil */}
                      <div className="h-16 flex items-center px-4 border-b border-zinc-100 text-sm font-semibold text-zinc-600">
                        {item.specs.profil}
                      </div>

                      {/* Baris Garansi (Highlight yang terlama) */}
                      <div
                        className={`h-16 flex items-center px-4 border-b border-zinc-100 transition-colors ${isBestWarranty ? "bg-indigo-50/50 border-indigo-100" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${isBestWarranty ? "text-indigo-700" : "text-zinc-600"}`}
                          >
                            {item.specs.garansi}
                          </span>
                          {isBestWarranty && (
                            <Check className="h-4 w-4 text-indigo-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Tutup
              </button>
              <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                Bagikan Hasil (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
