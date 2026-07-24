import React, { useState } from 'react';
import { Calculator, Percent, Calendar, DollarSign, PieChart, ShieldCheck } from 'lucide-react';

interface MortgageCalculatorProps {
  initialPrice?: number;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ initialPrice = 50000000 }) => {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(15.5); // SBP markup
  const [tenureYears, setTenureYears] = useState<number>(15);

  const downPaymentAmount = (propertyPrice * downPaymentPct) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = tenureYears * 12;

  // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

  const totalPayment = emi * totalMonths + downPaymentAmount;
  const totalInterest = emi * totalMonths - loanAmount;

  const formatPKR = (num: number) => {
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(2)} Lacs`;
    return `PKR ${Math.round(num).toLocaleString('en-PK')}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-800 mb-6">
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Pakistani Bank Mortgage Calculator</h3>
          <p className="text-xs text-slate-400">Estimate monthly EMI for Meezan Bank, HBL & Bank Alfalah home loans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Controls */}
        <div className="space-y-4 text-xs">
          
          {/* Property Price */}
          <div>
            <div className="flex justify-between font-bold mb-1.5">
              <span className="text-slate-300">Property Price:</span>
              <span className="text-orange-400">{formatPKR(propertyPrice)}</span>
            </div>
            <input
              type="range"
              min={2000000}
              max={200000000}
              step={1000000}
              value={propertyPrice}
              onChange={e => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Down Payment % */}
          <div>
            <div className="flex justify-between font-bold mb-1.5">
              <span className="text-slate-300">Down Payment ({downPaymentPct}%):</span>
              <span className="text-amber-400">{formatPKR(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPct}
              onChange={e => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between font-bold mb-1.5">
              <span className="text-slate-300">Markup Rate (SBP / Islamic Profit):</span>
              <span className="text-white">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={8}
              max={22}
              step={0.5}
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between font-bold mb-1.5">
              <span className="text-slate-300">Loan Tenure:</span>
              <span className="text-white">{tenureYears} Years</span>
            </div>
            <div className="flex space-x-2">
              {[5, 10, 15, 20].map(yr => (
                <button
                  key={yr}
                  onClick={() => setTenureYears(yr)}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                    tenureYears === yr
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Monthly EMI</p>
            <p className="text-2xl sm:text-3xl font-black text-white gradient-text mt-1">
              {formatPKR(emi)} <span className="text-xs font-normal text-slate-400">/ month</span>
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Loan Amount:</span>
                <span className="font-bold text-slate-200">{formatPKR(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Interest Payable:</span>
                <span className="font-bold text-amber-400">{formatPKR(totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Down Payment Paid:</span>
                <span className="font-bold text-slate-200">{formatPKR(downPaymentAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Islamic Home Financing pre-approval supported via Deal.pk Escrow.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
