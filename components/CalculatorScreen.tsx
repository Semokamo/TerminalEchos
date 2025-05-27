
import React, { useState, useEffect } from 'react';

interface CalculatorScreenProps {
  onDisplayChange: (value: string) => void;
}

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onDisplayChange }) => {
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [shouldResetInput, setShouldResetInput] = useState<boolean>(false);

  useEffect(() => {
    onDisplayChange(currentInput);
  }, [currentInput, onDisplayChange]);

  const handleNumberClick = (num: string) => {
    if (currentInput === 'Error') {
      setCurrentInput(num);
      setShouldResetInput(false);
      return;
    }
    if (shouldResetInput || currentInput === '0') {
      setCurrentInput(num);
      setShouldResetInput(false);
    } else {
      setCurrentInput(prev => (prev.length < 15 ? prev + num : prev));
    }
  };

  const handleDecimalClick = () => {
    if (currentInput === 'Error') {
        setCurrentInput('0.');
        setShouldResetInput(false);
        return;
    }
    if (shouldResetInput) {
      setCurrentInput('0.');
      setShouldResetInput(false);
      return;
    }
    if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
  };

  const handleOperatorClick = (op: string) => {
    if (currentInput === 'Error') return;

    if (previousInput !== null && operator && !shouldResetInput) {
      calculateResult(); // Calculate previous operation before setting new one
      // After calculation, previousInput is set to the result, so we can chain ops
      // The currentInput after calculateResult is already the result
      // setPreviousInput will be set by calculateResult
      setOperator(op); 
      setShouldResetInput(true); // Next number input should reset display
    } else {
      setPreviousInput(currentInput);
      setOperator(op);
      setShouldResetInput(true);
    }
  };

  const calculateResult = () => {
    if (previousInput === null || operator === null || currentInput === 'Error') {
      return;
    }

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    let result: number;

    switch (operator) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          setCurrentInput('Error');
          setPreviousInput(null);
          setOperator(null);
          setShouldResetInput(true);
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }
    
    const resultStr = String(Number(result.toFixed(8))); // Limit precision & remove trailing zeros
    setCurrentInput(resultStr.length > 15 ? 'Error' : resultStr); // Check for overflow
    setPreviousInput(resultStr); // Store result for chained operations
    // setOperator(null); // Keep operator for potential chained equals
    setShouldResetInput(true);
  };

  const handleEqualsClick = () => {
    calculateResult();
    // Keep operator and previousInput (which is now result) for repeated equals
    // If the user presses another number, shouldResetInput will clear the display
  };

  const handleClearClick = () => {
    setCurrentInput('0');
    setPreviousInput(null);
    setOperator(null);
    setShouldResetInput(false);
  };

  const buttonClass = "text-2xl sm:text-3xl font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95";
  const numButtonClass = `${buttonClass} bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400 p-4 sm:p-5`;
  const opButtonClass = `${buttonClass} bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400 p-4 sm:p-5`;
  const specialButtonClass = `${buttonClass} bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 p-4 sm:p-5`;


  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xs sm:max-w-sm bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6">
        {/* Display */}
        <div className="bg-gray-900 text-right p-4 sm:p-6 rounded-lg mb-4 shadow-inner">
          <span 
            className="text-3xl sm:text-5xl font-mono break-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            aria-live="polite"
          >
            {currentInput}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button onClick={handleClearClick} className={`${specialButtonClass} col-span-2`}>AC</button>
          <button disabled className={`${buttonClass} bg-gray-700 opacity-0`}>%</button> {/* Placeholder */}
          <button onClick={() => handleOperatorClick('/')} className={opButtonClass}>÷</button>

          <button onClick={() => handleNumberClick('7')} className={numButtonClass}>7</button>
          <button onClick={() => handleNumberClick('8')} className={numButtonClass}>8</button>
          <button onClick={() => handleNumberClick('9')} className={numButtonClass}>9</button>
          <button onClick={() => handleOperatorClick('*')} className={opButtonClass}>×</button>

          <button onClick={() => handleNumberClick('4')} className={numButtonClass}>4</button>
          <button onClick={() => handleNumberClick('5')} className={numButtonClass}>5</button>
          <button onClick={() => handleNumberClick('6')} className={numButtonClass}>6</button>
          <button onClick={() => handleOperatorClick('-')} className={opButtonClass}>-</button>

          <button onClick={() => handleNumberClick('1')} className={numButtonClass}>1</button>
          <button onClick={() => handleNumberClick('2')} className={numButtonClass}>2</button>
          <button onClick={() => handleNumberClick('3')} className={numButtonClass}>3</button>
          <button onClick={() => handleOperatorClick('+')} className={opButtonClass}>+</button>

          <button onClick={() => handleNumberClick('0')} className={`${numButtonClass} col-span-2`}>0</button>
          <button onClick={handleDecimalClick} className={numButtonClass}>.</button>
          <button onClick={handleEqualsClick} className={opButtonClass}>=</button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorScreen;
