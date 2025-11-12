import React, { useState, useMemo } from 'react';
import { getFloat32Info, FloatInfo } from '../utils/floatConverter';
import { BitGroup } from './BitGroup';
import { CalculationBreakdown } from './CalculationBreakdown';
import { NumberLineVisualizer } from './NumberLineVisualizer';

export const FloatVisualizer: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('3.14');

  const { floatData, originalValue } = useMemo(() => {
    const num = parseFloat(inputValue);
    let data: FloatInfo | null;
    if (isNaN(num) && inputValue.toLowerCase() !== 'nan') {
      data = getFloat32Info(0);
    } else {
      data = getFloat32Info(num);
    }
    return { floatData: data, originalValue: num };
  }, [inputValue]);

  const handleSpecialValue = (val: string, num: number) => {
    setInputValue(val);
  };
  
  const specialValues = [
    { label: 'π', value: String(Math.PI) },
    { label: 'Infinity', value: 'Infinity' },
    { label: '-Infinity', value: '-Infinity' },
    { label: 'NaN', value: 'NaN' },
    { label: 'Zero', value: '0' },
    { label: 'Max', value: String(Number.MAX_VALUE) },
    { label: 'Min', value: String(Number.MIN_VALUE) },
  ];

  return (
    <div className="bg-white/70 border border-stone-200 rounded-lg shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <label htmlFor="float-input" className="block text-base font-bold text-stone-600 mb-2">
          Enter a Decimal Number
        </label>
        <input
          id="float-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 bg-stone-100/70 border-b-2 border-stone-400 rounded-t-md text-blue-800 text-xl focus:ring-0 focus:border-blue-600 focus:bg-white outline-none transition"
          placeholder="e.g., 20.25"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {specialValues.map(({label, value}) => (
            <button
                key={label}
                onClick={() => setInputValue(value)}
                className="px-3 py-1 bg-transparent border-b-2 border-stone-400 text-stone-600 rounded-md text-base hover:bg-blue-100 hover:border-blue-500 transition-colors"
            >
                {label}
            </button>
        ))}
      </div>

      {floatData && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 p-4 bg-stone-50/50 rounded-lg">
            <BitGroup label="Sign" bits={floatData.sign.bit} color="bg-blue-300" textColor="text-blue-900" />
            <BitGroup label="Exponent" bits={floatData.exponent.bits} color="bg-green-300" textColor="text-green-900" />
            <BitGroup label="Mantissa" bits={floatData.mantissa.bits} color="bg-purple-300" textColor="text-purple-900" />
          </div>
          
          {!floatData.isSpecial && <NumberLineVisualizer data={floatData} />}

          <CalculationBreakdown data={floatData} originalValue={originalValue} />
        </div>
      )}
    </div>
  );
};