import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Landing } from '@/views/Landing';
import { CustomerView } from '@/views/CustomerView';
import { DriverView } from '@/views/DriverView';
import { AdminView } from '@/views/AdminView';
import { ToastHost } from '@/components/Toast';

type Role = 'landing' | 'customer' | 'driver' | 'admin';

function App() {
  const [role, setRole] = useState<Role>('landing');
  const api = useAppData();

  return (
    <>
      <div className="max-w-md mx-auto min-h-screen bg-ink-900 relative">
        {role === 'landing' && <Landing onSelect={(r) => setRole(r)} />}
        {role === 'customer' && <CustomerView api={api} onExit={() => setRole('landing')} />}
        {role === 'driver' && <DriverView api={api} onExit={() => setRole('landing')} />}
        {role === 'admin' && <AdminView api={api} onExit={() => setRole('landing')} />}
      </div>
      <ToastHost />
    </>
  );
}

export default App;
