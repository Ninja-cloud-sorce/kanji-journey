import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FFF5F7] relative overflow-hidden">
      {/* Background mountains */}
      <div className="scholar-bg opacity-30" />
      
      <div className="text-center space-y-8 relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-[32px] bg-white border-2 border-pink-100 flex items-center justify-center text-accent font-serif font-black text-5xl shadow-xl shadow-pink-200/50">
          無
        </div>
        <div className="space-y-4 flex flex-col items-center">
           <h1 className="text-6xl font-serif font-bold text-primary tracking-tight">404</h1>
           <p className="text-2xl font-serif text-pink-900/60 lowercase italic font-medium">This path led to a void in the sanctuary.</p>
        </div>
        <a href="/" className="btn-pink !px-16 !py-4 shadow-xl">
          RETURN TO SCHOLARSHIP
        </a>
      </div>
    </div>
  );
};

export default NotFound;
