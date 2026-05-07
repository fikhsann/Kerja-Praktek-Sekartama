import { useOutletContext } from "react-router-dom";
import { Plus, Percent } from "lucide-react";

const Promo = () => {
  const { cartItems, setCartItems } = useOutletContext();

  const promoProducts = [
    {
      id: 101,
      name: "Pintu Sliding Kaca Tempered",
      category: "Pintu UPVC",
      originalPrice: 4000000,
      price: 3520000,
      discount: "-12%",
      stock: 5,
    },
    {
      id: 102,
      name: "Jendela Boven (Clearance)",
      category: "Jendela UPVC",
      originalPrice: 1200000,
      price: 912000,
      discount: "-24%",
      stock: 15,
    },
    {
      id: 103,
      name: "Kaca Mati Fixed Window",
      category: "Kaca",
      originalPrice: 1500000,
      price: 1245000,
      discount: "-17%",
      stock: 8,
    },
    {
      id: 104,
      name: "Pintu Lipat (Folding Door)",
      category: "Pintu UPVC",
      originalPrice: 5500000,
      price: 4675000,
      discount: "-15%",
      stock: 3,
    },
  ];

  // Logic ditambahin proteksi biar gak ngelebihi stok
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const isExist = prevItems.find((item) => item.id === product.id);

      if (isExist) {
        // Cek apakah jumlah di keranjang udah nyentuh batas stok
        if (isExist.qty >= product.stock) {
          return prevItems; // Kalo udah max, gak usah nambah lagi
        }
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      // Kalo belum ada di keranjang, masukin dengan qty 1
      if (product.stock > 0) {
        return [...prevItems, { ...product, qty: 1 }];
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
              <Percent className="h-4 w-4" strokeWidth={3} />
            </div>
            Penawaran Spesial
          </h1>
          <p className="text-[13px] text-zinc-500 mt-2">
            Katalog harga khusus untuk klien prioritas. Berlaku terbatas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {promoProducts.map((product) => {
          // Cari tau barang ini udah dimasukin berapa banyak ke keranjang
          const cartItem = cartItems.find((item) => item.id === product.id);
          const currentQty = cartItem ? cartItem.qty : 0;

          // Cek apakah stok udah habis dipesan
          const isMaxStock = currentQty >= product.stock;

          return (
            <div
              key={product.id}
              className="group flex flex-row bg-white border border-zinc-200/60 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 h-36"
            >
              <div className="w-32 sm:w-40 bg-zinc-100/80 flex-shrink-0 relative border-r border-zinc-100 flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded-br-lg shadow-sm">
                  {product.discount}
                </div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest -rotate-90 whitespace-nowrap">
                  {product.category}
                </span>
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      Sisa Stok: {product.stock - currentQty}{" "}
                      {/* Stok sisa otomatis ngurang */}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-zinc-900 leading-snug truncate pr-2">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-zinc-400 line-through mb-0.5">
                      {formatRp(product.originalPrice)}
                    </span>
                    <span className="text-[15px] font-bold text-zinc-900">
                      {formatRp(product.price)}
                    </span>
                  </div>

                  {/* TOMBOL ADD TO CART YANG UDAH DI-UPGRADE */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isMaxStock}
                    className={`h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      isMaxStock
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200" // Kalo stok habis
                        : currentQty > 0
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100" // Kalo udah dimasukin keranjang tapi belum max
                          : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm" // Belum dimasukin sama sekali
                    }`}
                  >
                    {isMaxStock ? (
                      "Max Stok"
                    ) : currentQty > 0 ? (
                      <>
                        <Plus className="h-3 w-3" /> Tambah ({currentQty})
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
  );
};

export default Promo;
