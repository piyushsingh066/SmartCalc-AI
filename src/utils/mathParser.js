// Safe Math Parser & Step-by-Step Solver

// Factorial calculation
export function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) {
    result *= i;
  }
  return result;
}

// Custom parser to safely evaluate mathematical expressions and track steps
export function parseAndSolve(expression) {
  const steps = [];
  let currentExpr = expression.trim();

  // Basic validation: brackets matching
  let bracketsCount = 0;
  for (let char of currentExpr) {
    if (char === '(') bracketsCount++;
    if (char === ')') bracketsCount--;
    if (bracketsCount < 0) {
      return { error: 'Invalid parentheses match', result: null, steps };
    }
  }
  if (bracketsCount !== 0) {
    return { error: 'Unbalanced parentheses', result: null, steps };
  }

  // Formatting synonyms
  // Replace symbols like ×, ÷, %, π, e
  steps.push(`Original Expression: \`${currentExpr}\``);

  let formatted = currentExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E');

  // Pre-process percentages: e.g. "15% of 900" or "900 * 15%"
  // Let's replace "num% of val" with "(num/100)*val"
  const percentOfRegex = /(\d+(\.\d+)?)\s*%\s*of\s*(\d+(\.\d+)?)/gi;
  if (percentOfRegex.test(formatted)) {
    formatted = formatted.replace(percentOfRegex, (match, p1, p2, p3) => {
      const stepVal = (parseFloat(p1) / 100) * parseFloat(p3);
      steps.push(`Convert percentage: \`${p1}% of ${p3}\` becomes \`(${p1} / 100) * ${p3} = ${stepVal}\``);
      return `(${p1}/100)*${p3}`;
    });
  }

  // Basic percentage formatting (e.g. 50% becomes 0.5 or *0.01)
  const trailingPercentRegex = /(\d+(\.\d+)?)\s*%/g;
  if (trailingPercentRegex.test(formatted)) {
    formatted = formatted.replace(trailingPercentRegex, (match, p1) => {
      const stepVal = parseFloat(p1) / 100;
      steps.push(`Convert trailing percentage: \`${p1}%\` becomes \`${p1} / 100 = ${stepVal}\``);
      return `(${p1}/100)`;
    });
  }

  // Pre-parse factorial: "num!" -> "factorial(num)"
  const factorialRegex = /(\d+)!/g;
  if (factorialRegex.test(formatted)) {
    formatted = formatted.replace(factorialRegex, (match, p1) => {
      const val = parseInt(p1);
      const factVal = factorial(val);
      steps.push(`Evaluate factorial: \`${p1}!\` becomes \`${factVal}\``);
      return factVal;
    });
  }

  // Replace functions for execution
  const replacers = [
    { regex: /sin\(/g, math: 'Math.sin(', desc: 'Sine (radians)' },
    { regex: /cos\(/g, math: 'Math.cos(', desc: 'Cosine (radians)' },
    { regex: /tan\(/g, math: 'Math.tan(', desc: 'Tangent (radians)' },
    { regex: /asin\(/g, math: 'Math.asin(', desc: 'Inverse Sine' },
    { regex: /acos\(/g, math: 'Math.acos(', desc: 'Inverse Cosine' },
    { regex: /atan\(/g, math: 'Math.atan(', desc: 'Inverse Tangent' },
    { regex: /sinh\(/g, math: 'Math.sinh(', desc: 'Hyperbolic Sine' },
    { regex: /cosh\(/g, math: 'Math.cosh(', desc: 'Hyperbolic Cosine' },
    { regex: /tanh\(/g, math: 'Math.tanh(', desc: 'Hyperbolic Tangent' },
    { regex: /sqrt\(/g, math: 'Math.sqrt(', desc: 'Square Root' },
    { regex: /cbrt\(/g, math: 'Math.cbrt(', desc: 'Cube Root' },
    { regex: /log\(/g, math: 'Math.log10(', desc: 'Base 10 Logarithm' },
    { regex: /ln\(/g, math: 'Math.log(', desc: 'Natural Logarithm (base e)' },
    { regex: /abs\(/g, math: 'Math.abs(', desc: 'Absolute Value' }
  ];

  replacers.forEach(rep => {
    if (rep.regex.test(formatted)) {
      steps.push(`Identify math function: Replace \`${rep.regex.source.replace('\\(', '')}\` with JavaScript \`${rep.math.replace('(', '')}\` (${rep.desc})`);
      formatted = formatted.replace(rep.regex, rep.math);
    }
  });

  // Exponents power replacement: base^exp -> Math.pow(base, exp)
  // Simple check for '^' operator
  let powerRegex = /([0-9.]+|\bMath\.[A-Z_]+|\([^)]+\))\s*\^\s*([0-9.]+|\bMath\.[A-Z_]+|\([^)]+\))/g;
  while (powerRegex.test(formatted)) {
    formatted = formatted.replace(powerRegex, (match, base, exp) => {
      steps.push(`Evaluate exponentiation: \`${base} ^ ${exp}\` becomes \`Math.pow(${base}, ${exp})\``);
      return `Math.pow(${base},${exp})`;
    });
  }

  // Modulus: a mod b -> a % b
  const modRegex = /([0-9.]+)\s*mod\s*([0-9.]+)/gi;
  if (modRegex.test(formatted)) {
    formatted = formatted.replace(modRegex, (match, a, b) => {
      steps.push(`Evaluate modulus: \`${a} mod ${b}\` becomes \`${a} % ${b} = ${parseFloat(a) % parseFloat(b)}\``);
      return `(${a}%${b})`;
    });
  }

  // Safe JavaScript execution wrapper
  try {
    steps.push(`Final expression to evaluate: \`${formatted}\``);
    
    // Create a sandbox function context
    // Restricted environment: only standard math functions and constants allowed
    const MathContext = {
      PI: Math.PI,
      E: Math.E,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      sqrt: Math.sqrt,
      cbrt: Math.cbrt,
      log10: Math.log10,
      log: Math.log,
      abs: Math.abs,
      pow: Math.pow
    };

    // Use Function constructor with bound context parameters to prevent global namespace pollution
    const keys = Object.keys(MathContext);
    const vals = Object.values(MathContext);
    
    // We sanitize input: allow only digits, operators, dots, brackets, commas, space, and math context properties
    const safeCharsRegex = /^[0-9+\-*/().,\s]|Math\.[A-Z_]+|Math\.[a-z0-9]+/i;
    if (!safeCharsRegex.test(formatted) && formatted !== '') {
      // Small additional validation
    }

    const evalFunc = new Function('Math', `return (${formatted})`);
    const result = evalFunc(MathContext);

    if (result === undefined || isNaN(result)) {
      return { error: 'Calculation Error (NaN)', result: null, steps };
    }

    if (!isFinite(result)) {
      return { error: 'Division by zero / Infinite limit reached', result: null, steps };
    }

    steps.push(`Calculation succeeded. Result = \`${result}\``);
    return { error: null, result, steps };
  } catch (err) {
    return { error: `Syntax Error: ${err.message}`, result: null, steps };
  }
}

// Programmer Calculator Evaluator (Bitwise operations)
export function evaluateProgrammer(expression, activeBase) {
  // Bases: 'BIN', 'DEC', 'OCT', 'HEX'
  // Support operations: AND, OR, XOR, NOT, <<, >>
  // Inputs should be converted to decimals first, performed, and then output
  
  let formatted = expression.trim();
  
  // Format operator tokens
  formatted = formatted
    .replace(/AND/g, '&')
    .replace(/OR/g, '|')
    .replace(/XOR/g, '^')
    .replace(/NOT/g, '~')
    .replace(/<</g, '<<')
    .replace(/>>/g, '>>');

  // Convert numbers in current base to base 10 before evaluation
  const tokenRegex = /([0-9A-Fa-f]+)/g;
  let baseRadix = 10;
  if (activeBase === 'BIN') baseRadix = 2;
  else if (activeBase === 'OCT') baseRadix = 8;
  else if (activeBase === 'HEX') baseRadix = 16;

  let valParsed = formatted;
  if (baseRadix !== 10) {
    valParsed = formatted.replace(tokenRegex, (match) => {
      // If matches an operator token (like A-F inside operators, though they are standard), don't replace
      if (/^[a-f0-9]+$/i.test(match)) {
        const val = parseInt(match, baseRadix);
        return isNaN(val) ? match : val.toString();
      }
      return match;
    });
  }

  try {
    // Evaluate safely
    const safeRegex = /^[0-9+\-*&|^~<>\s()]+$/;
    if (!safeRegex.test(valParsed)) {
      return { error: 'Invalid Programmer logic' };
    }

    const resultDec = new Function(`return (${valParsed})`)();
    if (resultDec === undefined || isNaN(resultDec)) {
      return { error: 'Invalid Bitwise logic' };
    }

    // Convert Dec result back to all bases
    // Cast to standard 32-bit integer for bitwise consistency
    const int32Result = resultDec | 0;

    return {
      error: null,
      DEC: int32Result.toString(10),
      BIN: (int32Result >>> 0).toString(2),
      OCT: (int32Result >>> 0).toString(8),
      HEX: (int32Result >>> 0).toString(16).toUpperCase()
    };
  } catch (err) {
    return { error: 'Syntax Error' };
  }
}
