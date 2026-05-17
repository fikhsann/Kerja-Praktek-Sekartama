import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import logoSekartama from "../assets/logo-sekartama.png";

const Login = () => {
  // STATE VIEW: "login" | "forgot" | "update"
  const [view, setView] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State Khusus Lupa Password
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // ✨ LOGIKA SATPAM & DETEKSI LINK RESET ✨
  // ==========================================
  useEffect(() => {
    // 1. Cek apakah user dateng dari link email Supabase (cirinya ada hash type=recovery)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setView("update");
      return; // Stop satpam, biarin dia ganti password
    }

    // 2. Listener Supabase buat deteksi event ganti password
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setView("update");
        }
      },
    );

    // 3. Logika Satpam (Bom Waktu 7 Hari) - Cuma jalan kalau BUKAN lagi reset password
    if (view === "login") {
      const loginTime = localStorage.getItem("loginTimestamp");
      if (loginTime) {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - parseInt(loginTime);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (timeDifference <= sevenDays) {
          navigate("/dashboard", { replace: true });
        } else {
          localStorage.clear();
        }
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, view]);

  // ==========================================
  // 1. FUNGSI LOGIN UTAMA
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        setErrorMsg(
          "Email belum diverifikasi! Silakan cek kotak masuk email Anda.",
        );
      } else {
        setErrorMsg("Email atau kata sandi salah. Silakan coba lagi.");
      }
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Gagal narik role:", profileError);
        localStorage.setItem("userRole", "sales");
      } else {
        localStorage.setItem("userRole", profileData.role);
      }

      localStorage.setItem("userEmail", authData.user.email);
      localStorage.setItem("loginTimestamp", new Date().getTime().toString());

      navigate("/dashboard");
    }
  };

  // ==========================================
  // 2. FUNGSI MINTA LINK RESET KE EMAIL
  // ==========================================
  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/login", // Arahin balik ke /login
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        "Link pemulihan berhasil dikirim! Silakan periksa inbox/spam email Anda.",
      );
      setResetEmail("");
    }
    setLoading(false);
  };

  // ==========================================
  // 3. FUNGSI UPDATE PASSWORD BARU
  // ==========================================
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMsg("Gagal mengubah sandi: " + error.message);
    } else {
      alert(
        "🎉 Password berhasil diperbarui! Silakan login menggunakan password baru Anda.",
      );
      window.location.hash = ""; // Bersihin hash URL
      setView("login");
      setNewPassword("");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      {/* KIRI - Branding Element */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-zinc-800/50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/95 p-2.5 rounded-xl shadow-lg border border-white/20">
            <img
              src={logoSekartama}
              alt="Logo"
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

      {/* KANAN - Forms Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img
              src={logoSekartama}
              alt="Logo"
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

          {/* ========================================== */}
          {/* VIEW: LOGIN NORMAL */}
          {/* ========================================== */}
          {view === "login" && (
            <>
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Masuk ke Akun
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Akses dashboard dan katalog produk terbaru.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
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
                      placeholder="contoh: faza@sekartama.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-400 text-zinc-900 font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[11px] font-bold text-zinc-900 hover:text-indigo-600 transition-colors"
                    >
                      Lupa sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-400 text-zinc-900 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
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
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Memvalidasi...
                      </>
                    ) : (
                      <>
                        Masuk Sekarang <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========================================== */}
          {/* VIEW: LUPA PASSWORD (MINTA LINK) */}
          {/* ========================================== */}
          {view === "forgot" && (
            <>
              <button
                onClick={() => setView("login")}
                className="absolute top-8 left-8 sm:top-12 sm:left-12 p-2 bg-white border border-zinc-200 rounded-full text-zinc-400 hover:text-zinc-900 shadow-sm transition-all hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="space-y-2 text-center lg:text-left mt-8">
                <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <KeyRound className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Lupa Password?
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Masukkan email Anda untuk menerima link pemulihan.
                </p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-5">
                {errorMsg && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-sm">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                    Email Pegawai
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="contoh: faza@sekartama.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-400 text-zinc-900 font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || successMsg}
                    className="w-full h-11 bg-zinc-900 text-white rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md shadow-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
                      </>
                    ) : (
                      "Kirim Link Reset"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========================================== */}
          {/* VIEW: UPDATE PASSWORD BARU */}
          {/* ========================================== */}
          {view === "update" && (
            <>
              <div className="space-y-2 text-center lg:text-left mt-8">
                <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <Lock className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Buat Sandi Baru
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Link berhasil diverifikasi. Silakan masukkan password baru
                  Anda.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {errorMsg && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      minLength="6"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-white border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 transition-all placeholder:text-zinc-400 text-zinc-900 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-emerald-600 text-white rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Password Baru"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-[12px] text-zinc-500 font-medium">
            Sistem Internal Perusahaan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
