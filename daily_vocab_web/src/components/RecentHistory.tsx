"use client";

type HistoryItem = {
    word: string;
    user_sentence?: string;
    score: number;
    level?: string;
    practiced_at: string; // ISO or parseable string
};

type Props = {
    items: HistoryItem[];
};

function getLevelFromScore(score: number): string {
    if (score >= 8) return "Advanced";
    if (score >= 6) return "Intermediate";
    return "Beginner";
}

export default function RecentHistory({ items }: Props) {
    if (!items || items.length === 0) {
        return <p className="text-gray-500">No practice history yet.</p>;
    }

    return (
        <div className="space-y-4">
            {items.map((h, i) => {
                let dateString = "Unknown date";

                if (h.practiced_at) {
                    try {
                        const date = new Date(h.practiced_at);
                        if (!isNaN(date.getTime())) {
                            dateString = date.toLocaleString();
                        }
                    } catch {
                        // keep fallback
                    }
                }

                const effectiveLevel = h.level || getLevelFromScore(h.score);

                return (
                    <div
                        key={i}
                        className="p-4 rounded-xl border bg-gray-50 shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Word + Date */}
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-900">
                                {h.word}
                            </h3>
                            <span className="text-sm text-gray-500">
                                {dateString}
                            </span>
                        </div>

                        {/* Sentence */}
                        <p className="mt-2 text-sm text-gray-700 italic">
                            {h.user_sentence || "(no sentence recorded)"}
                        </p>

                        {/* Score + Level */}
                        <div className="mt-3 flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                                Score:{" "}
                                <span className="text-blue-600 font-semibold">
                                    {h.score.toFixed(1)}
                                </span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                                {effectiveLevel}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
