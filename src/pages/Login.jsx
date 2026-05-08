import { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// IMPORT GAMBAR LOGO LU DI SINI BOS!
// Sesuaikan nama folder dan file png-nya ya
import logoSekartama from "../assets/logo-sekartama.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1. Minta tolong Supabase buat ngecek email & password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      setErrorMsg("Email atau kata sandi salah. Silakan coba lagi.");
      setLoading(false);
      return; // Berhenti di sini kalau gagal
    }

    // 2. LOGIKA BARU: Tarik data KTP/Jabatan dari tabel 'profiles'
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single(); // Ambil 1 baris aja yang id-nya cocok

      if (profileError) {
        console.error("Gagal narik role:", profileError);
        // Kalau terjadi error (misal lupa masukin ke tabel profiles), defaultin jadi sales
        localStorage.setItem("userRole", "sales");
      } else {
        // Simpan jabatan ('admin' atau 'sales') ke memori browser
        localStorage.setItem("userRole", profileData.role);
      }

      // Simpan juga info emailnya biar nanti bisa dipajang di Navbar
      localStorage.setItem("userEmail", authData.user.email);

      // 3. Sukses! Langsung tendang ke halaman Katalog
      navigate("/catalogue");
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      {/* KIRI - Branding (Visual Element) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-zinc-800/50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          {/* LOGO VERSI DEKSTOP DI SINI (Dikasih bantalan putih biar gak tabrakan) */}
          <div className="bg-white/95 p-2.5 rounded-xl shadow-lg border border-white/20">
            <img
              src={logoSekartama}
              alt="Logo Sekartama"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-sm font-bold tracking-[0.15em] text-white uppercase leading-none">
              Sekartama
            </h1>
            <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
              E-Catalogue
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-semibold text-white tracking-tight leading-tight">
            Tingkatkan performa <br />{" "}
            <span className="text-zinc-400">tim penjualan Anda.</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sistem informasi e-catalogue modern yang terintegrasi secara
            real-time. Kelola produk, pantau stok, dan buat pesanan klien dengan
            cepat dan akurat.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <span className="px-3 py-1 rounded-full border border-zinc-700 text-[10px] font-bold text-zinc-300 tracking-widest uppercase">
              V 1.0.0
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase">
              Internal Use Only
            </span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] font-medium text-zinc-500">
          &copy; {new Date().getFullYear()} CV Sekartama Ciater. All rights
          reserved.
        </div>
      </div>

      {/* KANAN - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-10">
          {/* Header Form */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              {/* LOGO VERSI MOBILE DI SINI */}
              <img
                src={logoSekartama}
                alt="Logo Sekartama"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col justify-center text-left">
                <h1 className="text-sm font-bold tracking-[0.15em] text-zinc-900 uppercase leading-none">
                  Sekartama
                </h1>
                <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
                  E-Catalogue
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Masuk ke Akun
            </h2>
            <p className="text-sm text-zinc-500 font-medium">
              Akses dashboard dan katalog produk terbaru.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Box Alert kalau Error */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                Email Akses
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekartama.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-300 text-zinc-900 font-medium shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[11px] font-bold text-zinc-900 hover:text-indigo-600 transition-colors"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-300 text-zinc-900 font-medium shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-900 text-white rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md shadow-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa
                    Data...
                  </>
                ) : (
                  <>
                    Masuk Sekarang <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <p className="text-center text-[12px] text-zinc-500 font-medium">
            Sistem Internal Perusahaan.{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
