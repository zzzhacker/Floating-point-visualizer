import React, { useState, useEffect } from 'react';
import { FloatInfo } from '../utils/floatConverter';

interface NumberLineVisualizerProps {
  data: FloatInfo;
}

export const NumberLineVisualizer: React.FC<NumberLineVisualizerProps> = ({ data }) => {
  const { exponent, mantissa, sign, finalValue } = data;

  const [startAnimation, setStartAnimation] = useState(false);

  const windowStart = Math.pow(2, exponent.value);
  const windowSize = windowStart;
  const windowEnd = windowStart + windowSize;
  const offsetPercentage = mantissa.valueWithoutImplicitOne * 100;

  useEffect(() => {
    setStartAnimation(false);
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const displayWindowStart = sign.value === -1 ? -windowEnd : windowStart;
  const displayWindowEnd = sign.value === -1 ? -windowStart : windowEnd;

  const markerPositionStyle = sign.value === -1 
    ? { right: `${offsetPercentage}%` } 
    : { left: `${offsetPercentage}%` };

  return (
    <div className="bg-white/50 border-t border-stone-200 p-6 rounded-lg overflow-hidden">
      <h3 className="text-3xl font-heading text-stone-900 mb-4">Window & Offset Visualization</h3>
      <div className="space-y-4 text-stone-600">
        <p>
          The <span className="text-green-600 font-bold">Exponent</span> defines a "window" between two powers of two: 
          <strong className="text-green-700"> 2<sup>{exponent.value}</sup></strong> and <strong className="text-green-700">2<sup>{exponent.value + 1}</sup></strong>.
          For this number, the range is [<strong className="text-green-700">{windowStart.toString()}</strong>, <strong className="text-green-700">{windowEnd.toString()}</strong>].
        </p>
        <p>
          The <span className="text-purple-600 font-bold">Mantissa</span> then acts as a high-precision "offset", pointing to the exact location of the number within that window.
        </p>
        <div className="text-base bg-stone-100 p-3 rounded-md">
          <p>Offset = Mantissa Value = <span className="text-purple-700">{mantissa.valueWithoutImplicitOne.toPrecision(4)}</span></p>
          <p>Position within window = Offset &times; 100% = <span className="text-purple-700">{offsetPercentage.toFixed(2)}%</span></p>
        </div>
      </div>

      <div className="mt-12 mb-8 h-16">
        <div className="relative h-1 bg-stone-400 rounded-full">
            
            {/* 1. Animated Window Bar */}
            <div 
                className="absolute top-0 h-full bg-blue-600 rounded-full transition-transform duration-500 ease-out"
                style={{
                    transform: startAnimation ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: sign.value === -1 ? 'right' : 'left',
                    width: '100%'
                }}
            />
            
            {/* 2. Marker, Tracer, and Tooltip Group */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                style={markerPositionStyle}
            >
                {/* Tracer Line */}
                <div
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-px h-8 origin-bottom bg-stone-500 transition-transform duration-500 ease-in-out"
                    style={{
                        transform: startAnimation ? 'scaleY(1)' : 'scaleY(0)',
                        transitionDelay: '400ms',
                    }}
                />

                {/* The Marker */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-700 border-2 border-white shadow-lg transition-all duration-300"
                    style={{
                        opacity: startAnimation ? 1 : 0,
                        transform: startAnimation ? 'scale(1)' : 'scale(0.5)',
                        transitionDelay: '800ms',
                    }}
                    title={`Value: ${finalValue}`}
                >
                    {/* The Tooltip */}
                    <div className="absolute bottom-full mb-3 w-max px-2 py-1 text-sm bg-stone-800 text-white rounded-md left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
                        style={{
                            opacity: startAnimation ? 1 : 0,
                            transitionDelay: '1000ms',
                        }}
                    >
                        {finalValue.toString()}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-stone-800"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Number Line Labels */}
        <div className="relative flex justify-between mt-2 text-sm text-stone-500 transition-opacity duration-500" style={{opacity: startAnimation ? 1 : 0}}>
          <span>{displayWindowStart.toString()}</span>
          <span>{displayWindowEnd.toString()}</span>
        </div>
      </div>
    </div>
  );
};