import { useState, useEffect } from 'react';
import {
  ArrowLeft, Phone, User, MapPin, Navigation, Check, Loader2,
  Wallet, LogOut, ShieldAlert, Inbox, Package, MessageCircle,
  IdCard, Camera, ImageIcon,
} from 'lucide-react';
import type { AppApi } from '@/hooks/useAppData';
import type { Driver, Trip } from '@/types';
import { SERVICES, getService, formatHTG, formatTime } from '@/lib/storage';
import { ServiceIcon } from '@/components/ServiceIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { showToast } from '@/components/Toast';
import { CommunicationScreen } from '@/components/CommunicationScreen';
import { PhotoUpload } from '@/components/PhotoUpload';

const DRIVER_SESSION_KEY = 'eddex_driver_session';

interface DriverViewProps {
  api: AppApi;
  onExit: () => void;
}

export function DriverView({ api, onExit }: DriverViewProps) {
  const [driverId, setDriverId] = useState<string | null>(() =>
    localStorage.getItem(DRIVER_SESSION_KEY)
  );
  const [showRegister, setShowRegister] = useState(false);

  const driver = driverId ? api.getDriver(driverId) : undefined;

  if (!driverId || !driver) {
    if (driverId) localStorage.removeItem(DRIVER_SESSION_KEY);
    return (
      <>
        <DriverLanding onExit={onExit} onRegister={() => setShowRegister(true)} />
        {showRegister && (
          <DriverRegister
            api={api}
            onClose={() => setShowRegister(false)}
            onRegistered={(id) => {
              localStorage.setItem(DRIVER_SESSION_KEY, id);
              setDriverId(id);
              setShowRegister(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <DriverDashboard
      driver={driver}
      api={api}
      onExit={() => {
        localStorage.removeItem(DRIVER_SESSION_KEY);
        setDriverId(null);
        onExit();
      }}
    />
  );
}

function DriverLanding({ onExit, onRegister }: { onExit: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="px-5 py-4 flex items-center gap-3 border-b border-ink-700">
        <button onClick={onExit} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-white">Chofè</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-brand-500/15 rounded-2xl mb-6">
          <User size={36} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Ou se yon chofè?</h2>
        <p className="text-ink-300 text-sm max-w-xs mb-8">
          Enskri pou w ka wè demand kous yo epi kòmanse fè lajan avèk EDDEX.
        </p>
        <button onClick={onRegister} className="btn-primary w-full max-w-xs">
          Enskri Kounye a
        </button>
      </div>
    </div>
  );
}

function DriverRegister({
  api, onClose, onRegistered,
}: {
  api: AppApi;
  onClose: () => void;
  onRegistered: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idPhoto, setIdPhoto] = useState('');
  const [selfiePhoto, setSelfiePhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Tanpri bay non ak nimewo w', 'error');
      return;
    }
    if (!idPhoto) {
      showToast('Tanpri pran foto idantite w', 'error');
      return;
    }
    if (!selfiePhoto) {
      showToast('Tanpri pran yon foto vizaj w', 'error');
      return;
    }
    setSubmitting(true);
    const driver = api.addDriver(name.trim(), phone.trim(), idPhoto, selfiePhoto);
    setTimeout(() => {
      setSubmitting(false);
      onRegistered(driver.id);
      showToast('Enskripsyon anrejistre! Tan atann Admin aktive w.', 'success');
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink-900 flex flex-col animate-slide-up">
      <header className="px-5 py-4 border-b border-ink-700 flex items-center gap-3">
        <button onClick={onClose} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-white">Enskripsyon Chofè</h1>
      </header>
      <form onSubmit={handleSubmit} className="flex-1 px-5 py-6 overflow-y-auto">
        <p className="text-ink-400 text-sm mb-6">
          Tanpri bay enfòmasyon ou. Yon Admin dwe aktive kont ou anvan w ka wè kous.
        </p>
        <div className="space-y-5">
          <div>
            <label className="label-text">Non <span className="text-brand-500">*</span></label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input-field pl-11" placeholder="Non ou" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-text">Nimewo Telefon <span className="text-brand-500">*</span></label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="tel" className="input-field pl-11" placeholder="egz: 509 3xxx xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/30 flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-brand-400 mt-0.5 shrink-0" />
            <p className="text-xs text-ink-300">
              Pou sekirite, ou dwe voye yon foto pyès idantite w ak yon foto vizaj w. Admin ap verifye yo anvan l aktive w.
            </p>
          </div>

          <PhotoUpload
            label="Foto Pyès Idantite"
            description="Pran yon foto klè nan idantite w (Kart Idantite, Paspò, oswa Lisans)"
            onPhoto={setIdPhoto}
            required
          />
          <PhotoUpload
            label="Foto Vizaj (Selfie)"
            description="Pran yon foto klè nan figi w"
            onPhoto={setSelfiePhoto}
            required
          />
        </div>
        <div className="mt-8">
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Enskri'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DriverDashboard({ driver, api, onExit }: { driver: Driver; api: AppApi; onExit: () => void }) {
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [tab, setTab] = useState<'queue' | 'active' | 'profile'>('queue');

  const activeTrip = activeTripId ? api.getTrip(activeTripId) : undefined;

  if (activeTrip) {
    return (
      <CommunicationScreen
        trip={activeTrip}
        driver={driver}
        api={api}
        onClose={() => {
          setActiveTripId(null);
          setTab('active');
        }}
      />
    );
  }

  if (!driver.active) {
    return <InactiveScreen driver={driver} onExit={onExit} />;
  }

  const pendingTrips = api.data.trips.filter((t) => t.status === 'pending');
  const myTrips = api.data.trips.filter((t) => t.driverId === driver.id && t.status !== 'pending');

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="sticky top-0 z-20 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-5 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-lg">
          <span className="text-white font-extrabold text-sm">E</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Byenveni, {driver.name}</h1>
          <p className="text-xs text-success-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500" /> Aktif
          </p>
        </div>
        <button onClick={onExit} className="p-2 text-ink-300 hover:text-white transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <div className="flex border-b border-ink-700 px-2">
        {([
          { id: 'queue', label: 'Kous', icon: Inbox, badge: pendingTrips.length },
          { id: 'active', label: 'Aktif', icon: Package, badge: myTrips.filter(t => t.status !== 'finished').length },
          { id: 'profile', label: 'Pwofil', icon: Wallet, badge: 0 },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab === t.id ? 'text-brand-400' : 'text-ink-400'}`}
          >
            <t.icon size={20} />
            <span className="text-xs font-medium">{t.label}</span>
            {t.badge > 0 && (
              <span className="absolute top-2 right-1/2 translate-x-4 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {t.badge}
              </span>
            )}
            {tab === t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {tab === 'queue' && (
          <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-ink-300 mb-4">Demand Kous Disponib</h2>
            {pendingTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Inbox size={40} className="text-ink-600 mb-3" />
                <p className="text-ink-400 text-sm">Pa gen demand kous kounye a</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onAccept={() => {
                    api.acceptTrip(trip.id, driver.id, driver.name);
                    setActiveTripId(trip.id);
                    showToast('Kous aksepte! Ouvri ekran komunikasyon an.', 'success');
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'active' && (
          <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-ink-300 mb-4">Kous Ou Yo</h2>
            {myTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package size={40} className="text-ink-600 mb-3" />
                <p className="text-ink-400 text-sm">Pa gen kous aktif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTrips.map((trip) => (
                  <ActiveTripCard
                    key={trip.id}
                    trip={trip}
                    onOpen={() => setActiveTripId(trip.id)}
                    onPickup={() => {
                      api.updateTripStatus(trip.id, 'in_progress');
                      showToast('Moun an pran. Kous an pwogre.', 'success');
                    }}
                    onFinish={() => {
                      api.updateTripStatus(trip.id, 'finished');
                      if (trip.commission) {
                        api.updateDriver(driver.id, { debt: driver.debt + trip.commission });
                        showToast(`Kous fini! ${formatHTG(trip.commission)} ajoute nan dèt ou.`, 'success');
                      } else {
                        showToast('Kous fini!', 'success');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && <DriverProfile driver={driver} />}
      </div>
    </div>
  );
}

function InactiveScreen({ driver, onExit }: { driver: Driver; onExit: () => void }) {
  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="px-5 py-4 flex items-center gap-3 border-b border-ink-700">
        <button onClick={onExit} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-white">Chofè</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-warning-500/15 rounded-2xl mb-6">
          <ShieldAlert size={40} className="text-warning-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-3">Kont ou pa aktif</h2>
        <p className="text-ink-300 text-sm max-w-xs mb-6 leading-relaxed">
          Kont ou pa aktif kounye a. Pou w ka louvri kont lan epi kòmanse jwenn kous, tanpri kontakte Admin sou WhatsApp pou w regle peman w.
        </p>
        <a
          href="https://wa.me/5547988264545?text=Alo%20Admin%20EDDEX%2C%20kont%20mwen%20pa%20aktif%2C%20mwen%20ta%20renmen%20regle%20peman%20m%20pou%20m%20ka%20travay."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold rounded-xl px-5 py-4 transition-all active:scale-95 hover:brightness-110 mb-4"
          style={{ boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)' }}
        >
          <MessageCircle size={22} />
          Kontakte Admin sou WhatsApp
        </a>
        <div className="w-full max-w-xs p-4 bg-ink-800 rounded-xl border border-ink-700">
          <p className="text-xs text-ink-400">Non</p>
          <p className="text-white font-semibold mb-3">{driver.name}</p>
          <p className="text-xs text-ink-400">Dèt Akumule</p>
          <p className="text-brand-400 font-bold text-lg">{formatHTG(driver.debt)}</p>
        </div>
        <button onClick={onExit} className="btn-ghost mt-6 w-full max-w-xs">Soti</button>
      </div>
    </div>
  );
}

function TripCard({ trip, onAccept }: { trip: Trip; onAccept: () => void }) {
  const service = getService(trip.serviceType);
  return (
    <div className="card p-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 bg-brand-500/15 rounded-lg">
          <ServiceIcon type={service?.icon ?? 'Car'} className="text-brand-400" size={20} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{service?.labelKr}</p>
          <p className="text-xs text-ink-400">{formatTime(trip.createdAt)}</p>
        </div>
      </div>

      {trip.customerPhoto && (
        <div className="mb-3 rounded-xl overflow-hidden border border-ink-600">
          <img src={trip.customerPhoto} alt="Kliyan" className="w-full h-32 object-cover" />
          <div className="px-3 py-1.5 bg-ink-900 flex items-center gap-1.5">
            <Camera size={12} className="text-brand-400" />
            <span className="text-xs text-ink-400">Foto Kliyan — Moun w ap pran</span>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-success-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-ink-400">Pwen repè</p>
            <p className="text-sm text-white">{trip.pickup}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Navigation size={16} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-ink-400">Destinasyon</p>
            <p className="text-sm text-white">{trip.destination}</p>
          </div>
        </div>
      </div>
      <button onClick={onAccept} className="btn-primary w-full">
        Accepter
      </button>
    </div>
  );
}

function ActiveTripCard({
  trip, onOpen, onPickup, onFinish,
}: {
  trip: Trip;
  onOpen: () => void;
  onPickup: () => void;
  onFinish: () => void;
}) {
  const service = getService(trip.serviceType);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 bg-brand-500/15 rounded-lg">
          <ServiceIcon type={service?.icon ?? 'Car'} className="text-brand-400" size={20} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{service?.labelKr}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-success-500 mt-0.5 shrink-0" />
          <p className="text-sm text-ink-200">{trip.pickup}</p>
        </div>
        <div className="flex items-start gap-2">
          <Navigation size={14} className="text-brand-500 mt-0.5 shrink-0" />
          <p className="text-sm text-ink-200">{trip.destination}</p>
        </div>
      </div>
      {trip.price !== null && (
        <div className="flex items-center justify-between mb-3 p-2.5 bg-ink-900 rounded-lg">
          <span className="text-xs text-ink-400">Priyo: <span className="text-white font-semibold">{formatHTG(trip.price)}</span></span>
          <span className="text-xs text-ink-400">Komisyon: <span className="text-brand-400 font-semibold">{trip.commission ? formatHTG(trip.commission) : '-'}</span></span>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onOpen} className="btn-outline flex-1 text-sm py-2.5">
          {trip.status === 'accepted' && !trip.price ? 'Negosye Priyo' : 'Ekran'}
        </button>
        {trip.price !== null && trip.status === 'accepted' && (
          <button onClick={onPickup} className="btn-primary flex-1 text-sm py-2.5">
            Pran Moun
          </button>
        )}
        {trip.status === 'in_progress' && (
          <button onClick={onFinish} className="btn-primary flex-1 text-sm py-2.5">
            Fini
          </button>
        )}
      </div>
    </div>
  );
}

function DriverProfile({ driver }: { driver: Driver }) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="card p-5 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-brand-500/15 rounded-2xl mx-auto mb-4">
          <User size={30} className="text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{driver.name}</h2>
        <p className="text-ink-400 text-sm mt-1">Chofè EDDEX</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-success-500/15 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
          <span className="text-xs text-success-500 font-medium">Aktif</span>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-brand-400" />
          <h3 className="font-semibold text-white">Dèt Akumule</h3>
        </div>
        <p className="text-3xl font-extrabold text-brand-400">{formatHTG(driver.debt)}</p>
        <p className="text-xs text-ink-400 mt-2">
          Komisyon 10% EDDEX sou tout kous. Peye pa Mon Cash.
        </p>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-white mb-3">Enfòmasyon Kont</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-400">Non</span>
            <span className="text-white">{driver.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400">Nimewo</span>
            <span className="text-white">{driver.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400">Enskri le</span>
            <span className="text-white">{new Date(driver.createdAt).toLocaleDateString('en-US')}</span>
          </div>
        </div>
      </div>

      {driver.idPhoto && (
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <IdCard size={18} className="text-brand-400" />
            Dokiman Idantite
          </h3>
          <div className="rounded-xl overflow-hidden border border-ink-600 mb-3">
            <img src={driver.idPhoto} alt="Idantite" className="w-full h-40 object-cover" />
          </div>
          <p className="text-xs text-ink-400 mb-3">Foto Pyès Idantite</p>
          <div className="rounded-xl overflow-hidden border border-ink-600">
            <img src={driver.selfiePhoto ?? ''} alt="Vizaj" className="w-full h-40 object-cover" />
          </div>
          <p className="text-xs text-ink-400 mt-2">Foto Vizaj (Selfie)</p>
        </div>
      )}
    </div>
  );
}
