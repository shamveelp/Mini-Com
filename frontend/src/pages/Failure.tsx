import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

const Failure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  return (
    <div className="min-h-screen bg-[#AE2448] text-[#D5E7B5] font-['Outfit'] flex items-center justify-center px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#f43f5e] rounded-full blur-[60px] opacity-20 animate-pulse"></div>
            <div className="relative bg-[#f43f5e] p-8 rounded-full shadow-2xl">
              <XCircle size={64} className="text-[#D5E7B5]" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-tight">
          Payment <span className="text-[#f43f5e]">Failed.</span>
        </h1>
        
        <p className="text-xl text-[#D5E7B5]/60 font-bold uppercase tracking-widest mb-12">
          Something went wrong with your transaction. No funds were captured.
        </p>

        <div className="bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[3rem] p-10 border border-[#f43f5e]/10 shadow-2xl mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D5E7B5]/80 leading-relaxed">
            Please check your payment details or try a different payment method. If the issue persists, contact your bank or our support team.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate('/checkout', { state: { product } })}
            className="flex-1 bg-[#D5E7B5] text-[#AE2448] font-black py-6 rounded-2xl hover:bg-[#72BAA9] hover:text-[#D5E7B5] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <RefreshCcw size={20} />
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-transparent border-2 border-[#D5E7B5]/10 text-[#D5E7B5] font-black py-6 rounded-2xl hover:bg-[#D5E7B5]/10 transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Failure;
