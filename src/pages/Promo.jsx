import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Percent, Loader2, TicketX, Scale } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Promo = () => {
  const { cartItems, setCartItems, compareItems, setCompareItems } =
    useOutletContext();
  const [groupedPromos, setGroupedPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromoData();
  }, []);

  const fetchPromoData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const { data: promos, error } = await supabase
      .from("promos")
      .select("*, products(*)")
      .gte("valid_until", today)
      .order("id", { ascending: false });

    if (!error && promos) {
      const activePromos = promos.filter((p) => p.products != null);
      const groups = activePromos.reduce((acc, promo) => {
        const title = promo.title;
        if (!acc[title]) {
          acc[title] = {
            title: promo.title,
            description: promo.description,
            valid_until: promo.valid_until,
            products: [],
          };
        }

        const product = promo.products;
        const discountAmount =
          (product.price * promo.discount_percentage) / 100;

        acc[title].products.push({
          ...product,
          promo_id: promo.id,
          originalPrice: product.price,
          price: product.price - discountAmount,
          discount: `-${promo.discount_percentage}%`,
        });

        return acc;
      }, {});

      setGroupedPromos(Object.values(groups));
    }
    setLoading(false);
  };

  // ==========================================
  // ✨ LOGIKA CART UNIK DENGAN CART_ID ✨
  // ==========================================
  const handleAddToCart = (product) => {
    const cart_id = `${product.id}-promo-${product.promo_id}`; // KTP Unik

    setCartItems((prevItems) => {
      // Hitung total Kaca Mati yang udah ada di cart (baik normal maupun promo lain)
      const totalQtyAllTypes = prevItems
        .filter((ci) => ci.id === product.id)
        .reduce((sum, ci) => sum + ci.qty, 0);
      const isExist = prevItems.find((item) => item.cart_id === cart_id);

      if (isExist) {
        if (totalQtyAllTypes >= product.stock) return prevItems;
        return prevItems.map((item) =>
          item.cart_id === cart_id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      if (totalQtyAllTypes >= product.stock) return prevItems;

      if (product.stock > 0) {
        // Masukin ke cart dengan harga yang UDAH DIDISKON dan type PROMO
        return [
          ...prevItems,
          {
            ...product,
            cart_id: cart_id,
            type: `Promo ${product.discount}`,
            qty: 1,
          },
        ];
      }
      return prevItems;
    });
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const getFallbackImage = (cat) => {
    if (!cat)
      return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("pintu"))
      return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80";
    if (lowerCat.includes("jendela"))
      return "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80";
    if (lowerCat.includes("kaca"))
      return "https://images.unsplash.com/photo-1582298681283-8a3070433ba9?w=600&q=80";
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">
          Memuat semua katalog promo...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            E-Catalogue Promo Center
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-xl">
            Semua penawaran eksklusif dari berbagai kampanye promo dikumpulkan
            di sini. Klaim sekarang!
          </p>
        </div>
      </div>

      {groupedPromos.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center">
          <TicketX className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-base font-bold text-zinc-900">
            Yah, Belum Ada Promo Aktif Saat Ini
          </p>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Silakan cek kembali nanti atau hubungi Admin untuk menanyakan promo
            terbaru.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedPromos.map((group, index) => (
            <div key={index} className="space-y-6">
              <div className="border-b border-zinc-200/60 pb-4">
                <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2.5">
                  <div className="p-1 bg-rose-100 text-rose-600 rounded">
                    <Percent className="h-4 w-4" strokeWidth={3} />
                  </div>
                  {group.title}
                </h2>
                <p className="text-[13px] text-zinc-500 mt-1.5 font-medium">
                  {group.description}{" "}
                  <span className="text-zinc-300 mx-1">•</span>{" "}
                  <span className="text-rose-500 font-semibold">
                    Berlaku s/d{" "}
                    {new Date(group.valid_until).toLocaleDateString("id-ID")}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {group.products.map((item) => {
                  const cart_id = `${item.id}-promo-${item.promo_id}`;
                  // Cari berapa total stok Kaca Mati yg udah dimasukin
                  const totalQtyInCart = cartItems
                    .filter((ci) => ci.id === item.id)
                    .reduce((sum, ci) => sum + ci.qty, 0);

                  // Cari berapa yg dimasukin KHUSUS DARI PROMO INI aja
                  const cartItemThisPromo = cartItems.find(
                    (ci) => ci.cart_id === cart_id,
                  );
                  const currentQtyThisPromo = cartItemThisPromo
                    ? cartItemThisPromo.qty
                    : 0;

                  const isMaxStock = totalQtyInCart >= item.stock;

                  return (
                    <div
                      key={item.promo_id}
                      className="group flex flex-row bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 h-36"
                    >
                      <div className="w-32 sm:w-40 bg-zinc-100/80 flex-shrink-0 relative border-r border-zinc-100 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded-br-lg shadow-sm z-10">
                          {item.discount}
                        </div>
                        <img
                          src={
                            item.image_url || getFallbackImage(item.category)
                          }
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              Sisa: {item.stock - totalQtyInCart}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-900 leading-snug truncate pr-2 mt-1">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-end justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-zinc-400 line-through mb-0.5">
                              {formatRp(item.originalPrice)}
                            </span>
                            <span className="text-base font-bold text-zinc-900">
                              {formatRp(item.price)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isMaxStock || item.stock === 0}
                            className={`h-9 px-4 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                              isMaxStock || item.stock === 0
                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                                : currentQtyThisPromo > 0
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
                            }`}
                          >
                            {isMaxStock || item.stock === 0 ? (
                              "Max Stok"
                            ) : currentQtyThisPromo > 0 ? (
                              <>
                                <Plus className="h-3 w-3" /> Tambah (
                                {currentQtyThisPromo})
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" /> Tambah
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promo;
