
export interface FloatInfo {
  binary: string;
  sign: {
    bit: string;
    value: number;
  };
  exponent: {
    bits: string;
    value: number;
    biasedValue: number;
  };
  mantissa: {
    bits: string;
    value: number;
    valueWithoutImplicitOne: number;
  };
  finalValue: number;
  isSpecial: boolean;
  specialCase?: 'Zero' | 'Infinity' | 'NaN' | 'Denormalized';
}

function getFloat32Binary(num: number): string {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, num, false); // big-endian
  let binaryString = '';
  for (let i = 0; i < 4; i++) {
    const byte = view.getUint8(i).toString(2).padStart(8, '0');
    binaryString += byte;
  }
  return binaryString;
}

function binaryToDecimal(binary: string): number {
  let decimal = 0;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      decimal += Math.pow(2, -(i + 1));
    }
  }
  return decimal;
}

function parseFloatInfoFromBits(binary: string, exponentBits: number, mantissaBits: number): FloatInfo {
    const signBit = binary[0];
    const expStart = 1;
    const expEnd = 1 + exponentBits;
    const exponentBinary = binary.substring(expStart, expEnd);
    const mantissaBinary = binary.substring(expEnd);
    
    const signValue = signBit === '1' ? -1 : 1;
    const exponentBias = Math.pow(2, exponentBits - 1) - 1;
    const maxBiasedExponent = Math.pow(2, exponentBits) - 1;

    const biasedExponent = parseInt(exponentBinary, 2);
    const exponentValue = biasedExponent - exponentBias;
    const mantissaValueWithoutImplicitOne = binaryToDecimal(mantissaBinary);
    
    let finalValue: number;
    let isSpecial = false;
    let specialCase: FloatInfo['specialCase'] = undefined;
    let mantissaValue = 1 + mantissaValueWithoutImplicitOne;

    if (biasedExponent === maxBiasedExponent) {
        isSpecial = true;
        if (mantissaValueWithoutImplicitOne === 0) {
            specialCase = 'Infinity';
            finalValue = signValue * Infinity;
        } else {
            specialCase = 'NaN';
            finalValue = NaN;
        }
    } else if (biasedExponent === 0) {
        if (mantissaValueWithoutImplicitOne === 0) {
            isSpecial = true;
            specialCase = 'Zero';
            finalValue = signValue * 0;
        } else {
            isSpecial = true;
            specialCase = 'Denormalized';
            mantissaValue = mantissaValueWithoutImplicitOne; // No implicit 1
            finalValue = signValue * mantissaValue * Math.pow(2, 1 - exponentBias);
        }
    } else {
        finalValue = signValue * mantissaValue * Math.pow(2, exponentValue);
    }
    
    return {
        binary,
        sign: { bit: signBit, value: signValue },
        exponent: { bits: exponentBinary, value: exponentValue, biasedValue: biasedExponent },
        mantissa: { bits: mantissaBinary, value: mantissaValue, valueWithoutImplicitOne: mantissaValueWithoutImplicitOne },
        finalValue,
        isSpecial,
        specialCase
    };
}


export function getFloat32Info(num: number): FloatInfo {
  if (isNaN(num)) {
    // Provide a canonical representation for a quiet NaN (qNaN)
    const qNaNBinary = '01111111110000000000000000000001';
    return parseFloatInfoFromBits(qNaNBinary, 8, 23);
  }
  
  const binary32 = getFloat32Binary(num);
  return parseFloatInfoFromBits(binary32, 8, 23);
}

export function getBFloat16Info(num: number): FloatInfo {
    if (isNaN(num)) {
        return parseFloatInfoFromBits('0111111111000001', 8, 7);
    }
    if (num === 0) {
        return parseFloatInfoFromBits('0000000000000000', 8, 7);
    }
    if (num === Infinity) {
        return parseFloatInfoFromBits('0111111110000000', 8, 7);
    }
    if (num === -Infinity) {
        return parseFloatInfoFromBits('1111111110000000', 8, 7);
    }
    // Truncate FP32 to get BF16
    const binary32 = getFloat32Binary(num);
    const binary16 = binary32.substring(0, 16);
    return parseFloatInfoFromBits(binary16, 8, 7);
}

export function getFloat16Info(num: number): FloatInfo {
  if (isNaN(num)) {
    return parseFloatInfoFromBits('0111110000000001', 5, 10);
  }

  // Use a DataView to get the raw bits of the float32
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, num);
  const bits = view.getUint32(0);

  const sign = (bits >> 31) & 0x1;
  let exponent = (bits >> 23) & 0xff;
  let mantissa = bits & 0x7fffff;

  let f16Sign = sign;
  let f16Exponent;
  let f16Mantissa;

  if (exponent === 0xff) { // Infinity or NaN
    f16Exponent = 0x1f;
    f16Mantissa = mantissa ? 0x200 : 0; // Set a bit for NaN
  } else if (exponent === 0) { // Zero or denormalized
    f16Exponent = 0;
    f16Mantissa = 0;
  } else {
    const newExp = exponent - 127;
    if (newExp > 15) { // Overflow -> Infinity
      f16Exponent = 0x1f;
      f16Mantissa = 0;
    } else if (newExp < -14) { // Underflow -> Zero
      f16Exponent = 0;
      f16Mantissa = 0;
    } else { // Normalized
      f16Exponent = newExp + 15;
      f16Mantissa = mantissa >> 13; // Truncate 23 bits to 10
    }
  }

  const binary = 
    f16Sign.toString(2) + 
    f16Exponent.toString(2).padStart(5, '0') + 
    f16Mantissa.toString(2).padStart(10, '0');

  return parseFloatInfoFromBits(binary, 5, 10);
}
