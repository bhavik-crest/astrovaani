"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AstrologyDetailsPage() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState("english");

    // Label translations
    const labels = {
        english: {
            back: "← Back",
            backToReports: "← Back to Reports",
            headerTitle: "🔮 AI Astrovaani Report",
            headerSubtitle: "Your personalized Vedic analysis",
            basicDetails: "👤 Basic Details",
            personality: "🧿 Personality",
            career: "💼 Best Career Options",
            avoid: "⚠️ Things to Avoid",
            marriage: "💍 Marriage Prediction",
            remedies: "🪬 Remedies",
            colors: "Colors",
            habits: "Habits",
            industries: "Industries",
            noData: "No data available"
        },
        hindi: {
            back: "← Back",
            backToReports: "← Back to Reports",
            headerTitle: "🔮 AI Astrovaani Report",
            headerSubtitle: "आपका व्यक्तिगत वैदिक विश्लेषण",
            basicDetails: "👤 बुनियादी जानकारी",
            personality: "🧿 व्यक्तित्व",
            career: "💼 श्रेष्ठ करियर विकल्प",
            avoid: "⚠️ बचें ये चीज़ें",
            marriage: "💍 विवाह की भविष्यवाणी",
            remedies: "🪬 उपाय",
            colors: "रंग",
            habits: "आदतें",
            industries: "उद्योग",
            noData: "कोई डेटा उपलब्ध नहीं"
        },
        gujarati: {
            back: "← Back",
            backToReports: "← Back to Reports",
            headerTitle: "🔮 AI Astrovaani Report",
            headerSubtitle: "તમારો વ્યક્તિગત વૈદિક વિશ્લેષણ",
            basicDetails: "👤 મૂળભૂત વિગતો",
            personality: "🧿 વ્યક્તિત્વ",
            career: "💼 શ્રેષ્ઠ કરિયર વિકલ્પો",
            avoid: "⚠️ ટાળવા જેવી વસ્તુઓ",
            marriage: "💍 લગ્નની ભવિષ્યવાણી",
            remedies: "🪬 ઉપાય",
            colors: "રંગો",
            habits: "આદતો",
            industries: "ઉદ્યોગો",
            noData: "કોઈ ડેટા ઉપલબ્ધ નથી"
        }
    };

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
                setLanguage(data?.data?.[0]?.language || "english");
                const raw = data?.data?.[0]?.ai_output?.raw;

                if (!raw) {
                    setError("No report found for this ID.");
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

    // Determine user language (fallback to English)
    const userLang = language || "english";
    const t = labels[userLang] || labels["english"];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white p-6">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <Link 
                    href="/"
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    {t.backToReports}
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
                    {t.back}
                </Link>
            </div>

            {/* HEADER */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold">{t.headerTitle}</h1>
                <p className="text-gray-300">{t.headerSubtitle}</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-7">

                {/* BASIC DETAILS */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.basicDetails}</h2>
                    <div className="space-y-1 text-gray-200">
                        <p><b>Name:</b> {result.basic_details?.name || t.noData}</p>
                        <p><b>DOB:</b> {formatDate(result.basic_details?.date_of_birth) || t.noData}</p>
                        <p><b>TOB:</b> {result.basic_details?.time_of_birth || t.noData}</p>
                        <p><b>POB:</b> {result.basic_details?.place_of_birth || t.noData}</p>
                    </div>
                </div>

                {/* PERSONALITY */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.personality}</h2>
                    <p className="text-gray-200 leading-relaxed">{result.personality || t.noData}</p>
                </div>

                {/* CAREER */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.career}</h2>
                    <ul className="list-disc ml-5 space-y-1 text-gray-200">
                        {(Array.isArray(result.career?.top_5) ? result.career.top_5 : []).map((job, i) => (
                            <li key={i}>{job}</li>
                        ))}
                        {(!result.career?.top_5?.length) && <li>{t.noData}</li>}
                    </ul>
                </div>

                {/* THINGS TO AVOID */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.avoid}</h2>
                    <p><b>{t.colors}:</b> {(Array.isArray(result.avoid?.colors) ? result.avoid.colors.join(", ") : t.noData)}</p>
                    <p><b>{t.habits}:</b> {(Array.isArray(result.avoid?.habits) ? result.avoid.habits.join(", ") : t.noData)}</p>
                    <p><b>{t.industries}:</b> {(Array.isArray(result.avoid?.industries) ? result.avoid.industries.join(", ") : t.noData)}</p>
                </div>

                {/* MARRIAGE */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.marriage}</h2>
                    <p className="text-gray-200">{result.marriage || t.noData}</p>
                </div>

                {/* REMEDIES */}
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 transition">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">{t.remedies}</h2>
                    <ul className="list-disc ml-5 space-y-1 text-gray-200">
                        {(Array.isArray(result.remedies) ? result.remedies : [result.remedies])
                            .filter(Boolean)
                            .map((rem, i) => (
                                <li key={i}>{rem}</li>
                        ))}
                        {(!result.remedies || !result.remedies.length) && <li>{t.noData}</li>}
                    </ul>
                </div>

            </div>
        </div>
    );
}