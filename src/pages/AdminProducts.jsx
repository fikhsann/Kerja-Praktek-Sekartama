import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Package, Search, Trash2, Loader2 } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form (Sesuai UI Kiri)
  const [formData, setFormData] = useState({
    name: "",
    category: "Pintu UPVC",
    price: "",
    stock: "",
    image_url: "",
  });

  // State Khusus Gambar
  const [imageFile, setImageFile] = useState(null);

  // State Khusus Kategori Dinamis
  const [availableCategories, setAvailableCategories] = useState([
    "Pintu UPVC",
    "Jendela UPVC",
    "Kaca",
    "Aksesoris",
  ]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setProducts(data);

      // Ambil semua kategori yang ada di database, gabungin sama kategori default
      const uniqueCats = [...new Set(data.map((p) => p.category))].filter(
        Boolean,
      );
      const mergedCats = [
        ...new Set([
          "Pintu UPVC",
          "Jendela UPVC",
          "Kaca",
          "Aksesoris",
          ...uniqueCats,
        ]),
      ];
      setAvailableCategories(mergedCats);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Ditolak! Hanya boleh upload foto (JPG, PNG, WEBP).");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto terlalu besar! Maksimal 2MB saja.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const uploadToSupabase = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        finalImageUrl = await uploadToSupabase(imageFile);
      }

      // Pastikan kategori yang dikirim sesuai dengan inputan (custom atau dropdown)
      const finalCategory = isCustomCategory
        ? customCategoryText
        : formData.category;

      const productPayload = {
        name: formData.name,
        category: finalCategory,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: finalImageUrl,
      };

      const { error } = await supabase
        .from("products")
        .insert([productPayload]);

      if (error) throw error;

      alert("Produk berhasil ditambahkan!");

      // Bersihin form setelah sukses
      setFormData({
        name: "",
        category: "Pintu UPVC",
        price: "",
        stock: "",
        image_url: "",
      });
      setImageFile(null);
      document.getElementById("file-upload").value = "";

      // Reset State Kategori Custom
      setIsCustomCategory(false);
      setCustomCategoryText("");

      fetchProducts();
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) alert("Gagal menghapus: " + error.message);
      else fetchProducts();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ========================================= */}
        {/* KIRI - FORM TAMBAH PRODUK */}
        {/* ========================================= */}
        <div className="w-full lg:w-[360px] bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex-shrink-0">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <Package className="h-4 w-4" /> Tambah Produk Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Nama Produk
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Cth: Pintu Swing UPVC Sekartama"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-300"
              />
            </div>

            {/* AREA KATEGORI DINAMIS */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Kategori
              </label>
              <select
                value={isCustomCategory ? "tambah_baru" : formData.category}
                onChange={(e) => {
                  if (e.target.value === "tambah_baru") {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option
                  value="tambah_baru"
                  className="font-bold text-indigo-600"
                >
                  + Tambah Kategori Baru
                </option>
              </select>

              {/* MUNCUL KALAU OPSI TAMBAH BARU DIKLIK */}
              {isCustomCategory && (
                <input
                  type="text"
                  required
                  autoFocus
                  value={customCategoryText}
                  onChange={(e) => setCustomCategoryText(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="w-full px-3 py-2 mt-2 text-sm bg-indigo-50/50 border border-indigo-200 rounded-lg outline-none focus:border-indigo-400 transition-all placeholder:text-indigo-300 text-indigo-900"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="2500000"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Stok
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="10"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Gambar Produk (Pilih Salah Satu)
              </label>

              <div className="relative mb-2">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 border border-zinc-200 rounded-lg bg-zinc-50/50"
                />
              </div>

              <input
                type="text"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="Atau URL (https://...)"
                disabled={!!imageFile}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-400"
              />
              <p className="text-[9px] text-zinc-400 mt-1.5">
                Kosongkan jika ingin pakai gambar otomatis. (Max File: 2MB).
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 text-white font-bold text-sm py-2.5 rounded-lg mt-4 hover:bg-zinc-800 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Produk"
              )}
            </button>
          </form>
        </div>

        {/* ========================================= */}
        {/* KANAN - DAFTAR PRODUK */}
        {/* ========================================= */}
        <div className="flex-1 w-full bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-sm font-bold text-zinc-900">
              Daftar Produk ({products.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-300"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  <th className="pb-3 px-2">Info Produk</th>
                  <th className="pb-3 px-2">Harga</th>
                  <th className="pb-3 px-2 text-center">Stok</th>
                  <th className="pb-3 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-zinc-500">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-2">
                        <p className="text-xs font-bold text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {p.category}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-xs font-bold text-zinc-900">
                        Rp {p.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2 text-xs font-semibold text-zinc-600 text-center">
                        {p.stock}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-zinc-300 hover:text-rose-600 transition-colors inline-block"
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
