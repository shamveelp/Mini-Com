import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, type Product } from '../services/productService';
import { ArrowRight, ChevronLeft, ShieldCheck, Zap, Globe } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as Product;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
    
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [product, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const order = await createOrder(product.price);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // We need to add this to frontend .env
        amount: order.amount,
        currency: order.currency,
        name: 'Mini-Com',
        description: `Purchase of ${product.name}`,
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
          navigate('/');
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#AE2448',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Failed to initialize payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#AE2448] text-[#D5E7B5] font-['Outfit'] flex flex-col items-center pt-20 px-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-16">
        
        {/* Left Side: Summary */}
        <div className="flex-1">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#72BAA9] hover:text-[#D5E7B5] transition-colors mb-12 font-black uppercase text-xs tracking-widest group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
          </button>

          <h1 className="text-6xl font-black uppercase tracking-tighter mb-12 leading-tight">
            Review <span className="text-[#72BAA9]">Order.</span>
          </h1>

          <div className="bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[3rem] p-10 border border-[#72BAA9]/10 shadow-2xl">
            <div className="flex items-center gap-8 mb-10">
              <div className="w-40 h-40 bg-[#D5E7B5]/10 rounded-3xl flex items-center justify-center p-4">
                <img src={product.image} alt={product.name} className="max-h-full w-auto headset-shadow" />
              </div>
              <div>
                <span className="bg-[#72BAA9] text-[#D5E7B5] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                  {product.tag}
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-1">{product.name}</h2>
                <p className="text-[#D5E7B5]/40 text-sm font-bold uppercase tracking-widest">{product.description}</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-[#72BAA9]/10 pt-10">
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                <span className="text-[#D5E7B5]/60">Subtotal</span>
                <span>₹{product.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                <span className="text-[#D5E7B5]/60">Shipping</span>
                <span className="text-[#72BAA9]">FREE</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black uppercase tracking-tight border-t border-[#72BAA9]/10 pt-6 mt-6">
                <span>Total</span>
                <span className="text-[#72BAA9]">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Features/Checkout */}
        <div className="w-full md:w-[400px] flex flex-col gap-8">
          <div className="bg-[#D5E7B5] rounded-[3rem] p-10 text-[#AE2448] shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Secure Checkout</h3>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <ShieldCheck className="text-[#72BAA9]" />
                <span className="text-sm font-bold uppercase tracking-widest">Encrypted Payment</span>
              </div>
              <div className="flex items-center gap-4">
                <Zap className="text-[#72BAA9]" />
                <span className="text-sm font-bold uppercase tracking-widest">Instant Activation</span>
              </div>
              <div className="flex items-center gap-4">
                <Globe className="text-[#72BAA9]" />
                <span className="text-sm font-bold uppercase tracking-widest">Global Support</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#AE2448] text-[#D5E7B5] font-black py-6 rounded-2xl hover:bg-[#72BAA9] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'INITIALIZING...' : 'PAY NOW'}
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-center text-[10px] font-bold text-[#D5E7B5]/40 uppercase tracking-[0.2em] px-10">
            By clicking Pay Now, you agree to Mini-Com's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
