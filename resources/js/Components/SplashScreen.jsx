import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-green-800">
            <img 
                src="/assets/fundo.png" 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative z-10 flex flex-col items-center animate-pulse">
                <img 
                    src="/assets/icon.png" 
                    alt="Driver Pay Icon" 
                    className="w-32 h-32 mb-6 drop-shadow-lg"
                />
                <h1 className="text-4xl font-bold tracking-wider drop-shadow-md">
                    <span className="text-emerald-300 drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]">
                        Driver
                    </span>{' '}
                    <span className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]">
                        Pay
                    </span>
                </h1>
                <p className="mt-2 text-white text-lg font-light drop-shadow-sm">
                    Controle de Custos para Motorista
                </p>
            </div>
        </div>
    );
}
