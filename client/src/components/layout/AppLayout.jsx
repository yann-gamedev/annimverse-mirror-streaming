import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      {/* pt-16 offsets the fixed navbar height */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
