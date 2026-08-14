import React, { useState } from 'react';
import { X, Building2, Plus, Sparkles, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { Project } from '../../types';
import { store } from '../../lib/store';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProj: Project) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [area, setArea] = useState('DHA Phase 2');
  const [startingPrice, setStartingPrice] = useState(15000000);
  const [type, setType] = useState('Commercial High-Rise Tower');
  const [status, setStatus] = useState<'upcoming' | 'under_construction' | 'completed'>('under_construction');
  const [completionDate, setCompletionDate] = useState('December 2027');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80');
  const [downPayment, setDownPayment] = useState('15% Down Payment (PKR 2.25M)');
  const [installments, setInstallments] = useState('36 Monthly Installments');
  const [possession, setPossession] = useState('20% On Physical Possession');
  const [totalUnits, setTotalUnits] = useState(120);
  const [availableUnits, setAvailableUnits] = useState(45);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Baraye meharbani Project ka Title aur Description enter karein.');
      return;
    }

    const currentRole = store.currentUser.role;
    if (currentRole === 'guest') {
      alert('Baraye meharbani pehle sign in karein ya role choose karein.');
      return;
    }

    const formattedPrice = `PKR ${(startingPrice / 10000000).toFixed(2)} Crore`;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      builderId: store.currentUser.id || 'builder-1',
      builderName: store.currentUser.name || 'Imperial Builders & Marketing Co.',
      builderLogo: store.currentUser.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      city,
      area,
      startingPrice,
      startingPriceFormatted: formattedPrice,
      type,
      status,
      completionDate,
      description,
      images: [imageUrl],
      paymentPlan: {
        downPayment,
        installments,
        possession
      },
      totalUnits,
      availableUnits
    };

    store.addProject(newProject);
    onProjectCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-2xl rounded-3xl p-6 border border-orange-500/30 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Launch New Mega Project</h3>
              <p className="text-xs text-slate-400">Exclusive access for Builders & Marketing Companies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Imarat Sky Towers"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Category / Type</label>
              <input
                type="text"
                required
                placeholder="e.g. Commercial High-Rise / Gated Community"
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">City</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Faisalabad', 'Multan'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Area / Sector</label>
              <input
                type="text"
                required
                placeholder="e.g. DHA Phase 2 / Gulberg Greens"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Starting Price (PKR)</label>
              <input
                type="number"
                required
                placeholder="e.g. 15000000"
                value={startingPrice === 0 ? '' : startingPrice}
                onChange={e => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, '');
                  setStartingPrice(raw === '' ? 0 : Number(raw));
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Down Payment Details</label>
              <input
                type="text"
                value={downPayment}
                onChange={e => setDownPayment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Installment Plan</label>
              <input
                type="text"
                value={installments}
                onChange={e => setInstallments(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Possession Term</label>
              <input
                type="text"
                value={possession}
                onChange={e => setPossession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Total Project Units</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={totalUnits === 0 ? '' : totalUnits}
                onChange={e => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, '');
                  setTotalUnits(raw === '' ? 0 : Number(raw));
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Available Inventory Units</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={availableUnits === 0 ? '' : availableUnits}
                onChange={e => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, '');
                  setAvailableUnits(raw === '' ? 0 : Number(raw));
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Banner Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Project Description & Amenities</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the mega project, RDA/CDA NOC details, 3D architectural rendering, amenities..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gradient-btn text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Mega Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
