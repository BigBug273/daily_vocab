"use client";

type BarChartProps = {
    data: { name: string; score: number }[];
};

export default function BarChart({ data }: BarChartProps) {
    console.log("RAW CHART DATA:", data);

    if (!data || data.length === 0) {
        return <p className="text-gray-500">No score data available.</p>;
    }

    // Convert all scores to numbers
    const cleaned = data.map((d) => ({
        name: d.name,
        score: Number(d.score),
    }));

    console.log("CLEANED CHART DATA:", cleaned);

    const maxScore = Math.max(...cleaned.map((d) => d.score), 1);

    return (
        <div className="w-full h-[300px] bg-gray-50 p-4 rounded-lg border flex items-end justify-around">
            {cleaned.map((item, index) => {
                const barHeight = (item.score / maxScore) * 250; // pixels, not %

                return (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-end h-full"
                    >
                        <div
                            className="w-10 rounded-t-md shadow-md transition-all hover:scale-105"
                            style={{
                                backgroundColor: "#3B82F6",
                                height: `${barHeight}px`,
                            }}
                        />

                        <span className="text-xs text-gray-600 mt-2 font-medium">
                            {item.name}
                        </span>

                        <span className="text-xs text-gray-700">
                            {item.score.toFixed(1)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
