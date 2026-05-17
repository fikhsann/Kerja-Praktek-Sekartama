import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Receipt,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
} from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

    // 1. Ambil semua data pesanan dari tabel orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Gagal menarik data pesanan:", ordersError);
      setLoading(false);
      return;
    }

    // 2. Ambil semua data profil dari tabel profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Gagal menarik data profiles:", profilesError);
    }

    // 3. KAWINKAN DATA: Cocokin user_id di orders dengan id di profiles
    const ordersWithSalesInfo = ordersData.map((order) => {
      // Cari profil sales yang ID-nya cocok
      const salesProfile = profilesData?.find(
        (profile) => profile.id === order.user_id,
      );

      // Ambil email atau nama. Kalau di tabel profiles lu gaada email/nama, dia bakal nampilin ID-nya aja (4 digit depan)
      let salesIdentifier = "Admin";
      if (salesProfile) {
        if (salesProfile.email)
          salesIdentifier = salesProfile.email.split("@")[0];
        else if (salesProfile.nama) salesIdentifier = salesProfile.nama;
        else if (salesProfile.full_name)
          salesIdentifier = salesProfile.full_name;
        else salesIdentifier = `Sales (${order.user_id.substring(0, 4)})`;
      }

      return {
        ...order,
        sales_name: salesIdentifier,
      };
    });

    setOrders(ordersWithSalesInfo || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status_pesanan: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status_pesanan: newStatus }
            : order,
        ),
      );
    }
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const filteredOrders = orders.filter((order) =>
    order.nama_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">
          Memuat data transaksi dan verifikasi Sales...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-indigo-600" />
            Kelola Pesanan
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pantau dan kelola semua transaksi dari tim Sales.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200/80 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-zinc-400 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">
                  Klien
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">
                  Sales (Pemesan)
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">
                  Total Tagihan
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    Tidak ada data pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-zinc-600 font-medium">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-900">
                        {order.nama_pelanggan}
                      </span>
                    </td>

                    {/* BAGIAN SALES YANG GABISA DIBOHONGIN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[13px] font-semibold text-zinc-700 capitalize">
                          {order.sales_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900">
                        {formatRp(order.total_harga)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.status_pesanan === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <Clock className="h-3 w-3" /> PENDING
                        </span>
                      )}
                      {order.status_pesanan === "selesai" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3" /> SELESAI
                        </span>
                      )}
                      {order.status_pesanan === "batal" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          <XCircle className="h-3 w-3" /> DIBATALKAN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status_pesanan === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "selesai")
                            }
                            className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[11px] font-bold hover:bg-zinc-800 transition-colors"
                          >
                            SELESAIKAN
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "batal")}
                            className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-[11px] font-bold hover:bg-rose-50 transition-colors"
                          >
                            BATAL
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
