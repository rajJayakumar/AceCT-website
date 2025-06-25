'use client'

import React, { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface DesmosCalculatorProps {
    show: boolean;
}

export default function DesmosCalculator({ show }: DesmosCalculatorProps) {
    const [calculatorLoaded, setCalculatorLoaded] = useState(false);
    const calculatorRef = useRef<HTMLDivElement>(null);
    const calculatorInstance = useRef<any>(null);

    useEffect(() => {
        if (show && calculatorRef.current && calculatorLoaded) {
            const elt = calculatorRef.current;
            calculatorInstance.current = new (window as any).Desmos.GraphingCalculator(elt);
            
            return () => {
                if (calculatorInstance.current) {
                    calculatorInstance.current.destroy();
                }
            };
        }
    }, [show, calculatorLoaded]);

    if (!show) return null;

    return (
        <div className="calculator-container">
            <Script 
                src="https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
                onLoad={() => setCalculatorLoaded(true)}
            />
            <div ref={calculatorRef} style={{ height: '500px' }}></div>
        </div>
    );
} 