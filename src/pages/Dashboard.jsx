import { useState, useEffect } from "react";
import {
  Package,
  Users,
  TicketPercent,
  Target,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Box,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  // State buat nampung data asli dari Supabase
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalPromos: 0,
    totalOrders: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // 1. Hitung Total Produk
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // 2. Hitung Total Pengguna
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 3. Hitung Total Promo
      const { count: promoCount } = await supabase
        .from("promos")
        .select("*", { count: "exact", head: true });

      // 4. Ambil 3 Produk Terakhir yang diinput ke database
      const { data: latestProducts } = await supabase
        .from("products")
        .select("name, category, stock")
        .order("id", { ascending: false })
        .limit(3);

      setStats({
        totalProducts: productCount || 0,
        totalUsers: userCount || 0,
        totalPromos: promoCount || 0,
        totalOrders: 0, // Placeholder pesanan
      });

      setRecentProducts(latestProducts || []);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Data mapping untuk UI Kartu
  const statCards = [
    {
      label: "Total Produk Katalog",
      value: stats.totalProducts,
      icon: Package,
      trend: "Data Real-time",
      color: "emerald",
    },
    {
      label: "Pengguna Terdaftar",
      value: stats.totalUsers,
      icon: Users,
      trend: "Data Real-time",
      color: "blue",
    },
    {
      label: "Promo Aktif",
      value: stats.totalPromos,
      icon: TicketPercent,
      trend: "Data Real-time",
      color: "rose",
    },
    {
      label: "Total Pesanan",
      value: stats.totalOrders,
      icon: Target,
      trend: "Segera Hadir",
      color: "amber",
    },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">
          Memuat data Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pantau performa katalog dan ringkasan data sistem Anda hari ini.
        </p>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-5 bg-white border border-zinc-200/80 rounded-xl hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <stat.icon
                  className="h-5 w-5 text-zinc-700"
                  strokeWidth={1.5}
                />
              </div>
              <span
                className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md uppercase ${
                  stat.color === "emerald"
                    ? "text-emerald-600 bg-emerald-50"
                    : stat.color === "blue"
                      ? "text-blue-600 bg-blue-50"
                      : stat.color === "rose"
                        ? "text-rose-600 bg-rose-50"
                        : "text-amber-600 bg-amber-50"
                }`}
              >
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[13px] text-zinc-500 mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Informasi / Target */}
      <div className="relative bg-zinc-900 rounded-xl p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-white tracking-tight mb-1.5">
            Jelajahi E-Catalogue
          </h2>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            Produk UPVC terbaru sudah disinkronisasi ke dalam sistem. Silakan
            tinjau katalog untuk membuat pesanan klien.
          </p>
        </div>
        <Link
          to="/catalogue"
          className="relative z-10 whitespace-nowrap bg-white text-zinc-900 text-sm font-bold px-6 py-3 rounded-xl hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-black/20"
        >
          Lihat Katalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Produk Terpopuler / Terbaru */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Box className="h-4 w-4 text-indigo-600" /> Produk Terbaru
            Ditambahkan
          </h3>
          <Link
            to="/catalogue"
            className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="p-6">
          {recentProducts.length === 0 ? (
            <div className="text-center py-8 text-sm text-zinc-500 font-medium">
              Belum ada produk di database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentProducts.map((product, i) => (
                // ==========================================
                // ✨ DI SINI PERUBAHANNYA BOS! ✨
                // Div diganti jadi Link supaya bisa diklik dan pindah halaman
                // ==========================================
                <Link
                  key={i}
                  to="/catalogue"
                  className="block group p-5 border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      {product.category}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 leading-snug mb-5 pr-4 line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Status Stok
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        product.stock > 5
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : product.stock > 0
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} Unit Ready`
                        : "Stok Habis"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
