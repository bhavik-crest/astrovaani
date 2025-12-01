"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AstrologyListPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/reports")
            .then((res) => res.json())
            .then((data) => setReports(data.data || []))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dob) => {
        if (!dob) return "";
        return new Date(dob).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white px-6 py-10">

            {/* HEADER + CREATE BUTTON */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
                <h1 className="text-3xl font-bold tracking-wide">
                    🔮 Astrology Reports
                </h1>

                <Link
                    href="/astrology/create"
                    className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md hover:bg-white/20 transition-all duration-300 font-medium text-sm"
                >
                    ➕ Create Report
                </Link>
            </div>

            {/* LOADER */}
            {loading && (
                <div className="flex justify-center mt-32">
                    <div className="w-12 h-12 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && reports.length === 0 && (
                <p className="text-center text-gray-300 mt-20 text-lg">
                    No reports found. Generate one to get started.
                </p>
            )}

            {/* REPORT LIST */}
            {!loading && reports.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-4">

                    {reports.map((r) => (
                        <Link
                            key={r.id}
                            href={`/astrology/${r.id}`}
                            className=" block p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/30 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{r?.name}</h2>
                                <span className="text-purple-300 text-sm">▶</span>
                            </div>

                            <p className="text-gray-300 mt-1 text-sm">
                                {formatDate(r?.dob)} • {r?.tob}
                            </p>
                        </Link>
                    ))}

                </div>
            )}

        </div>
    );
}
