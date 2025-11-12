import React from 'react';
import { FloatInfo } from '../utils/floatConverter';

interface CalculationBreakdownProps {
  data: FloatInfo;
  originalValue: number;
}

const FormulaPart: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="bg-white/50 border border-stone-200 shadow-sm p-4 rounded-lg flex flex-col md:flex-row md:items-start gap-4">
        <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-xl font-bold text-white ${
            label === 'S' ? 'bg-blue-400' : label === 'E' ? 'bg-green-400' : label === 'M' ? 'bg-purple-400' : 'bg-blue-700'
        }`}>
            {label}
        </div>
        <div className="text-stone-700 text-base md:text-lg leading-relaxed break-all">
            {children}
        </div>
    </div>
);


export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({ data, originalValue }) => {
    const { sign, exponent, mantissa, isSpecial, specialCase, finalValue } = data;

    if (isSpecial) {
        return (
            <div className="bg-orange-100 border border-orange-200 text-orange-800 p-6 rounded-lg text-center">
                <h2 className="text-3xl font-heading mb-2">{specialCase}</h2>
                <p className="text-lg">
                    {specialCase === 'Infinity' && `Exponent bits are all 1s, mantissa is all 0s.`}
                    {specialCase === 'NaN' && `Exponent bits are all 1s, mantissa is non-zero.`}
                    {specialCase === 'Zero' && `Exponent and mantissa bits are all 0s.`}
                    {specialCase === 'Denormalized' && `Exponent bits are all 0s, representing a very small number close to zero.`}
                </p>
                {specialCase === 'Denormalized' && (
                    <div className="mt-4 text-left bg-white/50 p-4 rounded">
                        <p>Formula: (-1)<sup className="text-blue-600">S</sup> &times; M &times; 2<sup>{1 - (Math.pow(2, exponent.bits.length - 1) -1)}</sup></p>
                        <p className="mt-2">Value: {sign.value} &times; {mantissa.value} &times; 2<sup>{1 - (Math.pow(2, exponent.bits.length - 1) -1)}</sup> = {finalValue}</p>
                    </div>
                )}
            </div>
        );
    }
    
  const windowStart = Math.pow(2, exponent.value);
  const windowSize = windowStart;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-heading text-stone-900 mb-3">Calculation Breakdown</h3>
        <p className="p-4 bg-stone-100 rounded-md text-center text-lg text-blue-800">
            (-1)<sup className="text-blue-600">S</sup> &times; (1 + <span className="text-purple-600">M</span>) &times; 2<sup>(<span className="text-green-600">E</span> - {Math.pow(2, exponent.bits.length - 1) - 1})</sup>
        </p>
      </div>

      <div className="space-y-4">
        <FormulaPart label="S">
            <p className="text-stone-500 mb-1">Sign</p>
            <p>(-1)<sup>{sign.bit}</sup> = <span className="font-bold text-stone-900">{sign.value}</span></p>
            <p className="text-base text-stone-500 mt-2">Determines if the number is positive or negative.</p>
        </FormulaPart>

        <FormulaPart label="E">
            <p className="text-stone-500 mb-1">Exponent</p>
            <p>Biased value: <span className="text-green-600">{exponent.bits}</span>_2 = <span className="font-bold text-stone-900">{exponent.biasedValue}</span>_10</p>
            <p>Actual exponent: {exponent.biasedValue} - {Math.pow(2, exponent.bits.length - 1) - 1} = <span className="font-bold text-stone-900">{exponent.value}</span></p>
            <p className="text-base text-stone-500 mt-2">The exponent is stored as a "biased" value to handle positive and negative powers of 2. We subtract the bias ({Math.pow(2, exponent.bits.length - 1) - 1}) to get the actual exponent, which sets the scale by calculating 2^{exponent.value}.</p>
        </FormulaPart>

        <FormulaPart label="M">
            <div className="space-y-3">
                <div>
                    <p className="text-stone-500 mb-1">Mantissa (Fraction) from Bits</p>
                    <p>Binary value: 0.<span className="text-purple-600">{mantissa.bits}</span></p>
                    <p>Decimal value: <span className="font-bold text-stone-900">{mantissa.valueWithoutImplicitOne}</span></p>
                    <p>With implicit 1: 1 + {mantissa.valueWithoutImplicitOne} = <span className="font-bold text-stone-900">{mantissa.value}</span></p>
                </div>
                <div className="pt-3 border-t border-stone-200/80">
                     <p className="text-stone-500 mb-1">Deriving the Offset from Input</p>
                     <p>Formula: (|Input| - Window Start) / Window Size</p>
                     <p>Calculation: (|{originalValue}| - {windowStart}) / {windowSize}</p>
                     <p>= ({Math.abs(originalValue)} - {windowStart}) / {windowSize} = <span className="font-bold text-stone-900">{(Math.abs(originalValue) - windowStart) / windowSize}</span></p>
                     <p className="text-base text-stone-500 mt-2">This shows how the mantissa represents the number's proportional position within the exponent's window.</p>
                </div>
            </div>
        </FormulaPart>

        <FormulaPart label="=">
            <p className="text-stone-500 mb-1">Final Result</p>
            <p>{sign.value} &times; (1 + {mantissa.valueWithoutImplicitOne}) &times; 2<sup>({exponent.biasedValue} - {Math.pow(2, exponent.bits.length - 1) - 1})</sup></p>
            <p className="pl-1">= {sign.value} &times; {mantissa.value} &times; 2<sup>{exponent.value}</sup></p>
            <p className="pl-1">= <span className="font-bold text-3xl text-blue-800">{finalValue}</span></p>
        </FormulaPart>
      </div>
    </div>
  );
};