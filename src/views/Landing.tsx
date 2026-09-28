import { Truck, User, Shield, ChevronRight } from 'lucide-react';

type Role = 'customer' | 'driver' | 'admin';

interface LandingProps {
  onSelect: (role: Role) => void;
}

export function Landing({ onSelect }: LandingProps) {
  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-16 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-brand-500 rounded-2xl mb-5 shadow-lg shadow-brand-500/40 animate-bounce-in">
            <Truck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            EDDEX
          </h1>
          <p className="text-ink-300 mt-2 text-sm font-medium tracking-wide">
            EDDY EXPRESS · TRANSPORT & LOGISTICS
          </p>
          <p className="text-ink-400 mt-4 text-sm max-w-xs">
            Transport pasaje ak machandiz atravè Ayiti — rapid, sekir, san w pa bezwen bay nimewo w.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="flex-1 px-6 pb-10 flex flex-col gap-3">
        <p className="text-ink-300 text-xs font-semibold uppercase tracking-wider mb-1">Chwazi wòl ou</p>

        <button
          onClick={() => onSelect('customer')}
          className="group flex items-center gap-4 bg-ink-800 border border-ink-700 rounded-2xl p-4 transition-all active:scale-[0.98] hover:border-brand-500/50"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-brand-500/15 rounded-xl">
            <User size={24} className="text-brand-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-white">Kliyan</h3>
            <p className="text-xs text-ink-400">Mande yon kous — pasaje oswa machandiz</p>
          </div>
          <ChevronRight size={20} className="text-ink-400 group-hover:text-brand-400 transition-colors" />
        </button>

        <button
          onClick={() => onSelect('driver')}
          className="group flex items-center gap-4 bg-ink-800 border border-ink-700 rounded-2xl p-4 transition-all active:scale-[0.98] hover:border-brand-500/50"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-brand-500/15 rounded-xl">
            <Truck size={24} className="text-brand-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-white">Chofè</h3>
            <p className="text-xs text-ink-400">Wè demand, aksepte kous, fè lajan</p>
          </div>
          <ChevronRight size={20} className="text-ink-400 group-hover:text-brand-400 transition-colors" />
        </button>

        <button
          onClick={() => onSelect('admin')}
          className="group flex items-center gap-4 bg-ink-800 border border-ink-700 rounded-2xl p-4 transition-all active:scale-[0.98] hover:border-brand-500/50"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-brand-500/15 rounded-xl">
            <Shield size={24} className="text-brand-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-white">Admin</h3>
            <p className="text-xs text-ink-400">Jere chofè, wè kous, komisyon</p>
          </div>
          <ChevronRight size={20} className="text-ink-400 group-hover:text-brand-400 transition-colors" />
        </button>
      </div>

      <div className="px-6 pb-8 text-center">
        <p className="text-ink-500 text-xs">© 2026 EDDEX · Tout dwa rezève</p>
        <p className="text-ink-600 text-xs mt-1">eddex-transport.com</p>
      </div>
    </div>
  );
}
