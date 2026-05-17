import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  UserPlus,
  Search,
  Trash2,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  User,
  X,
} from "lucide-react";

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserEmail = localStorage.getItem("userEmail") || "";

  // STATE MODAL HAPUS + ERRORNYA
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(""); // <--- Buat gantiin alert()

  // STATE MODAL TAMBAH AKUN + ERRORNYA
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(""); // <--- Buat gantiin alert()
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
    try {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Gagal narik data akun:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNGSI TAMBAH AKUN BARU
  // ==========================================
  const handleAddAccount = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(""); // Reset error setiap kali tombol diklik

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAccount.email,
        password: newAccount.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            email: newAccount.email,
            role: newAccount.role,
          },
        ]);

        if (profileError) throw profileError;
      }

      // Kalo sukses, tutup aja modalnya otomatis & refresh data
      setAddModalOpen(false);
      setNewAccount({ email: "", password: "", role: "sales" });
      fetchAccounts();
    } catch (error) {
      // TAMPILIN ERROR DI MODAL, BUKAN DI ALERT BROWSER
      setAddError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  // ==========================================
  // FUNGSI HAPUS AKUN
  // ==========================================
  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(""); // Reset error

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteModal.user.id);

      if (error) throw error;

      setAccounts(accounts.filter((acc) => acc.id !== deleteModal.user.id));
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      // TAMPILIN ERROR DI MODAL, BUKAN DI ALERT BROWSER
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    acc.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Kelola Akun
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Atur hak akses pengguna dan kelola tim sales Anda.
          </p>
        </div>
        <button
          onClick={() => {
            setAddError(""); // Bersihin error sisaan sblm buka modal
            setAddModalOpen(true);
          }}
          className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Tambah Akun
        </button>
      </div>

      {/* TABEL */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Daftar Pengguna Sistem
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari email pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200/80 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Email Pengguna
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  ID Registrasi
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Hak Akses (Role)
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isMe = acc.email === currentUserEmail;

                  return (
                    <tr
                      key={acc.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900">
                            {acc.email}
                          </span>
                          {isMe && (
                            <span className="ml-2 text-[10px] font-bold text-zinc-400 uppercase">
                              (Anda)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-500 text-xs font-medium">
                          {acc.id ? `${acc.id.substring(0, 8)}...` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {acc.role === "admin" ? (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md border border-indigo-100">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded-md border border-zinc-200">
                            SALES
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isMe ? (
                          <span className="text-[11px] font-bold text-zinc-400 mr-2">
                            Aman
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setDeleteError(""); // Bersihin error sblm buka
                              setDeleteModal({ isOpen: true, user: acc });
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-block"
                            title="Cabut Akses"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* ========================================== */}
      {/* MODAL TAMBAH AKUN */}
      {/* ========================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => !isAdding && setAddModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" /> Tambah Akun
                Baru
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              {/* PESAN ERROR CUSTOM KALO ADA MASALAH */}
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold rounded-lg flex items-start gap-2 leading-snug">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {addError === "email rate limit exceeded"
                      ? "Limit daftar akun habis (Supabase Anti-Spam). Matikan fitur 'Confirm Email' di pengaturan Supabase Anda."
                      : addError}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Email Pegawai
                </label>
                <input
                  type="email"
                  required
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  placeholder="faza@sekartama.com"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Password Sementara
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  placeholder="Min. 6 karakter"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Hak Akses (Role)
                </label>
                <select
                  value={newAccount.role}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white"
                >
                  <option value="sales">SALES (Pemasaran & Pesanan)</option>
                  <option value="admin">ADMIN (Kelola Sistem)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={isAdding}
                  className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 font-bold text-sm rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2"
                >
                  {isAdding ? (
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

      {/* ========================================== */}
      {/* MODAL HAPUS AKUN */}
      {/* ========================================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() =>
              !isDeleting && setDeleteModal({ isOpen: false, user: null })
            }
          ></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 bg-rose-100 rounded-full flex items-center justify-center mb-4 border-4 border-rose-50">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Cabut Akses Akun?
            </h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              Anda yakin ingin mencabut akses untuk email{" "}
              <span className="font-bold text-zinc-900">
                {deleteModal.user?.email}
              </span>
              ?
            </p>

            {/* ERROR KALO GAGAL HAPUS */}
            {deleteError && (
              <div className="w-full mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold rounded-lg flex items-center gap-2 text-left">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex w-full gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-rose-200"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ya, Cabut Akses"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
