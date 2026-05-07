import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProducts, type Product } from './services/productService';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Failure from './pages/Failure';
import PaymentSession from './pages/PaymentSession';
import Navbar from './components/Navbar';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#AE2448]">
      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 pt-40 flex flex-col md:flex-row items-center relative overflow-hidden">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center z-10 py-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#72BAA9] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <img 
              src="/images/main.webp" 
              alt="Mini-Com Headset" 
              className="w-full max-w-[500px] h-auto headset-shadow animate-float relative z-10"
            />
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 z-10 flex flex-col items-start text-left md:pl-16 py-12">
          <h1 className="text-[#D5E7B5] font-black text-6xl md:text-8xl leading-tight mb-12 tracking-tighter uppercase">
            PURE <span className="text-[#72BAA9]">SOUND.</span>
          </h1>

          <a href="#products" className="bg-[#D5E7B5] text-[#AE2448] font-black text-xl px-16 py-7 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-[#72BAA9] hover:text-[#D5E7B5] transition-all duration-500 transform hover:-translate-y-2 active:scale-95 flex items-center justify-center border-b-8 border-[#72BAA9]/20">
            EXPLORE
          </a>
        </div>
      </main>

      {/* Products Section */}
      <section id="products" className="py-32 bg-[#AE2448] relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-16 h-[2px] bg-[#72BAA9]"></div>
            <h2 className="text-[#D5E7B5] font-black text-4xl uppercase tracking-tighter">Premium Collection</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D5E7B5]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-[#1a1a1a]/30 backdrop-blur-md rounded-[3rem] p-10 border border-[#72BAA9]/5 hover:border-[#72BAA9]/30 transition-all duration-700 hover:-translate-y-6 flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
                  {/* Product Tag */}
                  <div className="absolute top-10 right-10 z-20">
                    <span className="bg-[#D5E7B5] text-[#AE2448] text-[9px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg border border-[#72BAA9]/20">
                      {product.tag}
                    </span>
                  </div>

                  {/* Image Container */}
                  <div className="relative h-72 flex items-center justify-center mb-10 overflow-visible">
                    <div className="absolute inset-0 bg-[#72BAA9] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full w-auto headset-shadow transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 relative z-10"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-[#D5E7B5] font-black text-3xl uppercase tracking-tighter mb-2 group-hover:text-[#72BAA9] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#D5E7B5]/40 text-xs font-bold uppercase tracking-widest mb-6">
                      {product.description}
                    </p>
                    <div className="flex items-end justify-between mb-10">
                      <div className="flex flex-col">
                        <span className="text-[#72BAA9] text-[10px] font-black uppercase tracking-widest mb-1">Price</span>
                        <span className="text-[#D5E7B5] font-black text-3xl tracking-tight">{formatINR(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <button 
                    onClick={() => navigate('/checkout', { state: { product } })}
                    className="w-full bg-[#D5E7B5] text-[#AE2448] font-black py-5 rounded-2xl hover:bg-[#72BAA9] hover:text-[#D5E7B5] transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 group/btn relative overflow-hidden border-b-4 border-[#72BAA9]/20 hover:border-transparent"
                  >
                    <span className="relative z-10 uppercase tracking-widest text-xs">Go to checkout</span>
                    <div className="w-6 h-6 rounded-full bg-[#AE2448]/10 flex items-center justify-center group-hover/btn:bg-[#D5E7B5]/20 transition-colors relative z-10">
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#1a1a1a] border-t border-[#72BAA9]/20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[#D5E7B5] font-black text-xl tracking-tighter uppercase italic">Mini-Com</span>
          <div className="text-[#72BAA9] text-sm font-bold">© 2026 MINI-COM AUDIO. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8">
             <a href="#" className="text-[#D5E7B5] hover:text-[#72BAA9] transition-colors text-xs font-black uppercase tracking-widest">Privacy</a>
             <a href="#" className="text-[#D5E7B5] hover:text-[#72BAA9] transition-colors text-xs font-black uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:customId" element={<PaymentSession />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
      </Routes>
    </>
  );
};

export default App;
