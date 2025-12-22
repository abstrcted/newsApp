"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import NewsCard from "./components/NewsCard";
import FaceScanner from "./components/FaceScanner";
import Sidebar from "./components/Sidebar";
import UserPanel from "./components/UserPanel";
import SatireChat from "./components/SatireChat";

type Step = 'name' | 'scan' | 'feed';
type View = 'news' | 'chat';

export default function Home() {
  const [step, setStep] = useState<Step>('name');
  const [view, setView] = useState<View>('news');
  const [name, setName] = useState("");
  const [bias, setBias] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [news, setNews] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scanData, setScanData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch News with Pagination
  const fetchNews = async (reset = false) => {
    // If not resetting (load more), block if already loading
    if (!reset && loading) return;

    // If resetting, cancel previous request
    if (reset) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setError(null);
    }

    setLoading(true);

    try {
      const pageToFetch = reset ? 1 : page;
      const res = await axios.get(`http://localhost:8000/feed?bias_filter=${bias}&page=${pageToFetch}&limit=10`, {
        signal: reset ? abortControllerRef.current?.signal : undefined
      });

      if (reset) {
        setNews(res.data.articles);
        setPage(2);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setNews((prev: any) => [...prev, ...res.data.articles]);
        setPage(prev => prev + 1);
      }

      setHasMore(res.data.articles.length === 10);
      setLoading(false); // Only set valid loading false here
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", bias);
        return; // Do NOT set loading to false, as a new request is likely pending/active
      }
      console.error("Error fetching news:", error);
      setError("Failed to load news. Server might be unavailable.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'feed') {
      // Debounce bias changes updates to not spam
      const timeoutId = setTimeout(() => {
        fetchNews(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [bias, step]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScanComplete = (data: any) => {
    setScanData(data);
    setBias(data.bias);
    setStep('feed');
  };

  // Recalibrate / Reset View
  const handleRecalibrate = () => {
    setStep('scan');
    // Optional: Reset stats?
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">

      <AnimatePresence mode="wait">

        {/* STEP 1: WELCOME / NAME */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-lg mb-8 shadow-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3 text-center">
              Echochamber
            </h1>
            <p className="text-gray-500 mb-10 text-center text-lg">
              Tailored news for a complex world.
            </p>

            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900"
                  onKeyDown={(e) => e.key === 'Enter' && name && setStep('scan')}
                />
              </div>

              <button
                onClick={() => setStep('scan')}
                disabled={!name}
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SCAN */}
        {step === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto"
          >
            <div className="w-full">
              <FaceScanner onScanComplete={handleScanComplete} />
            </div>
            <p className="mt-8 text-gray-400 text-sm">
              Establishing secure session for <span className="text-gray-900 font-semibold">{name}</span>
            </p>
          </motion.div>
        )}

        {/* STEP 3: DASHBOARD */}
        {step === 'feed' && (
          <div className="flex bg-white h-screen overflow-hidden">
            <Sidebar bias={bias} currentView={view} onViewChange={setView} />

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 lg:pl-64 xl:pr-80 bg-white h-full overflow-y-auto custom-scrollbar">
              {view === 'news' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-4xl mx-auto px-8 py-12 min-h-full flex flex-col"
                >
                  <header className="mb-10 pb-6 border-b border-gray-100 flex-none">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
                      Today's Briefing
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                      Curated for {name || "Guest"} • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </header>

                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-8 mb-12">
                      {news.length > 0 ? (
                        news.map((item: any, idx) => (
                          <NewsCard key={`${item.link}-${idx}`} article={item} index={idx} />
                        ))
                      ) : (
                        <div className="py-24 text-center">
                          {loading ? (
                            <>
                              <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-gray-400 text-sm font-medium">Building your personalized feed...</p>
                            </>
                          ) : (
                            error ? (
                              <div className="text-red-500 font-medium">
                                <p className="text-lg mb-2">⚠️ Connection Error</p>
                                <p className="text-sm text-red-400">{error}</p>
                                <button onClick={() => fetchNews(true)} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                  Retry Connection
                                </button>
                              </div>
                            ) : (
                              <p className="text-gray-500">No stories found matching your criteria.</p>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Load More Button */}
                    {news.length > 0 && hasMore && (
                      <div className="flex justify-center pb-20">
                        <button
                          onClick={() => fetchNews(false)}
                          disabled={loading}
                          className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading && <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />}
                          {loading ? 'Loading Headlines...' : 'Load More Stories'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col">
                  <SatireChat bias={bias} fullPage={true} />
                </div>
              )}
            </div>

            <UserPanel
              scanData={scanData}
              bias={bias}
              setBias={setBias}
              onRecalibrate={handleRecalibrate}
            />
          </div>
        )
        }


        {/* STEP 2: FACE SCANNER */}

      </AnimatePresence >
    </main >
  );
}