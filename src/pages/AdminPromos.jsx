import { useState, useEffect, Fragment } from "react"; // <-- Ingat tambahin Fragment di sini!
import {
  TicketPlus,
  Loader2,
  Trash2,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_percentage: "",
    valid_until: "",
    product_ids: [],
  });

  useEffect(() => {
    fetchPromos();
    fetchProductsForCheckbox();
  }, []);

  const fetchProductsForCheckbox = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name", { ascending: true });
    if (!error) setProductsList(data || []);
  };

  const fetchPromos = async () => {
    const { data, error } = await supabase
      .from("promos")
      .select("*, products(name)")
      .order("id", { ascending: false });
    if (!error) setPromos(data || []);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const selected = prev.product_ids;
      if (selected.includes(id)) {
        return { ...prev, product_ids: selected.filter((item) => item !== id) };
      } else {
        return { ...prev, product_ids: [...selected, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.product_ids.length === 0) {
      alert("Pilih minimal 1 produk buat dipromo-in Bos!");
      return;
    }

    setLoading(true);

    const promoPayloads = formData.product_ids.map((id) => ({
      title: formData.title,
      description: formData.description,
      discount_percentage: parseInt(formData.discount_percentage),
      valid_until: formData.valid_until,
      product_id: parseInt(id),
    }));

    const { error } = await supabase.from("promos").insert(promoPayloads);

    if (error) {
      alert("Gagal nambahin promo: " + error.message);
    } else {
      alert("🎉 Promo berhasil dipasang ke produk-produk pilihan!");
      setFormData({
        title: "",
        description: "",
        discount_percentage: "",
        valid_until: "",
        product_ids: [],
      });
      fetchPromos();
    }
    setLoading(false);
  };

  // Hapus SATU produk aja dari promo
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Keluarkan produk ini dari promo?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (!error) fetchPromos();
  };

  // ✨ FITUR BARU: Hapus SEMUA produk dari kampanye promo ini
  const handleDeleteGroup = async (title) => {
    const confirmDelete = window.confirm(
      `Yakin mau hapus KAMPANYE "${title}" beserta semua produk di dalamnya?`,
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("promos").delete().eq("title", title);
    if (!error) fetchPromos();
  };

  // ==========================================
  // ✨ LOGIKA GROUPING DATA PROMO ✨
  // ==========================================
  const groupedPromos = promos.reduce((acc, promo) => {
    const title = promo.title;
    if (!acc[title]) {
      acc[title] = {
        title: promo.title,
        description: promo.description,
        discount_percentage: promo.discount_percentage,
        valid_until: promo.valid_until,
        items: [],
      };
    }
    acc[title].items.push(promo);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Kelola Promo
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Buat penawaran spesial dan diskon spesifik untuk banyak produk
          sekaligus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI - Form Tambah Promo */}
        <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
            <TicketPlus className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-zinc-900">Buat Promo Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Pilih Produk (Bisa Lebih Dari 1)
              </label>
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1 relative">
                {productsList.length === 0 ? (
                  <p className="text-xs text-zinc-400 p-2">
                    Belum ada produk di database.
                  </p>
                ) : (
                  productsList.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer border border-transparent hover:border-zinc-200 hover:shadow-sm transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.product_ids.includes(p.id)}
                        onChange={() => handleCheckboxChange(p.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 bg-white"
                      />
                      <span className="text-xs font-semibold text-zinc-700">
                        {p.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

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
                placeholder="Cth: Flash Sale Kaca!"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
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
                rows="2"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
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
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
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
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || formData.product_ids.length === 0}
              className="w-full mt-4 bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sebarkan Promo"
              )}
            </button>
          </form>
        </div>

        {/* KANAN - Tabel Daftar Promo (BERKELOMPOK) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm h-fit">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-indigo-600" />
              Promo Aktif ({promos.length} Produk)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Informasi Kampanye
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Produk Terkait
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {Object.keys(groupedPromos).length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-12 text-sm text-zinc-400"
                    >
                      Belum ada promo yang berjalan.
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedPromos).map((group, index) => (
                    <Fragment key={index}>
                      {/* ===================================== */}
                      {/* BARIS SEKAT PEMISAH (HEADER PROMO) */}
                      {/* ===================================== */}
                      <tr className="bg-rose-50/40 border-y border-rose-100">
                        <td colSpan="4" className="px-5 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-sm font-extrabold text-rose-700 uppercase tracking-wide">
                                {group.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded shadow-sm border border-rose-100">
                                  {group.discount_percentage}% OFF
                                </span>
                                <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                  <CalendarDays className="h-3 w-3" />
                                  s/d{" "}
                                  {new Date(
                                    group.valid_until,
                                  ).toLocaleDateString("id-ID")}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteGroup(group.title)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors text-[11px] font-bold shadow-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Hapus Kampanye
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ===================================== */}
                      {/* BARIS ANAK-ANAK PRODUKNYA */}
                      {/* ===================================== */}
                      {group.items.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-zinc-50/50 transition-colors"
                        >
                          <td className="px-5 py-3 pl-8">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-px bg-zinc-300"></div>
                              <span className="text-[11px] font-medium text-zinc-400">
                                Berlaku untuk:
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold text-zinc-700 bg-white px-2.5 py-1 rounded-md border border-zinc-200 shadow-sm">
                              {p.products?.name || "Produk Dihapus"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm font-medium">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded">
                              Aktif
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Keluarkan produk dari promo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
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
