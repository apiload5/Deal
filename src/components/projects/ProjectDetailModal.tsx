import React from 'react';
import { X, MapPin, Calendar, Layers, Download, CheckCircle2, Building2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenBookingModal: (proj: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenBookingModal
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-4xl rounded-3xl p-6 border border-orange-500/30 max-h-[85vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <img src={project.builderLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
            <div>
              <h2 className="text-lg font-black text-white">{project.title}</h2>
              <p className="text-xs text-slate-400 flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400 mr-1" />
                <span>{project.area}, {project.city}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Box */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.images.map((img, i) => (
            <div key={i} className="h-52 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img src={img} alt="Project" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Pricing & Installment Plan Card */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prices Starting From</p>
              <p className="text-2xl font-black text-white gradient-text">{project.startingPriceFormatted}</p>
            </div>
            <button
              onClick={() => onOpenBookingModal(project as any)}
              className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
            >
              Book Project Unit (Escrow Protected)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Down Payment</p>
              <p className="font-bold text-orange-400 mt-1">{project.paymentPlan.downPayment}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Installments</p>
              <p className="font-bold text-amber-400 mt-1">{project.paymentPlan.installments}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Completion</p>
              <p className="font-bold text-white mt-1">{project.completionDate}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {project.description}
          </p>

          {/* Bank Home Financing & Official NOC Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Building2 className="w-4 h-4 text-orange-400 mr-1.5" />
              Approved Bank Home Financing & Easy Installments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-orange-400 font-bold">Meezan Bank Easy Home</span>
                <p className="text-slate-400 text-[11px]">Up to 20 years Diminishing Musharakah financing with 0% pre-penalty.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold">HBL Islamic Home Finance</span>
                <p className="text-slate-400 text-[11px]">75% property value loan with instant pre-approval for RDA overseas Pakistanis.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloading official Payment Plan Brochure for ${project.title}`)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-orange-400" />
                  <span>Payment Plan PDF</span>
                </button>
              </div>

              <span className="text-[11px] text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved Project
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
