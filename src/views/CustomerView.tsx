import { useState } from 'react';
import {
  ArrowLeft, MapPin, Navigation, Check, Phone, User, Loader2,
  ShieldCheck, ThumbsUp, ThumbsDown, MessageSquare, Send,
  Inbox, Clock, Star,
} from 'lucide-react';
import type { AppApi } from '@/hooks/useAppData';
import type { ServiceCategory, ServiceType, Trip } from '@/types';
import { SERVICES, getService, formatTime, formatDate, formatHTG } from '@/lib/storage';
import { ServiceIcon } from '@/components/ServiceIcon';
import { PhotoUpload } from '@/components/PhotoUpload';
import { StatusBadge } from '@/components/StatusBadge';
import { showToast } from '@/components/Toast';

const CUSTOMER_SESSION_KEY = 'eddex_customer_session';

interface CustomerViewProps {
  api: AppApi;
  onExit: () => void;
}

export function CustomerView({ api, onExit }: CustomerViewProps) {
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState<'request' | 'mytrips'>('request');

  const session = loadCustomerSession();
  const myTrips = session
    ? api.data.trips.filter((t) => t.customer.phone === session.phone)
    : [];

  const finishedTripsNeedingFeedback = myTrips.filter(
    (t) => t.status === 'finished' && t.feedback === null
  );

  function handleSelectService(id: ServiceType) {
    setSelectedService(id);
    setShowForm(true);
  }

  function reset() {
    setCategory(null);
    setSelectedService(null);
    setShowForm(false);
    setSubmitted(false);
  }

  if (submitted) {
    return <SuccessScreen onExit={onExit} onNewRequest={reset} />;
  }

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      <header className="sticky top-0 z-20 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-5 py-4 flex items-center gap-3">
        <button onClick={onExit} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Kliyan</h1>
          <p className="text-xs text-ink-400">Mande yon kous</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-lg">
          <span className="text-white font-extrabold text-sm">E</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-ink-700 px-2">
        {([
          { id: 'request', label: 'Mande Kous', icon: Send, badge: 0 },
          { id: 'mytrips', label: 'Kous Mwen', icon: Inbox, badge: finishedTripsNeedingFeedback.length },
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

      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {tab === 'request' && (
          <>
            {!category && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-2">Ki sèvis ou bezwen?</h2>
                <p className="text-ink-400 text-sm mb-6">Chwazi yon kategori</p>

                <button
                  onClick={() => setCategory('passenger')}
                  className="w-full group flex items-center gap-4 bg-ink-800 border border-ink-700 rounded-2xl p-4 mb-3 transition-all active:scale-[0.98] hover:border-brand-500/50"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-brand-500/15 rounded-xl">
                    <User size={26} className="text-brand-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-white">Transport Pasaje</h3>
                    <p className="text-xs text-ink-400">Oto Prive, Kamyonèt, Bus, Moto</p>
                  </div>
                </button>

                <button
                  onClick={() => setCategory('cargo')}
                  className="w-full group flex items-center gap-4 bg-ink-800 border border-ink-700 rounded-2xl p-4 mb-3 transition-all active:scale-[0.98] hover:border-brand-500/50"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-brand-500/15 rounded-xl">
                    <ServiceIcon type="Truck" className="text-brand-400" size={26} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-white">Kago & Machandiz</h3>
                    <p className="text-xs text-ink-400">Kamyon (Sable/Roch), Moto 3 Rou</p>
                  </div>
                </button>
              </div>
            )}

            {category && !showForm && (
              <div className="animate-fade-in">
                <button
                  onClick={() => setCategory(null)}
                  className="flex items-center gap-1.5 text-ink-400 text-sm mb-4 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} /> Retounen
                </button>
                <h2 className="text-xl font-bold text-white mb-2">
                  {category === 'passenger' ? 'Transport Pasaje' : 'Kago & Machandiz'}
                </h2>
                <p className="text-ink-400 text-sm mb-6">Chwazi kalite machin</p>

                <div className="grid grid-cols-2 gap-3">
                  {(category === 'passenger'
                    ? SERVICES.filter((s) => s.category === 'passenger')
                    : SERVICES.filter((s) => s.category === 'cargo')
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectService(s.id)}
                      className="group flex flex-col items-center text-center bg-ink-800 border border-ink-700 rounded-2xl p-5 transition-all active:scale-[0.97] hover:border-brand-500/50"
                    >
                      <div className="flex items-center justify-center w-14 h-14 bg-ink-700 group-hover:bg-brand-500/15 rounded-xl mb-3 transition-colors">
                        <ServiceIcon type={s.icon} className="text-ink-200 group-hover:text-brand-400 transition-colors" size={26} />
                      </div>
                      <h3 className="font-semibold text-white text-sm">{s.labelKr}</h3>
                      <p className="text-xs text-ink-400 mt-1">{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'mytrips' && (
          <MyTripsTab trips={myTrips} api={api} />
        )}
      </div>

      {showForm && selectedService && (
        <RequestForm
          serviceId={selectedService}
          api={api}
          onClose={() => setShowForm(false)}
          onSubmitted={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}

function loadCustomerSession(): { name: string; phone: string } | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCustomerSession(name: string, phone: string) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ name, phone }));
}

function RequestForm({
  serviceId,
  api,
  onClose,
  onSubmitted,
}: {
  serviceId: ServiceType;
  api: AppApi;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !pickup.trim() || !destination.trim()) {
      showToast('Tanpri ranpli tout chan yo', 'error');
      return;
    }
    if (!customerPhoto) {
      showToast('Tanpri pran yon foto tèt ou pou sekirite', 'error');
      return;
    }
    setSubmitting(true);
    saveCustomerSession(name.trim(), phone.trim());
    api.createTrip({
      serviceType: serviceId,
      customer: { name: name.trim(), phone: phone.trim() },
      pickup: pickup.trim(),
      destination: destination.trim(),
      customerPhoto,
    });
    setTimeout(() => {
      setSubmitting(false);
      onSubmitted();
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink-900 flex flex-col animate-slide-up">
      <header className="px-5 py-4 border-b border-ink-700 flex items-center gap-3">
        <button onClick={onClose} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-white">Demande Kous</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="mb-6 p-4 bg-ink-800 rounded-xl border border-ink-700 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-500/15 rounded-lg">
            <ServiceIcon type={SERVICES.find((s) => s.id === serviceId)?.icon ?? 'Car'} className="text-brand-400" size={20} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{SERVICES.find((s) => s.id === serviceId)?.labelKr}</p>
            <p className="text-xs text-ink-400">Priyo a ap negosye avèk chofè a</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label-text">Non <span className="text-brand-500">*</span></label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input-field pl-11"
                placeholder="Non ou"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Nimewo Telefon <span className="text-brand-500">*</span></label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="tel"
                className="input-field pl-11"
                placeholder="egz: 509 3xxx xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Pwen repè kote l ye <span className="text-brand-500">*</span></label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input-field pl-11"
                placeholder="Kote ou ye kounye a"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Pwen repè kote l prale <span className="text-brand-500">*</span></label>
            <div className="relative">
              <Navigation size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input-field pl-11"
                placeholder="Kote w prale"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/30 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-brand-400 mt-0.5 shrink-0" />
            <p className="text-xs text-ink-300">
              Pou sekirite chofè a, ou dwe pran yon foto tèt ou. Chofè a ap wè foto sa a anvan l rive. Sa pwoteje tout moun.
            </p>
          </div>

          <PhotoUpload
            label="Foto Tèt Ou"
            description="Pran yon foto rapid tèt ou (selfie) pou chofè a ka konn w ou"
            onPhoto={setCustomerPhoto}
            required
          />
        </div>

        <div className="mt-8">
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Voye Demande'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessScreen({ onExit, onNewRequest }: { onExit: () => void; onNewRequest: () => void }) {
  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
      <div className="flex items-center justify-center w-24 h-24 bg-success-500/15 rounded-full mb-6 animate-bounce-in">
        <Check size={44} className="text-success-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Demande ou anrejistre!</h2>
      <p className="text-ink-300 text-sm max-w-xs mb-8">
        Yon chofè ki disponib ap wè demande ou epi l ap kontakte w nan aplikasyon an. Nimewo w pa ap janm parèt.
      </p>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <button onClick={onNewRequest} className="btn-primary w-full">Fè yon lòt demande</button>
        <button onClick={onExit} className="btn-ghost w-full">Akèye</button>
      </div>
    </div>
  );
}

function MyTripsTab({ trips, api }: { trips: Trip[]; api: AppApi }) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Inbox size={40} className="text-ink-600 mb-3" />
        <p className="text-ink-400 text-sm">Ou pa gen okenn kous ankò</p>
        <p className="text-ink-500 text-xs mt-1">Fè yon demande kous pou w kòmanse</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      <h2 className="text-sm font-semibold text-ink-300 mb-2">Kous Ou Yo</h2>
      {trips.map((trip) => (
        <CustomerTripCard key={trip.id} trip={trip} api={api} />
      ))}
    </div>
  );
}

function CustomerTripCard({ trip, api }: { trip: Trip; api: AppApi }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const service = getService(trip.serviceType);
  const needsFeedback = trip.status === 'finished' && trip.feedback === null;

  if (showFeedback && needsFeedback) {
    return <FeedbackScreen trip={trip} api={api} onDone={() => setShowFeedback(false)} />;
  }

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

      {trip.driverName && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-ink-900 rounded-lg">
          <User size={14} className="text-ink-400" />
          <span className="text-xs text-ink-300">Chofè: <span className="text-white font-medium">{trip.driverName}</span></span>
        </div>
      )}

      {trip.price !== null && (
        <div className="flex items-center justify-between mb-3 p-2.5 bg-ink-900 rounded-lg">
          <span className="text-xs text-ink-400">Priyo: <span className="text-white font-semibold">{formatHTG(trip.price)}</span></span>
        </div>
      )}

      {trip.feedback && (
        <div className={`p-3 rounded-xl border mb-3 ${trip.feedback.rating === 'good' ? 'bg-success-500/10 border-success-500/30' : 'bg-error-500/10 border-error-500/30'}`}>
          <div className="flex items-center gap-2 mb-1">
            {trip.feedback.rating === 'good' ? (
              <ThumbsUp size={14} className="text-success-500" />
            ) : (
              <ThumbsDown size={14} className="text-error-500" />
            )}
            <span className={`text-xs font-semibold ${trip.feedback.rating === 'good' ? 'text-success-500' : 'text-error-500'}`}>
              Feedback ou: {trip.feedback.rating === 'good' ? 'Tout byen pase' : 'Te gen pwoblèm'}
            </span>
          </div>
          <p className="text-xs text-ink-300">{trip.feedback.message}</p>
        </div>
      )}

      {needsFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} />
          Bay Feedback (Rapò)
        </button>
      )}

      {trip.status === 'pending' && (
        <div className="flex items-center justify-center gap-2 py-2 text-ink-400">
          <Clock size={16} className="animate-pulse" />
          <span className="text-xs">K ap tann yon chofè aksepte...</span>
        </div>
      )}
    </div>
  );
}

function FeedbackScreen({ trip, api, onDone }: { trip: Trip; api: AppApi; onDone: () => void }) {
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (!rating) {
      showToast('Tanpri chwazi si tout byen pase oswa te gen pwoblèm', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('Tanpri ekri yon mesaj', 'error');
      return;
    }
    setSubmitting(true);
    api.submitFeedback(trip.id, rating, message.trim());
    setTimeout(() => {
      setSubmitting(false);
      showToast('Mèsi pou feedback ou! Admin ap wè li.', 'success');
      onDone();
    }, 500);
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} className="text-brand-400" />
        <h3 className="font-bold text-white">Feedback Kous</h3>
      </div>
      <p className="text-sm text-ink-400 mb-4">
        Kous ou fini. Tanpri bay feedback pou Admin ka konnen si tout byen pase oswa si te gen yon pwoblèm.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setRating('good')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
            rating === 'good'
              ? 'border-success-500 bg-success-500/15'
              : 'border-ink-600 bg-ink-900 hover:border-ink-500'
          }`}
        >
          <ThumbsUp size={28} className={rating === 'good' ? 'text-success-500' : 'text-ink-400'} />
          <span className={`text-sm font-medium ${rating === 'good' ? 'text-success-500' : 'text-ink-300'}`}>
            Tout Byen Pase
          </span>
        </button>
        <button
          onClick={() => setRating('bad')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
            rating === 'bad'
              ? 'border-error-500 bg-error-500/15'
              : 'border-ink-600 bg-ink-900 hover:border-ink-500'
          }`}
        >
          <ThumbsDown size={28} className={rating === 'bad' ? 'text-error-500' : 'text-ink-400'} />
          <span className={`text-sm font-medium ${rating === 'bad' ? 'text-error-500' : 'text-ink-300'}`}>
            Te Gen Pwoblèm
          </span>
        </button>
      </div>

      <div className="mb-4">
        <label className="label-text">Mesaj pou Admin <span className="text-brand-500">*</span></label>
        <textarea
          className="input-field min-h-[100px] resize-none"
          placeholder="Rakonte koman kous la pase..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={onDone} className="btn-ghost flex-1">Soti</button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Voye Feedback</>}
        </button>
      </div>
    </div>
  );
}
