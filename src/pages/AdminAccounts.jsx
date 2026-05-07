import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  User,
  Trash2,
  Search,
  Loader2,
  X,
  UserPlus,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Ambil email admin yang lagi login sekarang biar ga bisa hapus diri sendiri
  const currentUserEmail = localStorage.getItem("userEmail");

  // STATE BARU BUAT MODAL TAMBAH AKUN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    role: "sales",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error) setAccounts(data || []);
    setLoading(false);
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "sales" : "admin";
    const confirmChange = window.confirm(
      `Yakin mau ubah jabatan user ini jadi ${newRole.toUpperCase()}?`,
    );
    if (!confirmChange) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);
    if (!error) fetchAccounts();
  };

  const handleDelete = async (id, email) => {
    const confirmDelete = window.confirm(`Cabut akses untuk email ${email}?`);
    if (!confirmDelete) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) fetchAccounts();
  };

  // FUNGSI BUAT NAMBAH AKUN BARU
  const handleAddAccount = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newAccount.email,
      password: newAccount.password,
    });

    if (authError) {
      alert(`Gagal membuat akun: ${authError.message}`);
    } else {
      if (authData.user) {
        await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            email: newAccount.email,
            role: newAccount.role,
          },
        ]);
      }
      alert(
        "Akun berhasil dibuat! (Catatan: Sesi Anda mungkin ter-logout karena mendaftarkan user baru)",
      );
      setIsModalOpen(false);
      setNewAccount({ email: "", password: "", role: "sales" });
      fetchAccounts();
    }

    setIsSubmitting(false);
  };

  const filteredAccounts = accounts.filter((acc) =>
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Kelola Akun
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Atur hak akses pengguna dan kelola tim sales Anda.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
        >
          <Users className="h-4 w-4" /> Tambah Akun
        </button>
      </div>

      {/* TABEL PENGGUNA */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" /> Daftar Pengguna
            Sistem
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari email pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Email Pengguna
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  ID Registrasi
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Hak Akses (Role)
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mx-auto" />
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-10 text-sm text-zinc-500"
                  >
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  // Cek apakah baris ini adalah akun diri sendiri
                  const isMyself = acc.email === currentUserEmail;

                  return (
                    <tr
                      key={acc.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 relative">
                            <User className="h-4 w-4" />
                            {/* Kasih titik hijau biar tau ini lu */}
                            {isMyself && (
                              <div className="absolute top-0 right-0 h-2 w-2 bg-emerald-500 rounded-full border border-white"></div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900">
                              {acc.email}{" "}
                              {isMyself && (
                                <span className="text-zinc-400 font-normal text-xs">
                                  (Anda)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
                          {acc.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRole(acc.id, acc.role)}
                          disabled={isMyself} // Disable kalau itu diri sendiri
                          title={
                            isMyself
                              ? "Anda tidak bisa mengubah jabatan sendiri"
                              : "Klik untuk ubah jabatan"
                          }
                          className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                            acc.role === "admin"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          } ${!isMyself && "hover:bg-indigo-100 cursor-pointer"} ${isMyself && "opacity-70 cursor-not-allowed"}`}
                        >
                          {acc.role}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Tombol Hapus disembunyiin kalau itu diri sendiri */}
                        {!isMyself ? (
                          <button
                            onClick={() => handleDelete(acc.id, acc.email)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Hapus Akses"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-zinc-400 px-2">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POP-UP TAMBAH AKUN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Daftarkan Pengguna
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@sekartama.com"
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm bg-white border border-zinc-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Kata Sandi Sementara
                </label>
                <input
                  type="text"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm bg-white border border-zinc-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Hak Akses
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNewAccount({ ...newAccount, role: "sales" })
                    }
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${newAccount.role === "sales" ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}
                  >
                    Tim Sales
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewAccount({ ...newAccount, role: "admin" })
                    }
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${newAccount.role === "admin" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Buat Akun"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
