import { useState, useEffect } from 'react';
import { ListingsRepository, type ListingData } from '../services/ListingsRepository';

interface AdminFormProps {
  initialData?: ListingData | null;
  onSuccess?: () => void;
}

export default function AdminForm({ initialData, onSuccess }: AdminFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ListingData>({
    type: 'thesis', titleSv: '', titleEn: '', descriptionSv: '', descriptionEn: '',
    company: '', programs: [], location: '', status: 'draft', workFormat: 'onsite',
    workLoad: 'full-time', keywords: '', applicationDeadline: '', term: 'HT',
    foodPreferences: false, applicationUrl: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof ListingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramToggle = (program: string) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.includes(program) ? prev.programs.filter(p => p !== program) : [...prev.programs, program]
    }));
  };

  const handleClearForm = () => {
    if (window.confirm("Är du säker på att du vill rensa formuläret?")) {
      setFormData({
        type: 'thesis', titleSv: '', titleEn: '', descriptionSv: '', descriptionEn: '', company: '', programs: [], location: '', status: 'draft', workFormat: 'onsite', workLoad: 'full-time', keywords: '', applicationDeadline: '', term: 'HT', foodPreferences: false, applicationUrl: '',
      });
      setLogoFile(null);
      setCoverFile(null);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.titleSv || !formData.company) return alert('Fyll i obligatoriska fält (Titel och Organisatör).');
    
    setIsSubmitting(true);
    try {
      const payload = { ...formData, status };
      if (initialData?.id) {
        await ListingsRepository.update(initialData.id, payload, logoFile, coverFile);
        alert(`Uppdaterad som ${status}.`);
      } else {
        await ListingsRepository.create(payload, logoFile, coverFile);
        alert(`Sparad som ${status}.`);
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert(`Fel: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-12 bg-white max-w-6xl mx-auto shadow-sm my-4 border border-gray-100 rounded-lg text-gray-800">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">{initialData ? 'Redigera annons' : 'Skapa event / annons'}</h1>

      {/* TYPE SELECTOR */}
      <div className="flex gap-6 mb-10 pb-6 border-b border-gray-100 text-sm">
        {[
          { id: 'thesis', label: 'Examensarbete' },
          { id: 'job', label: 'Jobb' },
          { id: 'mentorship', label: 'Mentorskap' },
          { id: 'event', label: 'Event / Kommitté' }
        ].map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.type === opt.id ? 'border-[#00ACFF]' : 'border-gray-300'}`}>
              {formData.type === opt.id && <div className="w-2 h-2 bg-[#00ACFF] rounded-full"></div>}
            </div>
            <input type="radio" className="hidden" checked={formData.type === opt.id} onChange={() => handleChange('type', opt.id)} />
            {opt.label}
          </label>
        ))}
      </div>

      {/* BILINGUAL COLUMNS */}
      <div className="grid grid-cols-2 gap-10 mb-8">
        <div className="space-y-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Svenska</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Titel / Namn</label>
            <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none" value={formData.titleSv} onChange={e => handleChange('titleSv', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Beskrivning</label>
            <textarea className="w-full border border-gray-300 rounded p-2.5 text-sm h-32 outline-none resize-none" value={formData.descriptionSv} onChange={e => handleChange('descriptionSv', e.target.value)} />
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Engelska</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title / Name</label>
            <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none" value={formData.titleEn} onChange={e => handleChange('titleEn', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</label>
            <textarea className="w-full border border-gray-300 rounded p-2.5 text-sm h-32 outline-none resize-none" value={formData.descriptionEn} onChange={e => handleChange('descriptionEn', e.target.value)} />
          </div>
        </div>
      </div>

      {/* GENERAL META DATA */}
      <div className="grid grid-cols-2 gap-10 mb-8 pt-8 border-t border-gray-100">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Organisatör / Företag</label>
            <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none" value={formData.company} onChange={e => handleChange('company', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Plats</label>
            <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Logotyp (Valfri)</label>
            <input type="file" accept="image/*" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-[#00ACFF]" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Omslagsfoto (Valfri)</label>
            <input type="file" accept="image/*" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-[#00ACFF]" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>

      {/* EXJOBB / JOBB / MENTORSHIP SPECIFIC FIELDS */}
      {formData.type !== 'event' && (
        <div className="bg-blue-50/50 p-6 rounded-lg mb-8 border border-blue-100 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Arbetsform</label>
              <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.workFormat} onChange={e => handleChange('workFormat', e.target.value)}>
                <option value="onsite">På plats</option><option value="remote">Distans (Remote)</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Omfattning</label>
              <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.workLoad} onChange={e => handleChange('workLoad', e.target.value)}>
                <option value="full-time">Heltid</option><option value="part-time">Deltid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Period</label>
              <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.term} onChange={e => handleChange('term', e.target.value)}>
                <option value="HT">Hösttermin (HT)</option><option value="VT">Vårtermin (VT)</option><option value="Båda">Båda / Löpande</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Sista ansökningsdatum</label>
              <input type="date" className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.applicationDeadline || ''} onChange={e => handleChange('applicationDeadline', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Länk eller kontakt</label>
              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.applicationUrl || ''} onChange={e => handleChange('applicationUrl', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Keywords (Separera med kommatecken)</label>
            <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={formData.keywords || ''} onChange={e => handleChange('keywords', e.target.value)} />
          </div>
        </div>
      )}

      {/* TARGET PROGRAMS */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Målgrupp (Program)</label>
        <div className="flex flex-wrap gap-2">
          {['D', 'IT', 'F', 'M', 'V', 'Z', 'K', 'I', 'E'].map(prog => (
            <button key={prog} type="button" onClick={() => handleProgramToggle(prog)} className={`w-10 h-10 rounded text-sm font-bold border ${formData.programs.includes(prog) ? 'bg-[#00ACFF] text-white border-[#00ACFF]' : 'bg-white text-gray-500'}`}>{prog}</button>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 border-t border-gray-100 pt-8 mt-10">
        <button type="button" onClick={handleClearForm} className="px-6 py-2.5 rounded-full border border-gray-300 text-[#00ACFF] text-sm font-semibold hover:bg-gray-50">Rensa formuläret</button>
        <button type="button" onClick={() => handleSubmit('draft')} disabled={isSubmitting} className="px-6 py-2.5 rounded-full border border-gray-300 text-[#00ACFF] text-sm font-semibold hover:bg-gray-50">Spara utkast</button>
        <button type="button" onClick={() => handleSubmit('published')} disabled={isSubmitting} className="px-8 py-2.5 rounded-full bg-[#00ACFF] text-white text-sm font-bold hover:bg-blue-500 shadow-sm ml-auto">
          {isSubmitting ? 'Sparar...' : initialData ? 'Spara ändringar' : 'Publicera'}
        </button>
      </div>
    </div>
  );
}