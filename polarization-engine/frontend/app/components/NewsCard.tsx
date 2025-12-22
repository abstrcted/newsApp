import React from 'react';

interface NewsCardProps {
    article: {
        title: string;
        summary: string;
        source: string;
        rage_score: number;
        link: string;
        media?: string;
        image_url?: string;
        topic?: string;
        published_date: string;
    };
    index: number;
}

export default function NewsCard({ article, index }: NewsCardProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString || 'Recent';
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return 'Recent';
        }
    };

    const imageUrl = article.media || article.image_url;

    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-72 w-full overflow-hidden bg-gray-100 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6),linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6)] bg-[size:20px_20px]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        {article.topic || 'General'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                        {formatDate(article.published_date)}
                    </span>
                </div>

                <h3 className="text-lg font-bold leading-tight mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {article.summary}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                        {article.source ? article.source[0] : 'N'}
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                        {article.source || 'Unknown Source'}
                    </span>
                </div>
            </div>
        </a>
    );
}
