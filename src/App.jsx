import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Layout
import MainLayout from "./layouts/MainLayout";

// Import Pages
import Dashboard from "./pages/Dashboard"; // Atau Home.jsx kalau lu pake nama Home
import Catalogue from "./pages/Catalogue";
import Pesanan from "./pages/Pesanan"; // <-- Ini pintu masuk yang baru kita tambahin
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Promo from "./pages/Promo";
import AdminProducts from "./pages/AdminProducts";
import AdminPromos from "./pages/AdminPromos";
import AdminAccounts from "./pages/AdminAccounts";
import AdminOrders from "./pages/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute buat halaman Login (Halaman terpisah tanpa Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* Grup Rute dengan Navbar (MainLayout) */}
        <Route path="/" element={<MainLayout />}>
          {/* Kalau buka localhost:5173 langsung dilempar ke Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="promo" element={<Promo />} />
          <Route path="pesanan" element={<Pesanan />} />{" "}
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/promos" element={<AdminPromos />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          {/* <-- Ini Rute Pesanannya Bos! */}
        </Route>

        {/* Kalau URL nyasar, lari ke sini */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
