import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleProductsClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('products');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigate to home first
      navigate('/');
      // The scroll will happen naturally if we use a hash or a useEffect on the home page
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
      <nav className="bg-[#D5E7B5] rounded-full px-10 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between border-b-4 border-[#72BAA9]/30 backdrop-blur-md pointer-events-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center group cursor-pointer">
          <span className="text-[#AE2448] font-black text-xl tracking-tighter uppercase italic">Mini-Com</span>
        </Link>

        {/* Navigation Menu */}
        <div className="flex items-center">
          <ul className="flex items-center text-[#AE2448] font-black text-xs uppercase tracking-widest">
            <li>
              <a 
                href="/#products" 
                onClick={handleProductsClick}
                className="hover:text-[#72BAA9] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#72BAA9] after:scale-x-0 hover:after:scale-x-100 after:transition-transform px-4 py-2 bg-[#72BAA9]/10 rounded-full"
              >
                Products
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
