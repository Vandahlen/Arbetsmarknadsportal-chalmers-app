import { useEffect, useState } from 'react';
import { ListingsRepository, type ListingData } from '../services/ListingsRepository';

interface ArchiveListProps {
  onEdit: (listing: ListingData) => void;
}

export default function ArchiveList({ onEdit }: ArchiveListProps) {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await ListingsRepository.getAll();
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Är du säker på att du vill radera denna annons permanent?")) {
      try {
        await ListingsRepository.delete(id);
        setListings(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Kunde inte radera annonsen.");
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 w-full mt-20">Laddar arkiv...</div>;

  return (
    <div className="flex-1 p-12 bg-white max-w-6xl mx-auto shadow-sm my-4 border border-gray-100 rounded-lg text-gray-800 w-full h-fit">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Arkiv (Alla annonser)</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
            <tr>
              <th className="px-6 py-4">Titel</th>
              <th className="px-6 py-4">Typ</th>
              <th className="px-6 py-4">Organisatör</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.titleSv}</td>
                <td className="px-6 py-4 capitalize">{item.type}</td>
                <td className="px-6 py-4">{item.company}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEdit(item)} className="text-[#00ACFF] hover:underline mr-4 font-semibold">Redigera</button>
                  <button onClick={() => item.id && handleDelete(item.id)} className="text-red-500 hover:underline font-semibold">Radera</button>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Inga annonser hittades.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}