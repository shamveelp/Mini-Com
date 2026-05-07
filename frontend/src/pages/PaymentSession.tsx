import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPaymentStatus, verifyPayment, type Product } from '../services/productService';
import { ShieldCheck, Clock, RefreshCcw, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';

const PaymentSession = () => {
  const { customId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [session, setSession] = useState<any>(null);
  const [product, setProduct] = useState<Product | null>(location.state?.product || null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchSession();
    
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) document.body.removeChild(existing);
    };
  }, [customId]);

  useEffect(() => {
    if (!session || session.status === 'SUCCESS') return;

    const interval = setInterval(() => {
      const expires = new Date(session.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchSession = async () => {
    try {
      const data = await getPaymentStatus(customId!);
      setSession(data);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!session || session.isExpired) return;
    
    setProcessing(true);
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: session.amount,
        currency: session.currency,
        name: 'Mini-Com',
        description: `Payment for Order ${session.customId}`,
        order_id: session.razorpayOrderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Refresh session status
            await fetchSession();
          } catch (error) {
            console.error('Verification failed:', error);
            await fetchSession();
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9464616497',
        },
        theme: { color: '#AE2448' },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#AE2448] flex items-center justify-center">
      <div className="text-[#D5E7B5] font-black animate-pulse">LOADING SECURE SESSION...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#AE2448] text-[#D5E7B5] font-['Outfit'] flex flex-col items-center pt-20 px-8">
      <div className="max-w-4xl w-full">
        
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#72BAA9] hover:text-[#D5E7B5] transition-colors font-black uppercase text-xs tracking-widest group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
          </button>
          <div className="bg-[#1a1a1a]/30 backdrop-blur-xl px-6 py-2 rounded-full border border-[#72BAA9]/20 font-black text-xs tracking-widest text-[#72BAA9]">
            SESSION ID: {session.customId}
          </div>
        </div>

        <div className="bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[4rem] p-12 border border-[#72BAA9]/10 shadow-2xl overflow-hidden relative">
          
          {/* Status Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
                Payment <span className={session.status === 'SUCCESS' ? 'text-[#72BAA9]' : 'text-[#f43f5e]'}>
                  {session.status === 'SUCCESS' ? 'Confirmed.' : session.status === 'FAILED' ? 'Failed.' : 'Pending.'}
                </span>
              </h1>
              <p className="text-[#D5E7B5]/40 font-bold uppercase tracking-widest">
                {session.status === 'SUCCESS' ? 'Thank you for your purchase!' : 'Secure payment window is active.'}
              </p>
            </div>

            {session.status !== 'SUCCESS' && (
              <div className="flex items-center gap-4 bg-[#f43f5e]/10 px-8 py-4 rounded-3xl border border-[#f43f5e]/20">
                <Clock size={24} className="text-[#f43f5e]" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#f43f5e]/60">Expires In</div>
                  <div className="text-2xl font-black tabular-nums">{timeLeft}</div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-[#D5E7B5]/5 p-8 rounded-[3rem] border border-[#D5E7B5]/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black uppercase tracking-widest opacity-40">Amount Due</span>
                  <span className="text-3xl font-black text-[#72BAA9]">₹{session.amount / 100}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-[#72BAA9]" />
                    <span>Bank-Grade Encryption</span>
                  </div>
                </div>
              </div>

              {session.status === 'SUCCESS' ? (
                <div className="flex items-center gap-4 bg-[#72BAA9]/20 p-6 rounded-3xl border border-[#72BAA9]/30">
                  <CheckCircle size={32} className="text-[#72BAA9]" />
                  <p className="font-bold text-sm leading-relaxed">Your order has been processed. Transaction ID: {session.razorpayPaymentId || 'N/A'}</p>
                </div>
              ) : session.status === 'FAILED' ? (
                <div className="flex items-center gap-4 bg-[#f43f5e]/20 p-6 rounded-3xl border border-[#f43f5e]/30">
                  <XCircle size={32} className="text-[#f43f5e]" />
                  <p className="font-bold text-sm leading-relaxed text-[#f43f5e]">Transaction failed. You can retry using the button below before the session expires.</p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-6">
              {session.status !== 'SUCCESS' && !session.isExpired && (
                <button 
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-[#D5E7B5] text-[#AE2448] font-black py-8 rounded-[2rem] hover:bg-[#72BAA9] hover:text-[#D5E7B5] transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <RefreshCcw size={24} className={processing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                  <span className="text-xl uppercase tracking-tighter">
                    {processing ? 'PROCESSING...' : session.status === 'FAILED' ? 'RETRY PAYMENT' : 'COMPLETE PAYMENT'}
                  </span>
                </button>
              )}

              {session.isExpired && session.status !== 'SUCCESS' && (
                <div className="text-center p-10 bg-black/20 rounded-[2rem] border border-white/5">
                  <p className="text-[#f43f5e] font-black uppercase tracking-widest mb-6">SESSION EXPIRED</p>
                  <button onClick={() => navigate('/')} className="text-xs font-black uppercase tracking-widest hover:text-[#72BAA9] transition-colors">Return to Shop to Start Over</button>
                </div>
              ) }

              {session.status === 'SUCCESS' && (
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-[#72BAA9] text-[#D5E7B5] font-black py-8 rounded-[2rem] hover:bg-[#D5E7B5] hover:text-[#AE2448] transition-all duration-500 shadow-2xl flex items-center justify-center gap-4"
                >
                  <CheckCircle size={24} />
                  <span className="text-xl uppercase tracking-tighter">RETURN TO COLLECTION</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSession;
