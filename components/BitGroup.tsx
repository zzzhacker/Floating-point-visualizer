import React from 'react';

interface BitGroupProps {
  label: string;
  bits: string;
  color: string;
  textColor: string;
}

export const BitGroup: React.FC<BitGroupProps> = ({ label, bits, color, textColor }) => {
  return (
    <div className="flex-shrink-0">
      <div className="flex items-center mb-1">
        <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
        <h3 className="text-sm font-bold text-stone-700 tracking-wider uppercase">{label}</h3>
      </div>
      <div className={`text-xl bg-stone-100 p-2 rounded-md tracking-widest break-all ${textColor}`}>
        {bits.split('').map((bit, index) => (
          <span key={index} className="hover:bg-stone-300/50 rounded-sm px-0.5 transition-colors">
            {bit}
          </span>
        ))}
      </div>
    </div>
  );
};