import { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Receipt,
  User,
  ArrowRight,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Pesanan = () => {
  const { cartItems, setCartItems } = useOutletContext();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", message: "" });

  // Pake cart_id biar gak salah edit/hapus
  const updateQty = (cart_id, id_produk, change) => {
    setCartItems((items) => {
      const targetItem = items.find((i) => i.cart_id === cart_id);
      if (!targetItem) return items;

      // Hitung QTY LINTAS PROMO biar gak jebol stok asli
      const totalQty = items
        .filter((i) => i.id === id_produk)
        .reduce((sum, i) => sum + i.qty, 0);

      return items.map((item) => {
        if (item.cart_id === cart_id) {
          if (change > 0 && totalQty >= item.stock) {
            alert(
              `Maksimal total stok untuk ${item.name} adalah ${item.stock} unit!`,
            );
            return item;
          }
          const newQty = item.qty + change;
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    });
  };

  const removeItem = (cart_id) => {
    setCartItems((items) => items.filter((item) => item.cart_id !== cart_id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );
  const ppn = subtotal * 0.11;
  const totalTagihan = subtotal + ppn;

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const handleCheckout = async () => {
    if (!clientName) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Nama klien wajib diisi sebelum membuat pesanan!",
      });
      return;
    }
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user)
        throw new Error("Sesi login tidak valid. Silakan login ulang.");
      const currentUserId = authData.user.id;

      // 1. Insert Orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            nama_pelanggan: clientName,
            total_harga: totalTagihan,
            status_pesanan: "pending",
            user_id: currentUserId,
          },
        ])
        .select()
        .single();
      if (orderError) throw orderError;

      // 2. Insert Order Items (Pake item.price karna udah bawaan diskon / normal)
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        qty: item.qty,
        harga_satuan: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Update Stok Secara CERDAS (Dikelompokkin Dulu!)
      const stockToDeduct = {};
      cartItems.forEach((item) => {
        if (!stockToDeduct[item.id]) {
          stockToDeduct[item.id] = { stockAsli: item.stock, totalDeduct: 0 };
        }
        stockToDeduct[item.id].totalDeduct += item.qty;
      });

      for (const [prodId, data] of Object.entries(stockToDeduct)) {
        const remainingStock = data.stockAsli - data.totalDeduct;
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: remainingStock })
          .eq("id", prodId);
        if (stockError) console.error("Gagal update stok:", stockError);
      }

      setCartItems([]);
      setClientName("");
      setProjectName("");
      setModal({
        isOpen: true,
        type: "success",
        message:
          "Pesanan berhasil dibuat! Stok produk telah di-update otomatis.",
      });
    } catch (error) {
      setModal({
        isOpen: true,
        type: "error",
        message: `Terjadi kesalahan sistem: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (modal.type === "success") navigate("/catalogue");
    setModal({ isOpen: false, type: "", message: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Detail Pesanan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tinjau ulang produk dan buat invoice untuk klien.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:flex-1 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-200 pb-3">
            Daftar Produk ({cartItems.length})
          </h3>

          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-zinc-200/80 rounded-xl shadow-sm hover:border-zinc-300 transition-colors"
                >
                  <div className="h-16 w-16 bg-zinc-100 rounded-lg border border-zinc-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        item.image_url ||
                        `https://source.unsplash.com/100x100/?upvc,${item.category}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 mt-0.5 leading-snug flex items-center flex-wrap gap-2">
                      {item.name}
                      {item.type && item.type !== "Normal" && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
                          <Tag className="h-2.5 w-2.5" /> {item.type}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">
                      {formatRp(item.price)}{" "}
                      <span className="text-xs text-zinc-400 font-normal">
                        / unit
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:pt-0 border-t border-zinc-100 sm:border-0 pt-4">
                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.cart_id, item.id, -1)}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-500"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-zinc-900 w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.cart_id, item.id, 1)}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-500"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right hidden sm:block w-28">
                      <p className="text-sm font-semibold text-zinc-900">
                        {formatRp(item.price * item.qty)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.cart_id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <Receipt className="h-8 w-8 mx-auto text-zinc-300 mb-3" />
              <p className="text-sm font-medium text-zinc-500 mb-4">
                Belum ada produk di pesanan ini.
              </p>
              <Link
                to="/catalogue"
                className="text-sm font-medium text-zinc-900 bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Kembali ke Katalog
              </Link>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-semibold text-zinc-900 mb-5 pb-4 border-b border-zinc-100 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-zinc-400" /> Ringkasan Order
            </h3>
            <div className="space-y-3 mb-6">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Informasi Klien
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Nama Klien / Perusahaan..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 focus:bg-white transition-all placeholder:text-zinc-400"
                />
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Nama Proyek (Opsional)"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 focus:bg-white transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium text-zinc-900">
                  {formatRp(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">PPN (11%)</span>
                <span className="font-medium text-zinc-900">
                  {formatRp(ppn)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-end mt-6 pt-6 border-t border-zinc-200">
              <span className="text-sm font-semibold text-zinc-900">
                Total Tagihan
              </span>
              <span className="text-xl font-bold text-zinc-900">
                {formatRp(totalTagihan)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || !clientName || loading}
              className="w-full mt-8 bg-zinc-900 text-white font-semibold text-sm py-3 px-4 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  Buat Pesanan Cepat{" "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            {!clientName && cartItems.length > 0 && (
              <p className="text-[11px] text-rose-500 text-center mt-3 font-medium">
                *Mohon isi Nama Klien terlebih dahulu
              </p>
            )}
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={closeModal}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 border-4 ${modal.type === "success" ? "bg-emerald-100 border-emerald-50 text-emerald-600" : "bg-rose-100 border-rose-50 text-rose-600"}`}
            >
              {modal.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              {modal.type === "success"
                ? "Pemesanan Berhasil!"
                : "Pemesanan Gagal"}
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              {modal.message}
            </p>
            <button
              onClick={closeModal}
              className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-sm ${modal.type === "success" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-zinc-900 hover:bg-zinc-800"}`}
            >
              {modal.type === "success"
                ? "Tutup & Kembali ke Katalog"
                : "Tutup Peringatan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pesanan;
