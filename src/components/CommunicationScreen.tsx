import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Send, Phone, PhoneOff, Mic, Square, Play, Pause,
  MapPin, Navigation, Lock, Check, User, Headphones, Camera,
} from 'lucide-react';
import type { AppApi } from '@/hooks/useAppData';
import type { Driver, Trip } from '@/types';
import { getService, formatHTG, formatTime } from '@/lib/storage';
import { ServiceIcon } from '@/components/ServiceIcon';
import { showToast } from '@/components/Toast';

interface CommProps {
  trip: Trip;
  driver: Driver;
  api: AppApi;
  onClose: () => void;
}

type CommTab = 'chat' | 'call';

export function CommunicationScreen({ trip, driver, api, onClose }: CommProps) {
  const [tab, setTab] = useState<CommTab>('chat');
  const service = getService(trip.serviceType);

  return (
    <div className="fixed inset-0 z-50 bg-ink-900 flex flex-col animate-slide-in">
      {/* Header */}
      <header className="px-4 py-3 border-b border-ink-700 flex items-center gap-3 bg-ink-800">
        <button onClick={onClose} className="p-2 -ml-2 text-ink-300 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center justify-center w-9 h-9 bg-brand-500/15 rounded-lg">
          <ServiceIcon type={service?.icon ?? 'Car'} className="text-brand-400" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">{service?.labelKr}</h1>
          <div className="flex items-center gap-1">
            <Lock size={11} className="text-success-500" />
            <p className="text-xs text-success-500">Ekran Sekirize — Nimewo kache</p>
          </div>
        </div>
      </header>

      {/* Trip info bar */}
      <div className="px-4 py-2.5 bg-ink-800/50 border-b border-ink-700 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <MapPin size={12} className="text-success-500 shrink-0" />
          <span className="text-ink-200 truncate">{trip.pickup}</span>
        </div>
        <div className="w-4 h-px bg-ink-600" />
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Navigation size={12} className="text-brand-500 shrink-0" />
          <span className="text-ink-200 truncate">{trip.destination}</span>
        </div>
      </div>

      {/* Customer photo */}
      {trip.customerPhoto && (
        <div className="px-4 py-3 bg-ink-800/30 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-ink-600 shrink-0">
              <img src={trip.customerPhoto} alt="Kliyan" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-brand-400 font-medium flex items-center gap-1">
                <Camera size={12} /> Foto Kliyan
              </p>
              <p className="text-xs text-ink-400 mt-0.5">Moun w ap pran: {trip.customer.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-ink-700">
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === 'chat' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-ink-400'}`}
        >
          <Send size={16} /> Ekri
        </button>
        <button
          onClick={() => setTab('call')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === 'call' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-ink-400'}`}
        >
          <Phone size={16} /> Apèl
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'chat' ? (
          <ChatPanel trip={trip} driver={driver} api={api} />
        ) : (
          <CallPanel trip={trip} driver={driver} api={api} />
        )}
      </div>

      {/* Price + Status footer */}
      <PriceFooter trip={trip} driver={driver} api={api} />
    </div>
  );
}

function ChatPanel({ trip, driver, api }: { trip: Trip; driver: Driver; api: AppApi }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [trip.messages.length]);

  function sendText() {
    if (!text.trim()) return;
    api.addMessage(trip.id, { sender: 'driver', text: text.trim(), type: 'text' });
    setText('');
  }

  function startRecording() {
    setRecording(true);
    setRecordDuration(0);
    recordTimer.current = setInterval(() => {
      setRecordDuration((d) => d + 1);
    }, 1000);
  }

  function stopRecording(send: boolean) {
    if (recordTimer.current) clearInterval(recordTimer.current);
    if (send && recordDuration > 0) {
      api.addMessage(trip.id, {
        sender: 'driver',
        text: 'Audio message',
        type: 'audio',
        audioDuration: recordDuration,
      });
      showToast('Audio message voye', 'success');
    }
    setRecording(false);
    setRecordDuration(0);
  }

  useEffect(() => {
    return () => { if (recordTimer.current) clearInterval(recordTimer.current); };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink-700 rounded-full text-xs text-ink-400">
            <Lock size={11} /> Nimewo w yo pwoteje. Sèlman non yo parèt.
          </span>
        </div>
        {trip.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Send size={32} className="text-ink-600 mb-2" />
            <p className="text-ink-400 text-sm">Voye premye mesaj la</p>
          </div>
        )}
        {trip.messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-ink-700 bg-ink-800">
        {recording ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => stopRecording(false)}
              className="flex items-center justify-center w-10 h-10 bg-error-500/20 rounded-full shrink-0"
            >
              <Square size={18} className="text-error-500" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error-500 animate-pulse" />
              <span className="text-sm text-ink-300">Anrejistre... {Math.floor(recordDuration / 60)}:{String(recordDuration % 60).padStart(2, '0')}</span>
            </div>
            <button
              onClick={() => stopRecording(true)}
              className="flex items-center justify-center w-10 h-10 bg-brand-500 rounded-full shrink-0 active:scale-90 transition-transform"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={startRecording}
              className="flex items-center justify-center w-10 h-10 bg-ink-700 rounded-full shrink-0 hover:bg-ink-600 transition-colors active:scale-90"
            >
              <Mic size={18} className="text-brand-400" />
            </button>
            <input
              className="flex-1 bg-ink-900 border border-ink-600 rounded-full px-4 py-2.5 text-white text-sm placeholder-ink-400 focus:border-brand-500 outline-none transition-all"
              placeholder="Ekri mesaj..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendText(); }}
            />
            <button
              onClick={sendText}
              disabled={!text.trim()}
              className="flex items-center justify-center w-10 h-10 bg-brand-500 rounded-full shrink-0 active:scale-90 transition-transform disabled:opacity-40"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Trip['messages'][number] }) {
  const isDriver = msg.sender === 'driver';
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function togglePlay() {
    if (playing) {
      if (playTimer.current) clearInterval(playTimer.current);
      setPlaying(false);
      setProgress(0);
      return;
    }
    setPlaying(true);
    const duration = msg.audioDuration ?? 5;
    let elapsed = 0;
    playTimer.current = setInterval(() => {
      elapsed += 0.1;
      setProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed >= duration) {
        if (playTimer.current) clearInterval(playTimer.current);
        setPlaying(false);
        setProgress(0);
      }
    }, 100);
  }

  useEffect(() => { return () => { if (playTimer.current) clearInterval(playTimer.current); }; }, []);

  if (msg.type === 'audio') {
    return (
      <div className={`flex ${isDriver ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] ${isDriver ? 'bg-brand-500' : 'bg-ink-700'} rounded-2xl px-3 py-2.5`}>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${isDriver ? 'bg-white/20' : 'bg-ink-600'}`}
            >
              {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
            </button>
            <div className="flex-1 min-w-[100px]">
              <div className="flex items-center gap-0.5 h-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all ${isDriver ? 'bg-white/40' : 'bg-ink-400'}`}
                    style={{ height: `${20 + Math.sin(i * 0.8) * 60}%`, opacity: progress > (i / 18) * 100 ? 1 : 0.5 }}
                  />
                ))}
              </div>
              <p className={`text-xs mt-0.5 ${isDriver ? 'text-white/70' : 'text-ink-400'}`}>
                {Math.floor((msg.audioDuration ?? 5) / 60)}:{String((msg.audioDuration ?? 5) % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
          <p className={`text-xs mt-1 ${isDriver ? 'text-white/60' : 'text-ink-500'}`}>{formatTime(msg.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isDriver ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isDriver ? 'bg-brand-500' : 'bg-ink-700'} rounded-2xl px-3.5 py-2.5`}>
        <p className={`text-sm ${isDriver ? 'text-white' : 'text-ink-100'}`}>{msg.text}</p>
        <p className={`text-xs mt-1 ${isDriver ? 'text-white/60' : 'text-ink-500'}`}>{formatTime(msg.timestamp)}</p>
      </div>
    </div>
  );
}

function CallPanel({ trip, driver, api }: { trip: Trip; driver: Driver; api: AppApi }) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [duration, setDuration] = useState(0);
  const callTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCall() {
    setCallState('calling');
    setTimeout(() => {
      setCallState('connected');
      callTimer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }, 2000);
  }

  function endCall() {
    if (callTimer.current) clearInterval(callTimer.current);
    setCallState('ended');
    setDuration(0);
    setTimeout(() => setCallState('idle'), 1500);
  }

  useEffect(() => { return () => { if (callTimer.current) clearInterval(callTimer.current); }; }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Privacy note */}
      <div className="mb-8 flex items-center gap-1.5 px-3 py-1.5 bg-success-500/10 rounded-full">
        <Lock size={13} className="text-success-500" />
        <span className="text-xs text-success-500">Apèl sekirize — Nimewo kache</span>
      </div>

      {/* Avatar */}
      <div className="relative mb-6">
        {callState === 'connected' && (
          <div className="absolute inset-0 rounded-full bg-success-500/30 animate-pulse-ring" />
        )}
        <div className="relative flex items-center justify-center w-28 h-28 bg-ink-700 rounded-full">
          <User size={48} className="text-ink-300" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-1">{trip.customer.name}</h2>
      <p className="text-ink-400 text-sm mb-1">Kliyan</p>
      <p className="text-ink-500 text-xs flex items-center gap-1">
        <Lock size={11} /> Nimewo kache
      </p>

      {/* Status */}
      <div className="mt-4 mb-8 text-center">
        {callState === 'idle' && <p className="text-ink-400 text-sm">Pou kòmanse apèl</p>}
        {callState === 'calling' && (
          <p className="text-brand-400 text-sm animate-pulse">K ap sonnen...</p>
        )}
        {callState === 'connected' && (
          <p className="text-success-500 text-sm font-mono">
            {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
          </p>
        )}
        {callState === 'ended' && <p className="text-ink-400 text-sm">Apèl fini</p>}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {callState === 'idle' || callState === 'ended' ? (
          <button
            onClick={startCall}
            className="flex items-center justify-center w-16 h-16 bg-success-500 rounded-full active:scale-90 transition-transform shadow-lg shadow-success-500/30"
          >
            <Phone size={28} className="text-white" />
          </button>
        ) : (
          <button
            onClick={endCall}
            className="flex items-center justify-center w-16 h-16 bg-error-500 rounded-full active:scale-90 transition-transform shadow-lg shadow-error-500/30"
          >
            <PhoneOff size={28} className="text-white" />
          </button>
        )}
      </div>

      {/* Audio message hint */}
      <div className="mt-10 p-3 bg-ink-800 rounded-xl border border-ink-700 flex items-start gap-2.5 max-w-xs">
        <Headphones size={18} className="text-brand-400 mt-0.5 shrink-0" />
        <p className="text-xs text-ink-300">
          Ou ka voye yon audio message tou. Retounen nan tab "Ekri" epi pese bouton mikwo a.
        </p>
      </div>
    </div>
  );
}

function PriceFooter({ trip, driver, api }: { trip: Trip; driver: Driver; api: AppApi }) {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [priceValue, setPriceValue] = useState('');

  function submitPrice() {
    const price = parseFloat(priceValue);
    if (isNaN(price) || price <= 0) {
      showToast('Tanpri antre yon priyo valid', 'error');
      return;
    }
    const commission = api.setTripPrice(trip.id, price);
    showToast(`Priyo: ${formatHTG(price)} · Komisyon EDDEX: ${formatHTG(commission)}`, 'success');
    setShowPriceInput(false);
    setPriceValue('');
  }

  function handlePickup() {
    api.updateTripStatus(trip.id, 'in_progress');
    showToast('Moun an pran. Kous an pwogre.', 'success');
  }

  function handleFinish() {
    api.updateTripStatus(trip.id, 'finished');
    const updatedTrip = api.getTrip(trip.id);
    const commission = updatedTrip?.commission ?? 0;
    api.updateDriver(driver.id, { debt: driver.debt + commission });
    showToast(`Kous fini! ${formatHTG(commission)} ajoute nan dèt ou.`, 'success');
  }

  return (
    <div className="border-t border-ink-700 bg-ink-800 px-4 py-3">
      {trip.price === null ? (
        showPriceInput ? (
          <div className="animate-fade-in">
            <label className="label-text">Antre priyo negosye a (HTG)</label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                className="input-field flex-1"
                placeholder="egz: 500"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitPrice(); }}
                autoFocus
              />
              <button onClick={submitPrice} className="btn-primary px-4">
                <Check size={20} />
              </button>
            </div>
            <p className="text-xs text-ink-400 mt-2">Komisyon 10% EDDEX ap kalkile otomatikman.</p>
          </div>
        ) : (
          <button onClick={() => setShowPriceInput(true)} className="btn-primary w-full">
            Antre Priyo Negosye a
          </button>
        )
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3 p-3 bg-ink-900 rounded-xl">
            <div>
              <p className="text-xs text-ink-400">Priyo</p>
              <p className="text-lg font-bold text-white">{formatHTG(trip.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-400">Komisyon EDDEX (10%)</p>
              <p className="text-lg font-bold text-brand-400">{trip.commission ? formatHTG(trip.commission) : '-'}</p>
            </div>
          </div>
          {trip.status === 'accepted' && (
            <button onClick={handlePickup} className="btn-primary w-full">
              Pran Moun
            </button>
          )}
          {trip.status === 'in_progress' && (
            <button onClick={handleFinish} className="btn-primary w-full">
              Fini
            </button>
          )}
          {trip.status === 'finished' && (
            <div className="flex items-center justify-center gap-2 py-2 text-success-500">
              <Check size={20} />
              <span className="font-semibold">Kous Fini</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
