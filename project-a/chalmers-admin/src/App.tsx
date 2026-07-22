import { useState } from 'react';
import AdminForm from './components/AdminForm';
import ArchiveList from './components/ArchiveList';
import { type ListingData } from './services/ListingsRepository';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'archive'>('form');
  const [editingItem, setEditingItem] = useState<ListingData | null>(null);

  const handleEdit = (item: ListingData) => {
    setEditingItem(item);
    setCurrentView('form');
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setCurrentView('form');
  };

  const handleArchiveView = () => {
    setEditingItem(null);
    setCurrentView('archive');
  };

  const handleSuccess = () => {
    setEditingItem(null);
    setCurrentView('archive');
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-gray-800">
      {/* SIDEBAR MOCKUP */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col pt-6 pb-8 h-screen sticky top-0">
        <div className="px-6 mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-2 flex items-center justify-center text-[#00ACFF] font-bold text-xs text-center border-2 border-[#00ACFF]">
            CS
          </div>
          <span className="font-bold text-sm text-center">
            CHALMERS
            <br />
            STUDENTKÅR
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-4 text-sm font-semibold text-gray-600">
          <div className="py-2 px-4 mt-2 rounded hover:bg-gray-50 flex justify-between items-center text-[#00ACFF]">
            <span>Innehåll</span>
          </div>

          <button
            onClick={handleCreateNew}
            className={`py-1.5 px-8 text-xs rounded text-left ${currentView === 'form' && !editingItem ? 'text-[#00ACFF] bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            Skapa annons / event
          </button>

          <button
            onClick={handleArchiveView}
            className={`py-1.5 px-8 text-xs rounded text-left ${currentView === 'archive' ? 'text-[#00ACFF] bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            Arkiv (Alla inlägg)
          </button>
        </nav>

        <div className="mt-auto px-6 flex flex-col items-center border-t border-gray-100 pt-6">
          <div className="w-10 h-10 bg-gray-200 rounded-full mb-2"></div>
          <span className="text-xs font-semibold text-gray-500 mb-4">Superadmin</span>
          <button className="text-red-500 font-bold text-sm hover:underline">Logga ut</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex p-8">
        {currentView === 'form' ? (
          <AdminForm
            initialData={editingItem}
            onSuccess={handleSuccess}
          />
        ) : (
          <ArchiveList onEdit={handleEdit} />
        )}
      </main>
    </div>
  );
}