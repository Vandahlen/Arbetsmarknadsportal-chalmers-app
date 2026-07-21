import { useState } from 'react';
import { ListingsRepository, type ListingData } from '../services/ListingsRepository';

export default function AdminForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ListingData>({
    type: 'event',
    titleSv: '',
    titleEn: '',
    descriptionSv: '',
    descriptionEn: '',
    company: '',
    programs: [],
    location: '',
    status: 'draft',
    foodPreferences: false,
  });

  const handleChange = (field: keyof ListingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramToggle = (program: string) => {
    setFormData(prev => {
      const programs = prev.programs.includes(program)
        ? prev.programs.filter(p => p !== program)
        : [...prev.programs, program];
      return { ...prev, programs };
    });
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.titleSv || !formData.company) {
      alert('Please fill in required fields (Title and Company/Organizer).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, status };
      await ListingsRepository.create(payload, imageFile || undefined);
      alert(`Success! Listing saved as ${status}.`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen text-gray-800 font-sans">
      <h1 className="text-3xl font-bold mb-8">
        {formData.type === 'event' ? 'Skapa event' : 'Skapa annons'}
      </h1>

      {/* Type Selector */}
      <div className="flex gap-4 mb-8 pb-8 border-b">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="type" 
            checked={formData.type === 'event'} 
            onChange={() => handleChange('type', 'event')}
            className="text-blue-500"
          />
          Event (CHARM / Kommitté)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="type" 
            checked={formData.type === 'thesis'} 
            onChange={() => handleChange('type', 'thesis')}
            className="text-blue-500"
          />
          Examensarbete
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="type" 
            checked={formData.type === 'job'} 
            onChange={() => handleChange('type', 'job')}
            className="text-blue-500"
          />
          Jobb
        </label>
      </div>

      {/* Bilingual Two-Column Layout */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        {/* SWEDISH COLUMN */}
        <div className="space-y-6">
          <h2 className="font-bold text-lg border-b pb-2">Svenska</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Eventnamn / Titel</label>
            <input 
              type="text" 
              className="w-full border rounded p-2 bg-gray-50 focus:border-blue-500 focus:outline-none"
              placeholder="Ex: Arbetsmarknadsmässa"
              value={formData.titleSv}
              onChange={e => handleChange('titleSv', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Beskrivning</label>
            <textarea 
              className="w-full border rounded p-2 bg-gray-50 h-32 focus:border-blue-500 focus:outline-none"
              placeholder="Lorem ipsum..."
              value={formData.descriptionSv}
              onChange={e => handleChange('descriptionSv', e.target.value)}
            />
          </div>
        </div>

        {/* ENGLISH COLUMN */}
        <div className="space-y-6">
          <h2 className="font-bold text-lg border-b pb-2">Engelska</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Event Name / Title</label>
            <input 
              type="text" 
              className="w-full border rounded p-2 bg-gray-50 focus:border-blue-500 focus:outline-none"
              placeholder="Ex: Career Fair"
              value={formData.titleEn}
              onChange={e => handleChange('titleEn', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Description</label>
            <textarea 
              className="w-full border rounded p-2 bg-gray-50 h-32 focus:border-blue-500 focus:outline-none"
              placeholder="Lorem ipsum..."
              value={formData.descriptionEn}
              onChange={e => handleChange('descriptionEn', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Global Meta Data */}
      <div className="grid grid-cols-2 gap-12 mb-8 border-t pt-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Organisatör / Företag</label>
            <input 
              type="text" 
              className="w-full border rounded p-2 bg-gray-50"
              placeholder="Ex: CHARM eller Volvo Group"
              value={formData.company}
              onChange={e => handleChange('company', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Plats</label>
            <input 
              type="text" 
              className="w-full border rounded p-2 bg-gray-50"
              placeholder="Ex: RunAn, Chalmers"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Ladda upp Foto / Logotyp</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full border rounded p-2 bg-gray-50"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Målgrupp (Program)</label>
            <div className="flex flex-wrap gap-2">
              {['D', 'IT', 'F', 'M', 'V'].map(prog => (
                <button
                  key={prog}
                  type="button"
                  className={`px-4 py-1 rounded-full text-sm font-semibold border ${
                    formData.programs.includes(prog) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                  onClick={() => handleProgramToggle(prog)}
                >
                  {prog}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONDITIONAL EVENT FIELDS */}
      {formData.type === 'event' && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">Eventdetaljer</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">EVENT STARTAR</label>
                <input type="datetime-local" className="w-full border rounded p-2" onChange={e => handleChange('eventStart', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">EVENT SLUTAR</label>
                <input type="datetime-local" className="w-full border rounded p-2" onChange={e => handleChange('eventEnd', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">FRÅGA EFTER MATPREFERENSER?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="radio" checked={formData.foodPreferences} onChange={() => handleChange('foodPreferences', true)} /> Ja</label>
                <label className="flex items-center gap-2"><input type="radio" checked={!formData.foodPreferences} onChange={() => handleChange('foodPreferences', false)} /> Nej</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL JOB FIELDS */}
      {formData.type !== 'event' && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-4 uppercase text-sm tracking-wide">Företag / Ansökningsdetaljer</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">KONTAKTPERSON (NAMN)</label>
              <input type="text" className="w-full border rounded p-2" value={formData.contactName || ''} onChange={e => handleChange('contactName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ANSÖKNINGSLÄNK (URL)</label>
              <input type="url" className="w-full border rounded p-2" value={formData.applicationUrl || ''} onChange={e => handleChange('applicationUrl', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 border-t pt-6 mt-12">
        <button 
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
          className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
        >
          Spara utkast
        </button>
        <button 
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={isSubmitting}
          className="px-6 py-2 rounded bg-[#00ACFF] text-white font-semibold hover:bg-blue-600 flex items-center justify-center min-w-[140px]"
        >
          {isSubmitting ? 'Sparar...' : 'Publicera'}
        </button>
      </div>
    </div>
  );
}