import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-[#AE2448] text-[#D5E7B5] font-['Outfit'] flex items-center justify-center px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#72BAA9] rounded-full blur-[60px] opacity-20 animate-pulse"></div>
            <div className="relative bg-[#D5E7B5] p-8 rounded-full shadow-2xl">
              <CheckCircle2 size={64} className="text-[#AE2448]" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-tight">
          Payment <span className="text-[#72BAA9]">Success!</span>
        </h1>
        
        <p className="text-xl text-[#D5E7B5]/60 font-bold uppercase tracking-widest mb-12">
          Your order has been confirmed and is being processed.
        </p>

        <div className="bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[3rem] p-10 border border-[#72BAA9]/10 shadow-2xl mb-12">
          <div className="flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center border-b border-[#72BAA9]/10 pb-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#72BAA9]">Payment ID</span>
              <span className="font-mono text-sm">{paymentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#72BAA9]">Status</span>
              <span className="bg-[#72BAA9] text-[#AE2448] text-[10px] font-black px-4 py-1 rounded-full uppercase">Verified</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-[#D5E7B5] text-[#AE2448] font-black py-6 rounded-2xl hover:bg-[#72BAA9] hover:text-[#D5E7B5] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-transparent border-2 border-[#72BAA9]/30 text-[#D5E7B5] font-black py-6 rounded-2xl hover:bg-[#72BAA9]/10 transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            Go Home
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
