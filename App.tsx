import React, { useMemo, useState } from 'react';
import { FloatVisualizer } from './components/FloatVisualizer';
import { getFloat16Info, getFloat32Info, getBFloat16Info, FloatInfo } from './utils/floatConverter';


interface FormatBarProps {
  label: string;
  format: 'FP32' | 'FP16' | 'BFloat16';
  numberValue: number;
}

const FormatBar: React.FC<FormatBarProps> = ({ label, format, numberValue }) => {
  const floatData: FloatInfo | null = useMemo(() => {
    if (isNaN(numberValue)) {
        // Pass NaN explicitly to get the correct NaN representation
        if (format === 'FP16') return getFloat16Info(NaN);
        if (format === 'BFloat16') return getBFloat16Info(NaN);
        return getFloat32Info(NaN);
    }
    if (format === 'FP16') return getFloat16Info(numberValue);
    if (format === 'BFloat16') return getBFloat16Info(numberValue);
    return getFloat32Info(numberValue);
  }, [format, numberValue]);

  if (!floatData) return null;

  const { sign, exponent, mantissa, binary, finalValue } = floatData;
  const totalBits = binary.length;

  const signWidth = (1 / totalBits) * 100;
  const exponentWidth = (exponent.bits.length / totalBits) * 100;
  const mantissaWidth = (mantissa.bits.length / totalBits) * 100;
  
  const hasPrecisionLoss = !isNaN(numberValue) && numberValue !== finalValue;


  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <h4 className="font-heading text-2xl text-stone-800">{label}</h4>
        <span className="text-xs text-stone-500">{totalBits} bits total</span>
      </div>
      <div className="flex h-10 rounded-md overflow-hidden bg-stone-100 border border-stone-300 mb-3">
        <div
          className="bg-blue-300 flex items-center justify-center text-sm font-bold text-blue-900 min-w-[24px] px-1"
          style={{ width: `${signWidth}%` }}
          title={`Sign: ${sign.bit}`}
        >
          S
        </div>
        <div
          className="bg-green-300 flex items-center justify-center text-sm font-bold text-green-900 min-w-[24px] px-1"
          style={{ width: `${exponentWidth}%` }}
          title={`Exponent: ${exponent.bits}`}
        >
          E:{exponent.bits.length}
        </div>
        <div
          className="bg-purple-300 flex items-center justify-center text-sm font-bold text-purple-900 min-w-[24px] px-1"
          style={{ width: `${mantissaWidth}%` }}
          title={`Mantissa: ${mantissa.bits}`}
        >
          M:{mantissa.bits.length}
        </div>
      </div>
      
       <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-base">
        <div className="bg-stone-100/70 p-2 rounded">
          <p className="text-stone-500 text-[12px] uppercase tracking-wider">Original Value</p>
          <p className="text-stone-900 break-all">{isNaN(numberValue) ? 'NaN' : numberValue.toString()}</p>
        </div>
        <div className={`p-2 rounded transition-colors ${hasPrecisionLoss ? 'bg-orange-200/80' : 'bg-stone-100/70'}`}>
          <p className={`text-[12px] uppercase tracking-wider ${hasPrecisionLoss ? 'text-orange-700' : 'text-stone-500'}`}>Stored Value</p>
          <p className="text-stone-900 break-all">{finalValue.toString()}</p>
          {hasPrecisionLoss && <p className="text-orange-700 text-[12px] font-bold mt-1">PRECISION LOSS</p>}
        </div>
      </div>

    </div>
  );
};

const ExampleTable: React.FC = () => {
    const examples = [
        { label: "Small Fraction", value: 0.1 },
        { label: "Pi", value: 3.1415926535 },
        { label: "FP16 Near Max", value: 65504 },
        { label: "FP16 Overflow", value: 70000 },
        { label: "Small Gradient (Underflow)", value: 1.2e-40 },
        { label: "Very Large Number", value: 1.23e30 },
    ];

    const displayOriginalValue = (value: number) => {
        if (Math.abs(value) < 1e-6 && value !== 0) {
            return value.toFixed(45).replace(/\.?0+$/, "");
        }
        return value.toString();
    }

    const renderValueCell = (originalValue: number, storedValue: number) => {
        const hasLoss = originalValue !== storedValue && !isNaN(originalValue);
        const isOverflow = hasLoss && isFinite(originalValue) && !isFinite(storedValue);
        const isUnderflow = hasLoss && storedValue === 0 && originalValue !== 0;

        let displayValue;
        // Special format for the tiny number to avoid 'e' notation
        if (Math.abs(originalValue) < 1e-6 && originalValue !== 0) {
            displayValue = storedValue.toFixed(45).replace(/\.?0+$/, "") || "0";
        } else {
            displayValue = storedValue.toString();
        }
        
        const lossClass = (isOverflow || isUnderflow) ? 'bg-red-100 text-red-700' : hasLoss ? 'bg-orange-100 text-orange-700' : '';
        
        return (
            <td className={`px-4 py-3 border-b border-stone-200 break-all ${lossClass}`}>
                {displayValue}
                {isOverflow && <span className="text-xs ml-2 opacity-80 whitespace-nowrap">(Overflow)</span>}
                {isUnderflow && <span className="text-xs ml-2 opacity-80 whitespace-nowrap">(Underflow to 0)</span>}
            </td>
        );
    };

    return (
        <div className="mt-12 bg-white/60 p-6 rounded-lg border border-stone-200">
            <h3 className="text-3xl font-heading text-blue-800 mb-4">Real-World Examples</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-base text-stone-700 border-collapse">
                    <thead>
                        <tr className="bg-stone-100/50">
                            <th className="px-4 py-3 font-heading font-bold text-stone-800 border-b-2 border-stone-300">Description</th>
                            <th className="px-4 py-3 font-heading font-bold text-stone-800 border-b-2 border-stone-300">Original Value</th>
                            <th className="px-4 py-3 font-heading font-bold text-stone-800 border-b-2 border-stone-300">FP32 Stored</th>
                            <th className="px-4 py-3 font-heading font-bold text-stone-800 border-b-2 border-stone-300">FP16 Stored</th>
                            <th className="px-4 py-3 font-heading font-bold text-stone-800 border-b-2 border-stone-300">BFloat16 Stored</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/50">
                        {examples.map(({ label, value }) => {
                            const fp32 = getFloat32Info(value).finalValue;
                            const fp16 = getFloat16Info(value).finalValue;
                            const bf16 = getBFloat16Info(value).finalValue;
                            return (
                                <tr key={label}>
                                    <td className="px-4 py-3 border-b border-stone-200 text-stone-600">{label}</td>
                                    <td className="px-4 py-3 border-b border-stone-200 break-all">{displayOriginalValue(value)}</td>
                                    {renderValueCell(value, fp32)}
                                    {renderValueCell(value, fp16)}
                                    {renderValueCell(value, bf16)}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 text-stone-700 space-y-4">
                <h4 className="font-heading text-stone-800 text-2xl">Key Takeaways: Range vs. Precision</h4>
                <div className="bg-white p-4 rounded-md border border-stone-200">
                    <h5 className="font-heading font-bold text-red-600">The Overflow Problem (Large Gradients)</h5>
                    <p className="mt-1">
                        Look at the <strong className="text-stone-800">"FP16 Overflow"</strong> example. The number <code className="text-sm bg-stone-200 px-1 rounded">70000</code> is too large for FP16's limited exponent range, causing it to "overflow" to <code className="text-sm bg-stone-200 px-1 rounded">Infinity</code>. This completely corrupts any calculation. BFloat16, sharing FP32's large exponent range, handles this number correctly.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-md border border-stone-200">
                    <h5 className="font-heading font-bold text-red-600">The Underflow Problem (Small Gradients)</h5>
                    <p className="mt-1">
                        Now look at the <strong className="text-stone-800">"Small Gradient"</strong> example. This tiny, non-zero number is crucial for learning subtle patterns. FP16 cannot represent it and "underflows" to <code className="text-sm bg-stone-200 px-1 rounded">0</code>, effectively stopping the model from learning from that signal. Again, BFloat16's wide exponent range allows it to preserve this value.
                    </p>
                </div>
                <p>
                    <strong>Conclusion:</strong> For the massive and unpredictable range of values encountered in LLM training, <strong className="text-blue-800">BFloat16 is superior to FP16</strong>. It avoids both overflow and underflow, ensuring training stability at the cost of some precision, which is an acceptable trade-off.
                </p>
            </div>
        </div>
    );
};


const OtherFormats: React.FC = () => {
    const [inputValue, setInputValue] = useState('3.1415926535');
    const numberValue = useMemo(() => parseFloat(inputValue), [inputValue]);

    return (
        <div className="bg-white/70 border border-stone-200 rounded-lg shadow-sm p-6 md:p-8 mt-8">
            <h2 className="text-4xl font-heading text-blue-900 mb-4 tracking-tight">
                Interactive Format Comparison
            </h2>
            <p className="text-stone-600 mb-6 max-w-3xl">
                Enter a number below to see how it's actually stored in different floating-point formats and observe the trade-offs between <strong>dynamic range</strong> (Exponent) and <strong>precision</strong> (Mantissa).
            </p>

            <div className="mb-8">
                <label htmlFor="compare-input" className="block text-base font-bold text-stone-600 mb-2">
                  Enter a Number to Compare
                </label>
                <input
                  id="compare-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-100/70 border-b-2 border-stone-400 rounded-t-md text-blue-800 text-xl focus:ring-0 focus:border-blue-600 focus:bg-white outline-none transition"
                  placeholder="e.g., 3.14159"
                />
            </div>

            <div className="space-y-8 mb-8">
                <FormatBar label="FP32" format="FP32" numberValue={numberValue} />
                <FormatBar label="FP16" format="FP16" numberValue={numberValue} />
                <FormatBar label="BFloat16" format="BFloat16" numberValue={numberValue} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-100/50 p-4 rounded-lg">
                    <h3 className="text-2xl font-heading text-stone-900 mb-2">FP16 (Half Precision)</h3>
                    <p className="text-stone-700">
                        With <strong>5 exponent bits</strong> and <strong>10 mantissa bits</strong>, FP16 offers better precision than BFloat16 but has a much smaller dynamic range. It's great for AI inference and graphics, where memory savings are key and the range of numbers is predictable.
                    </p>
                </div>

                <div className="bg-stone-100/50 p-4 rounded-lg">
                    <h3 className="text-2xl font-heading text-stone-900 mb-2">BFloat16 (Brain Float)</h3>
                    <p className="text-stone-700">
                        This format has <strong>8 exponent bits</strong> (like FP32) but only <strong>7 mantissa bits</strong>. This gives it a huge dynamic range, making it robust for representing a wide variety of numbers, but with lower precision.
                    </p>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-2xl font-heading text-blue-800 mb-3">Why LLM Training Needs More Exponent</h3>
                <p className="text-stone-700">
                    During the training of Large Language Models (LLMs), calculated gradients (values used to update the model) can fluctuate wildly. Some gradients can be extremely large, while others are infinitesimally small.
                </p>
                <p className="text-stone-700 mt-2">
                    <strong>BFloat16's large exponent range</strong> is crucial here. It can handle this vast spectrum of values without "overflowing" (becoming infinity) or "underflowing" (becoming zero), which would destabilize training. The sacrifice in mantissa precision is an acceptable trade-off for this stability.
                </p>
            </div>
            
            <ExampleTable />
        </div>
    );
};


const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-5xl sm:text-7xl font-heading text-stone-900 tracking-tight">
          Floating Point Visualizer
        </h1>
        <p className="mt-4 text-xl text-stone-600">
          An interactive tool to understand IEEE 754 32-bit single-precision numbers.
        </p>
      </header>
      <main className="w-full max-w-5xl">
        <FloatVisualizer />
        <OtherFormats />
      </main>
      <footer className="w-full max-w-5xl text-center mt-12 text-stone-500">
        <p>Inspired by <a href="https://fabiensanglard.net/floating_point_visually_explained/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Fabien Sanglard's visual explanation</a>.</p>
      </footer>
    </div>
  );
};

export default App;