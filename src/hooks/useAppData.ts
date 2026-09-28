import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppData, Driver, Trip, ChatMessage, TripStatus, FeedbackReport } from '@/types';
import { loadData, saveData, generateId } from '@/lib/storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const addDriver = useCallback((name: string, phone: string, idPhoto: string, selfiePhoto: string): Driver => {
    const driver: Driver = {
      id: generateId(),
      name,
      phone,
      active: false,
      debt: 0,
      createdAt: Date.now(),
      idPhoto,
      selfiePhoto,
    };
    setData((prev) => ({ ...prev, drivers: [...prev.drivers, driver] }));
    return driver;
  }, []);

  const getDriver = useCallback((id: string): Driver | undefined => {
    return dataRef.current.drivers.find((d) => d.id === id);
  }, []);

  const updateDriver = useCallback((id: string, patch: Partial<Driver>) => {
    setData((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const createTrip = useCallback((trip: Omit<Trip, 'id' | 'createdAt' | 'messages' | 'status' | 'driverId' | 'driverName' | 'price' | 'commission' | 'acceptedAt' | 'finishedAt' | 'feedback'>) => {
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      status: 'pending',
      driverId: null,
      driverName: null,
      price: null,
      commission: null,
      createdAt: Date.now(),
      acceptedAt: null,
      finishedAt: null,
      messages: [],
      feedback: null,
    };
    setData((prev) => ({ ...prev, trips: [newTrip, ...prev.trips] }));
    return newTrip;
  }, []);

  const acceptTrip = useCallback((tripId: string, driverId: string, driverName: string) => {
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, status: 'accepted' as TripStatus, driverId, driverName, acceptedAt: Date.now() } : t
      ),
    }));
  }, []);

  const setTripPrice = useCallback((tripId: string, price: number) => {
    const commission = Math.round(price * 0.1 * 100) / 100;
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, price, commission } : t
      ),
    }));
    return commission;
  }, []);

  const updateTripStatus = useCallback((tripId: string, status: TripStatus) => {
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => {
        if (t.id !== tripId) return t;
        const patch: Partial<Trip> = { status };
        if (status === 'in_progress') patch.acceptedAt = patch.acceptedAt ?? t.acceptedAt;
        if (status === 'finished') patch.finishedAt = Date.now();
        return { ...t, ...patch };
      }),
    }));
  }, []);

  const addMessage = useCallback((tripId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMsg: ChatMessage = { ...msg, id: generateId(), timestamp: Date.now() };
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, messages: [...t.messages, fullMsg] } : t
      ),
    }));
  }, []);

  const submitFeedback = useCallback((tripId: string, rating: 'good' | 'bad', message: string) => {
    const report: FeedbackReport = {
      id: generateId(),
      tripId,
      rating,
      message,
      createdAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, feedback: report } : t
      ),
    }));
  }, []);

  const getTrip = useCallback((id: string): Trip | undefined => {
    return dataRef.current.trips.find((t) => t.id === id);
  }, []);

  return {
    data,
    addDriver,
    getDriver,
    updateDriver,
    createTrip,
    acceptTrip,
    setTripPrice,
    updateTripStatus,
    addMessage,
    submitFeedback,
    getTrip,
    update,
  };
}

export type AppApi = ReturnType<typeof useAppData>;
