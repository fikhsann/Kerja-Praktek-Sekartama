import {
  Package,
  Users,
  TrendingUp,
  Target,
  ArrowRight,
  Eye,
  ArrowUpRight,
} from "lucide-react";

const Dashboard = () => {
  // --- DUMMY DATA TANPA URUSAN ORDER/PESANAN ---
  const stats = [
    {
      label: "Total Produk Katalog",
      value: "1,247",
      icon: Package,
      trend: "+12%",
    },
    { label: "Klien Prospek", value: "87", icon: Users, trend: "+5%" },
    {
      label: "Konversi Penjualan",
      value: "18.5%",
      icon: TrendingUp,
      trend: "+2.4%",
    },
    { label: "Pencapaian Target", value: "75%", icon: Target, trend: "+15%" },
  ];

  const topProducts = [
    {
      name: "UPVC Jendela Casement Premium",
      category: "Jendela",
      views: "1,240x dilihat",
      stock: "Tersedia",
    },
    {
      name: "UPVC Pintu Sliding Kaca Tempered",
      category: "Pintu",
      views: "985x dilihat",
      stock: "Tersedia",
    },
    {
      name: "UPVC Kaca Mati (Fixed Window)",
      category: "Kaca",
      views: "850x dilihat",
      stock: "Stok Menipis",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pantau performa katalog dan tren produk UPVC hari ini.
        </p>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
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
                className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${stat.trend.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}
              >
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[13px] text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Informasi / Target */}
      <div className="relative bg-zinc-900 rounded-xl p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-white tracking-tight mb-1.5">
            Katalog Baru Telah Rilis
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            Produk UPVC seri terbaru sudah ditambahkan ke dalam e-catalogue.
            Silakan tawarkan ke klien prioritas.
          </p>
        </div>
        <button className="relative z-10 whitespace-nowrap bg-white text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-2">
          Lihat Katalog
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Produk Terpopuler (Pengganti Tabel Pesanan) */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-white">
          <h3 className="text-base font-semibold text-zinc-900">
            Produk Paling Banyak Diminati
          </h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Analisis Lengkap
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topProducts.map((product, i) => (
              <div
                key={i}
                className="group p-4 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                    {product.category}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <h4 className="text-sm font-medium text-zinc-900 leading-snug mb-4 pr-4">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-[12px] font-medium">
                      {product.views}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-1 rounded-md ${product.stock === "Tersedia" ? "bg-zinc-100 text-zinc-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
