import React from 'react';
import { motion } from 'framer-motion';

interface RealitySliderProps {
    value: number;
    onChange: (val: number) => void;
}

export default function RealitySlider({ value, onChange }: RealitySliderProps) {

    return (
        <div className="relative w-full py-4 select-none">
            {/* Track Background */}
            <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-gray-800 to-red-900 opacity-50" />
            </div>

            {/* Input Range (Invisible but clickable) */}
            <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Custom Thumb */}
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] border-2 border-white z-10 pointer-events-none"
                animate={{ left: `${((value + 1) / 2) * 100}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                style={{ x: '-50%' }}
            >
                {/* Center dot */}
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full" />
            </motion.div>

            {/* Labels */}
            <div className="flex justify-between text-[10px] font-medium tracking-widest mt-3 text-gray-500 uppercase">
                <span className={value < -0.2 ? 'text-blue-600 transition-colors' : ''}>Dissent</span>
                <span className={Math.abs(value) <= 0.2 ? 'text-gray-900 transition-colors' : ''}>Neutral</span>
                <span className={value > 0.2 ? 'text-red-600 transition-colors' : ''}>Authority</span>
            </div>
        </div>
    );
}
