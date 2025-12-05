"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import BarChart from "@/components/BarChart";
import RecentHistory from "@/components/RecentHistory";

import { fetchSummary, fetchHistory } from "@/lib/dashboardApi";

export default function DashboardPage() {
    const [summary, setSummary] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [summaryData, historyData] = await Promise.all([
                    fetchSummary(),
                    fetchHistory(),
                ]);

                setSummary(summaryData);

                // Format practiced_at timestamps
                const fixedHistory = historyData.map((item: any) => ({
                    ...item,
                    practiced_at: new Date(item.practiced_at).toLocaleString(),
                }));

                setHistory(fixedHistory);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading || !summary) {
        return (
            <div className="flex justify-center items-center h-screen text-xl">
                Loading dashboard…
            </div>
        );
    }

    // Determine highest level from summary.level_distribution
    const topLevel =
        Object.entries(summary.level_distribution)
            .sort((a, b) => b[1] - a[1])[0][0];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Dashboard Summary</h1>

            {/* --- STAT CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatsCard title="Average Score" value={summary.average_score.toFixed(2)} />
                <StatsCard title="Words Practiced" value={summary.total_words_practiced} />
                <StatsCard title="Top Level" value={topLevel} />
            </div>

            {/* --- SCORE PROGRESS CHART --- */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4">Score Progress</h2>

                <BarChart
                    data={history.map((h, index) => ({
                        name: h.word || `Try ${index + 1}`,
                        score: h.score,
                    }))}
                />
            </div>

            {/* --- RECENT HISTORY LIST --- */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Recent History</h2>
                <RecentHistory items={history} />
            </div>
        </div>
    );
}

