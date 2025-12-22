import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealitySlider from './RealitySlider';

interface UserPanelProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scanData: any;
    bias: number;
    setBias: (val: number) => void;
    onRecalibrate: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserPanel({ scanData, bias, setBias, onRecalibrate }: UserPanelProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(true);

    return (
        <aside className="hidden xl:flex flex-col w-80 h-screen fixed right-0 top-0 border-l border-gray-200 bg-white z-30 p-8 overflow-y-auto">

            <div className="mb-6">
                <button
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    className="w-full flex items-center justify-between text-sm font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Feed Configuration
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <AnimatePresence>
                    {isConfigOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
                                <label className="block text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wide">
                                    Content Skew
                                </label>
                                <RealitySlider value={bias} onChange={setBias} />
                            </div>

                            {/* Biometric Data Section */}
                            {scanData && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                        Biometric Analysis
                                    </h3>
                                    <div className="bg-white border border-gray-100 rounded-lg divide-y divide-gray-50">
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Age Group</span>
                                            <span className="text-xs font-medium text-gray-900">{scanData.age}</span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Heritage</span>
                                            <span className="text-xs font-medium text-gray-900 capitalize">{scanData.race || 'Unknown'}</span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Dominant Emotion</span>
                                            <span className="text-xs font-medium text-gray-900 capitalize">{scanData.emotion}</span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Detected Bias</span>
                                            <span className="text-xs font-medium text-blue-600">{scanData.bias > 0 ? 'Conservative' : 'Liberal'} Leaning</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto">
                <button
                    onClick={onRecalibrate}
                    className="w-full py-3 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Preferences
                </button>
            </div>
        </aside>
    );
}
