"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AstrologyDetailsPage() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true); // 🔥 loader state
    const [error, setError] = useState(null);

    const formatDate = (dob) => {
        if (!dob) return "";
        return new Date(dob).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${id}`)
            .then(res => res.json())
            .then(data => {
                const raw = data?.data?.[0]?.ai_output?.raw;

                if (!raw) {
                    setError("No report found for this ID."); // Friendly message for user
                    return;
                }

                let cleaned = raw.replace(/```json/, "").replace(/```/, "").trim();

                if (!cleaned || cleaned.length < 5) {
                    setError("Invalid report format.");
                    return;
                }

                try {
                    const parsed = JSON.parse(cleaned);
                    setResult(parsed);
                } catch (err) {
                    setError("Failed to parse report.");
                }
            })
            .catch(err => {
                setError("Error fetching report.");
            })
            .finally(() => setLoading(false));
    }, [id]);


    // Loader while fetching
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Error message
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white p-6">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <Link 
                    href="/"
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    ← Back to Reports
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white p-6">

            {/* BACK BUTTON */}
            <div className="mb-4">
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    ← Back
                </Link>
            </div>

            {/* HEADER */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-center">
                    🔮 AI Astrovaani Report
                </h1>
                <p className="text-gray-300">Your personalized Vedic analysis</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-7">

                {/* CARD COMPONENTS */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">👤 Basic Details</h2>
                    <div className="space-y-1 text-gray-200">
                        <p><b>Name:</b> {result.basic_details?.name}</p>
                        <p><b>DOB:</b> {formatDate(result.basic_details?.date_of_birth)}</p>
                        <p><b>TOB:</b> {result.basic_details?.time_of_birth}</p>
                        <p><b>POB:</b> {result.basic_details?.place_of_birth}</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">🧿 Personality</h2>
                    <p className="text-gray-200 leading-relaxed">{result.personality}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">💼 Best Career Options</h2>
                    <ul className="list-disc ml-5 space-y-1 text-gray-200">
                        {result.career?.top_5?.map((job, i) => (
                            <li key={i}>{job}</li>
                        ))}
                    </ul>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">⚠️ Things to Avoid</h2>
                    <p><b>Colors:</b> {result.avoid?.colors?.join(", ")}</p>
                    <p><b>Habits:</b> {result.avoid?.habits?.join(", ")}</p>
                    <p><b>Industries:</b> {result.avoid?.industries?.join(", ")}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">💍 Marriage Prediction</h2>
                    <p className="text-gray-200">{result.marriage}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">🪬 Remedies</h2>
                    <ul className="list-disc ml-5 space-y-1 text-gray-200">
                        {result.remedies?.map((rem, i) => (
                            <li key={i}>{rem}</li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}
