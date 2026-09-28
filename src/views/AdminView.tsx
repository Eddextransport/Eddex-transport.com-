import { useState } from 'react';
import {
  ArrowLeft, Shield, Lock, Eye, EyeOff, Loader2,
  Users, Route, TrendingUp, Power, Phone, User, Wallet,
  MapPin, Navigation, Filter, IdCard, Camera,
  ThumbsUp, ThumbsDown, MessageSquare, X,
} from 'lucide-react';
import type { AppApi } from '@/hooks/useAppData';
import type { Driver, Trip, TripStatus } from '@/types';
import { getService, formatHTG, formatTime, formatDate, isToday } from '@/lib/storage';
import { ServiceIcon } from '@/components/ServiceIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { showToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';

const ADMIN_CODE = 'eddex2026';

interface AdminViewProps {
  api: AppApi;
  onExit: () => void;
}

export function AdminView({ api, onExit }: AdminViewProps) {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (code === ADMIN_CODE) {
        setAuthed(true);
        showToast('Byenveni nan Admin Dashboard', 'success');
      } else {
        setError(true);
        showToast('Kòd sekre la pa valid', 'error');
      }
      setLoading(false);
    }, 400);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-ink-900 flex flex-col">
        <header className="px-5 py-4 flex items-center gap-3 border-b border-ink-700">
          <button onClick={onExit} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-white">Admin</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex items-center justify-center w-20 h-20 bg-brand-500/15 rounded-2xl mb-6">
            <Lock size={36} className="text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aksè Sekirize</h2>
          <p className="text-ink-400 text-sm mb-8 text-center max-w-xs">
            Antre kòd sekre a pou w ka jere sistèm EDDEX yo.
          </p>
          <form onSubmit={handleLogin} className="w-full max-w-xs">
            <label className="label-text">Kòd Sekre</label>
            <div className="relative">
              <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type={showCode ? 'text' : 'password'}
                className={`input-field pl-11 pr-11 ${error ? 'border-error-500' : ''}`}
                placeholder="Kòd admin"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white transition-colors"
              >
                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
              {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Konekte'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard api={api} onExit={onExit} />;
}

function AdminDashboard({ api, onExit }: { api: AppApi; onExit: () => void }) {
  const [tab, setTab] = useState<'overview' | 'drivers' | 'trips'>('overview');

  const todayTrips = api.data.trips.filter((t) => t.acceptedAt && isToday(t.acceptedAt));
  const todayCommission = todayTrips
    .filter((t) => t.commission !== null)
    .reduce((sum, t) => sum + (t.commission ?? 0), 0);
  const totalDebt = api.data.drivers.reduce((sum, d) => sum + d.debt, 0);
  const activeDrivers = api.data.drivers.filter((d) => d.active).length;
  const feedbackCount = api.data.trips.filter((t) => t.feedback !== null).length;

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="sticky top-0 z-20 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-5 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-lg">
          <Shield size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-ink-400">EDDEX Management</p>
        </div>
        <button onClick={onExit} className="p-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="flex border-b border-ink-700 px-2">
        {([
          { id: 'overview', label: 'Apèsi', icon: TrendingUp },
          { id: 'drivers', label: 'Chofè', icon: Users },
          { id: 'trips', label: 'Kous', icon: Route },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab === t.id ? 'text-brand-400' : 'text-ink-400'}`}
          >
            <t.icon size={20} />
            <span className="text-xs font-medium">{t.label}</span>
            {tab === t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {tab === 'overview' && (
          <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Komisyon Jodi a"
                value={formatHTG(todayCommission)}
                icon={TrendingUp}
                accent="brand"
              />
              <StatCard
                label="Total Dèt Chofè"
                value={formatHTG(totalDebt)}
                icon={Wallet}
                accent="warning"
              />
              <StatCard
                label="Chofè Aktif"
                value={`${activeDrivers} / ${api.data.drivers.length}`}
                icon={Users}
                accent="success"
              />
              <StatCard
                label="Kous Jodi a"
                value={String(todayTrips.length)}
                icon={Route}
                accent="brand"
              />
            </div>

            {feedbackCount > 0 && (
              <div className="card p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-brand-500/15 rounded-lg">
                  <MessageSquare size={18} className="text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{feedbackCount} Feedback Rapò</p>
                  <p className="text-xs text-ink-400">Kliyan ki bay feedback sou kous yo</p>
                </div>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-400" />
                Kous Resan
              </h3>
              {api.data.trips.length === 0 ? (
                <p className="text-ink-400 text-sm text-center py-6">Pa gen kous ankò</p>
              ) : (
                <div className="space-y-2">
                  {api.data.trips.slice(0, 5).map((trip) => (
                    <MiniTripRow key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'drivers' && <DriversTab api={api} />}

        {tab === 'trips' && <TripsTab api={api} />}
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  accent: 'brand' | 'warning' | 'success';
}) {
  const colors = {
    brand: 'bg-brand-500/15 text-brand-400',
    warning: 'bg-warning-500/15 text-warning-500',
    success: 'bg-success-500/15 text-success-500',
  };
  return (
    <div className="card p-4">
      <div className={`flex items-center justify-center w-9 h-9 ${colors[accent]} rounded-lg mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-ink-400 mt-0.5">{label}</p>
    </div>
  );
}

function MiniTripRow({ trip }: { trip: Trip }) {
  const service = getService(trip.serviceType);
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center justify-center w-8 h-8 bg-ink-700 rounded-lg shrink-0">
        <ServiceIcon type={service?.icon ?? 'Car'} className="text-ink-200" size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{service?.labelKr}</p>
        <p className="text-xs text-ink-400 truncate">{trip.customer.name} · {trip.pickup} → {trip.destination}</p>
      </div>
      <StatusBadge status={trip.status} />
    </div>
  );
}

function DriversTab({ api }: { api: AppApi }) {
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);

  if (api.data.drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Users size={40} className="text-ink-600 mb-3" />
        <p className="text-ink-400 text-sm">Pa gen chofè enskri</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      {api.data.drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} api={api} onView={() => setViewDriver(driver)} />
      ))}
      <Modal open={!!viewDriver} onClose={() => setViewDriver(null)} title="Verifye Chofè" maxWidth="max-w-md">
        {viewDriver && <DriverVerifyPanel driver={viewDriver} api={api} onDone={() => setViewDriver(null)} />}
      </Modal>
    </div>
  );
}

function DriverCard({ driver, api, onView }: { driver: Driver; api: AppApi; onView: () => void }) {
  function toggleActive() {
    api.updateDriver(driver.id, { active: !driver.active });
    showToast(`${driver.name} ${driver.active ? 'dezaktive' : 'aktive'}`, 'success');
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center w-11 h-11 bg-ink-700 rounded-xl shrink-0">
          <User size={22} className="text-ink-200" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{driver.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Phone size={12} className="text-ink-400" />
            <p className="text-xs text-ink-400">{driver.phone}</p>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">Enskri: {formatDate(driver.createdAt)}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${driver.active ? 'bg-success-500/15 text-success-500' : 'bg-ink-700 text-ink-400'}`}>
          {driver.active ? 'Aktif' : 'Inaktif'}
        </span>
      </div>

      {(driver.idPhoto || driver.selfiePhoto) && (
        <div className="flex gap-2 mb-3">
          {driver.idPhoto && (
            <div className="flex-1 rounded-lg overflow-hidden border border-ink-600">
              <img src={driver.idPhoto} alt="Idantite" className="w-full h-20 object-cover" />
              <p className="text-[10px] text-ink-400 text-center py-0.5 bg-ink-900">Idantite</p>
            </div>
          )}
          {driver.selfiePhoto && (
            <div className="flex-1 rounded-lg overflow-hidden border border-ink-600">
              <img src={driver.selfiePhoto} alt="Vizaj" className="w-full h-20 object-cover" />
              <p className="text-[10px] text-ink-400 text-center py-0.5 bg-ink-900">Vizaj</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-ink-900 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-brand-400" />
          <span className="text-xs text-ink-400">Dèt Akumule</span>
        </div>
        <span className="text-lg font-bold text-brand-400">{formatHTG(driver.debt)}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="btn-outline flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5"
        >
          <IdCard size={16} /> Wè Dokiman
        </button>
        <button
          onClick={toggleActive}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
            driver.active
              ? 'bg-warning-500/15 text-warning-500'
              : 'bg-success-500/15 text-success-500'
          }`}
        >
          <Power size={16} />
          {driver.active ? 'Dezaktive' : 'Aktive'}
        </button>
      </div>
    </div>
  );
}

function DriverVerifyPanel({ driver, api, onDone }: { driver: Driver; api: AppApi; onDone: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-ink-900 rounded-xl">
        <div className="flex items-center justify-center w-12 h-12 bg-ink-700 rounded-xl">
          <User size={24} className="text-ink-200" />
        </div>
        <div>
          <h3 className="font-bold text-white">{driver.name}</h3>
          <p className="text-xs text-ink-400">{driver.phone}</p>
        </div>
        <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${driver.active ? 'bg-success-500/15 text-success-500' : 'bg-ink-700 text-ink-400'}`}>
          {driver.active ? 'Aktif' : 'Inaktif'}
        </span>
      </div>

      {driver.idPhoto && (
        <div>
          <p className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <IdCard size={16} className="text-brand-400" /> Foto Pyès Idantite
          </p>
          <div className="rounded-xl overflow-hidden border border-ink-600">
            <img src={driver.idPhoto} alt="Idantite" className="w-full h-52 object-cover" />
          </div>
        </div>
      )}

      {driver.selfiePhoto && (
        <div>
          <p className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <Camera size={16} className="text-brand-400" /> Foto Vizaj (Selfie)
          </p>
          <div className="rounded-xl overflow-hidden border border-ink-600">
            <img src={driver.selfiePhoto} alt="Vizaj" className="w-full h-52 object-cover" />
          </div>
        </div>
      )}

      <button
        onClick={() => {
          api.updateDriver(driver.id, { active: !driver.active });
          showToast(`${driver.name} ${driver.active ? 'dezaktive' : 'aktive'}`, 'success');
          onDone();
        }}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] ${
          driver.active
            ? 'bg-warning-500/15 text-warning-500'
            : 'bg-success-500 text-white'
        }`}
      >
        <Power size={18} />
        {driver.active ? 'Dezaktive Chofè Sa a' : 'Aktive Chofè Sa a'}
      </button>
    </div>
  );
}

function TripsTab({ api }: { api: AppApi }) {
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');

  const filteredTrips = filter === 'all'
    ? api.data.trips
    : api.data.trips.filter((t) => t.status === filter);

  const filters: { id: TripStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Tout' },
    { id: 'pending', label: 'Tann' },
    { id: 'accepted', label: 'Aksepte' },
    { id: 'in_progress', label: 'Pwogre' },
    { id: 'finished', label: 'Fini' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter size={16} className="text-ink-400 shrink-0" />
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-brand-500 text-white' : 'bg-ink-700 text-ink-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Route size={40} className="text-ink-600 mb-3" />
          <p className="text-ink-400 text-sm">Pa gen kous nan filter sa a</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <AdminTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminTripCard({ trip }: { trip: Trip }) {
  const [showPhoto, setShowPhoto] = useState(false);
  const service = getService(trip.serviceType);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 bg-brand-500/15 rounded-lg shrink-0">
          <ServiceIcon type={service?.icon ?? 'Car'} className="text-brand-400" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{service?.labelKr}</p>
          <p className="text-xs text-ink-400">{formatTime(trip.createdAt)} · {formatDate(trip.createdAt)}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <User size={14} className="text-ink-400 shrink-0" />
          <span className="text-sm text-white">{trip.customer.name}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-success-500 mt-0.5 shrink-0" />
          <span className="text-sm text-ink-200">{trip.pickup}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation size={14} className="text-brand-500 mt-0.5 shrink-0" />
          <span className="text-sm text-ink-200">{trip.destination}</span>
        </div>
      </div>

      {trip.customerPhoto && (
        <button
          onClick={() => setShowPhoto(!showPhoto)}
          className="mb-3 flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          <Camera size={14} />
          {showPhoto ? 'Kache Foto Kliyan' : 'Wè Foto Kliyan'}
        </button>
      )}
      {showPhoto && trip.customerPhoto && (
        <div className="mb-3 rounded-xl overflow-hidden border border-ink-600 animate-fade-in">
          <img src={trip.customerPhoto} alt="Kliyan" className="w-full h-40 object-cover" />
        </div>
      )}

      {trip.driverName && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-ink-900 rounded-lg">
          <User size={14} className="text-ink-400" />
          <span className="text-xs text-ink-300">Chofè: <span className="text-white font-medium">{trip.driverName}</span></span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 bg-ink-900 rounded-lg">
          <p className="text-xs text-ink-400">Priyo</p>
          <p className="text-sm font-bold text-white">{trip.price !== null ? formatHTG(trip.price) : '—'}</p>
        </div>
        <div className="p-2.5 bg-ink-900 rounded-lg">
          <p className="text-xs text-ink-400">Komisyon (10%)</p>
          <p className="text-sm font-bold text-brand-400">{trip.commission !== null ? formatHTG(trip.commission) : '—'}</p>
        </div>
      </div>

      {trip.feedback && (
        <div className={`p-3 rounded-xl border ${trip.feedback.rating === 'good' ? 'bg-success-500/10 border-success-500/30' : 'bg-error-500/10 border-error-500/30'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {trip.feedback.rating === 'good' ? (
              <ThumbsUp size={16} className="text-success-500" />
            ) : (
              <ThumbsDown size={16} className="text-error-500" />
            )}
            <span className={`text-xs font-semibold ${trip.feedback.rating === 'good' ? 'text-success-500' : 'text-error-500'}`}>
              Feedback Kliyan: {trip.feedback.rating === 'good' ? 'Tout byen pase' : 'Te gen pwoblèm'}
            </span>
          </div>
          <p className="text-xs text-ink-300">{trip.feedback.message}</p>
          <p className="text-[10px] text-ink-500 mt-1.5">{formatDate(trip.feedback.createdAt)} · {formatTime(trip.feedback.createdAt)}</p>
        </div>
      )}
    </div>
  );
}
