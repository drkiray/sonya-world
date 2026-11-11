import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppState } from './state/AppContext';

const Home = lazy(() => import('./screens/Home'));
const Collection = lazy(() => import('./screens/Collection'));
const PetDetail = lazy(() => import('./screens/PetDetail'));
const AddPet = lazy(() => import('./screens/AddPet'));
const Quests = lazy(() => import('./screens/Quests'));
const Shop = lazy(() => import('./screens/Shop'));
const Profile = lazy(() => import('./screens/Profile'));
const Parent = lazy(() => import('./screens/parent/Parent'));

function Splash() {
  return (
    <div className="flex h-full items-center justify-center bg-night">
      <div className="animate-floaty text-center">
        <img src="./icons/icon.svg" alt="Мир Сонечки" className="mx-auto h-24 w-24" />
        <p className="mt-3 text-xl font-black text-white">Мир Сонечки</p>
        <p className="text-sm font-bold text-white/50">Открываем портал…</p>
      </div>
    </div>
  );
}

export default function App() {
  const state = useAppState();
  const location = useLocation();
  if (!state.ready) return <div className="app-shell"><Splash /></div>;

  const isParent = location.pathname.startsWith('/parent');

  return (
    <div className="app-shell">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center bg-mist">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-grape border-t-transparent" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/new" element={<AddPet />} />
            <Route path="/collection/:id" element={<PetDetail />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/parent/*" element={<Parent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!isParent && <BottomNav />}
    </div>
  );
}
