const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

export async function fetchSummary() {
    const res = await fetch(`${API_BASE}/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch summary");
    return res.json();
}

export async function fetchHistory() {
    const res = await fetch(`${API_BASE}/history`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
}
