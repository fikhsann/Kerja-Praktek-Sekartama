import { useState, useEffect } from "react";
import {
  TicketPlus,
  Loader2,
  Search,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk Form Input
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_percentage: "",
    valid_until: "",
  });

  // Tarik data pas halaman dibuka
  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setPromos(data || []);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("promos").insert([
      {
        title: formData.title,
        description: formData.description,
        discount_percentage: parseInt(formData.discount_percentage),
        valid_until: formData.valid_until,
      },
    ]);

    if (error) {
      alert("Gagal nambahin promo!");
      console.error(error);
    } else {
      alert("Promo berhasil ditambahkan!");
      setFormData({
        title: "",
        description: "",
        discount_percentage: "",
        valid_until: "",
      }); // Reset form
      fetchPromos(); // Refresh tabel
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin mau hapus promo ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (!error) fetchPromos();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Kelola Promo
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Buat penawaran spesial dan diskon untuk menarik klien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI - Form Tambah Promo */}
        <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
            <TicketPlus className="h-5 w-5 text-zinc-900" />
            <h2 className="text-sm font-bold text-zinc-900">Buat Promo Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Judul Promo
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Cth: Diskon Akhir Tahun"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Deskripsi Singkat
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Syarat dan ketentuan promo..."
                rows="3"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Diskon (%)
                </label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  required
                  placeholder="15"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Berlaku Sampai
                </label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sebarkan Promo"
              )}
            </button>
          </form>
        </div>

        {/* KANAN - Tabel Daftar Promo */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm h-fit">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">
              Promo Aktif ({promos.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari promo..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Detail Promo
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Diskon
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Validitas
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {promos.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-8 text-sm text-zinc-400"
                    >
                      Belum ada promo yang berjalan.
                    </td>
                  </tr>
                ) : (
                  promos.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">
                          {p.description}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md font-bold">
                          {p.discount_percentage}% OFF
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-medium">
                            {new Date(p.valid_until).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                        </div>
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

export default AdminPromos;
