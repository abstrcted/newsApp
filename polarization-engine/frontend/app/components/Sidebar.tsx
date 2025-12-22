interface SidebarProps {
    bias: number;
    currentView: 'news' | 'chat';
    onViewChange: (view: 'news' | 'chat') => void;
}

export default function Sidebar({ bias, currentView, onViewChange }: SidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white z-30">
            <div className="p-8">
                <h1 className="text-xl font-bold font-sans tracking-tight text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                    Echochamber
                </h1>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                    Tailored News
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <button
                    onClick={() => onViewChange('news')}
                    className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center gap-3 ${currentView === 'news'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    News Feed
                </button>

                <button
                    onClick={() => onViewChange('chat')}
                    className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center gap-3 ${currentView === 'chat'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Assistant
                </button>
            </nav>
        </aside>
    );
}
