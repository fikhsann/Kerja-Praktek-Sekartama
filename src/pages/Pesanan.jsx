import { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Receipt,
  User,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useOutletContext, Link } from "react-router-dom"; // Import ini Bos!

const Pesanan = () => {
  // Narik data keranjang dari Global State
  const { cartItems, setCartItems } = useOutletContext();
  const [clientName, setClientName] = useState("");

  const updateQty = (id, change) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + change;
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      }),
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const totalHarga = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-zinc-200/80 rounded-xl shadow-sm hover:border-zinc-300 transition-colors"
                >
                  <div className="h-16 w-16 bg-zinc-100 rounded-lg border border-zinc-200 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase">
                      UPVC
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 mt-0.5 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">
                      {formatRp(item.price)}{" "}
                      <span className="text-xs text-zinc-400 font-normal">
                        / unit
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-zinc-100 sm:border-0">
                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-500 hover:text-zinc-900"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-zinc-900 w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-500 hover:text-zinc-900"
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
                      onClick={() => removeItem(item.id)}
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
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 focus:bg-white transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium text-zinc-900">
                  {formatRp(totalHarga)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">PPN (11%)</span>
                <span className="font-medium text-zinc-900">
                  {formatRp(totalHarga * 0.11)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-end mt-6 pt-6 border-t border-zinc-200">
              <span className="text-sm font-semibold text-zinc-900">
                Total Tagihan
              </span>
              <span className="text-xl font-bold text-zinc-900">
                {formatRp(totalHarga + totalHarga * 0.11)}
              </span>
            </div>
            <button
              disabled={cartItems.length === 0 || !clientName}
              className="w-full mt-8 bg-zinc-900 text-white font-semibold text-sm py-3 px-4 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors flex items-center justify-center gap-2 group"
            >
              Buat Pesanan Sekarang
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {!clientName && cartItems.length > 0 && (
              <p className="text-[11px] text-rose-500 text-center mt-3 font-medium">
                *Mohon isi Nama Klien terlebih dahulu
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pesanan;
