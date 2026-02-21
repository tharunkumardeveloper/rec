import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import ConnectionsPage from '@/components/social/ConnectionsPage';
import EnhancedProfilePage from '@/components/social/EnhancedProfilePage';
import BottomNav from '@/components/navigation/BottomNav';

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/profile/:userId" element={<EnhancedProfilePage />} />
        <Route path="/profile" element={<EnhancedProfilePage />} />
      </Routes>
      <BottomNav />
    </>
  );
}
