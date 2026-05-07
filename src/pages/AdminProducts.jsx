import { useState, useEffect } from "react";
import { PackagePlus, Loader2, Search, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk Form Input
  const [formData, setFormData] = useState({
    name: "",
    category: "Pintu UPVC",
    price: "",
    stock: "",
    image_url: "",
  });

  const categories = ["Pintu UPVC", "Jendela UPVC", "Kaca", "Aksesoris"];

  // Tarik data pas halaman dibuka
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setProducts(data || []);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null, // kalau kosong, biarin null biar pake gambar default
      },
    ]);

    if (error) {
      alert("Gagal nambahin produk!");
      console.error(error);
    } else {
      alert("Produk berhasil ditambahkan!");
      setFormData({
        name: "",
        category: "Pintu UPVC",
        price: "",
        stock: "",
        image_url: "",
      }); // Reset form
      fetchProducts(); // Refresh tabel
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin mau hapus produk ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchProducts();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Kelola Produk
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tambahkan produk baru atau hapus produk lama dari katalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI - Form Tambah Produk */}
        <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
            <PackagePlus className="h-5 w-5 text-zinc-900" />
            <h2 className="text-sm font-bold text-zinc-900">
              Tambah Produk Baru
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Nama Produk
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Cth: Pintu Swing UPVC Sekartama"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="2500000"
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="10"
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                URL Gambar (Opsional)
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
              <p className="text-[10px] text-zinc-400">
                Kosongkan jika ingin pakai gambar otomatis.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan Produk"
              )}
            </button>
          </form>
        </div>

        {/* KANAN - Tabel Daftar Produk */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm h-fit">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">
              Daftar Produk ({products.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Info Produk
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Harga
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Stok
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-8 text-sm text-zinc-400"
                    >
                      Belum ada produk.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {p.category}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        Rp {p.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        <span className="px-2 py-0.5 bg-zinc-100 rounded text-zinc-600">
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
