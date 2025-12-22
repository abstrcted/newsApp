import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealitySlider from './RealitySlider';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bias: number;
    setBias: (val: number) => void;
    onRecalibrate: () => void;
}

export default function SettingsModal({ isOpen, onClose, bias, setBias, onRecalibrate }: SettingsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-xl font-bold tracking-wider text-white">
                                FEED PARAMETERS
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-12 flex-1">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-4 uppercase tracking-widest">
                                    Reality Bias Index
                                </label>
                                <RealitySlider value={bias} onChange={setBias} />
                                <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
                                    Adjusting this parameter alters the algorithmic weighting of your content stream.
                                    Extreme values may result in informational isolation.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <label className="block text-xs font-mono text-gray-400 mb-4 uppercase tracking-widest">
                                    Biometric System
                                </label>
                                <button
                                    onClick={onRecalibrate}
                                    className="w-full py-3 border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 text-gray-400 transition-all text-sm font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Recalibrate Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
