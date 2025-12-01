"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAstrologyReport() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        dob: "",
        tob: "",
        pob: "",
    });

    const [loading, setLoading] = useState(false); // loader state
    const [errors, setErrors] = useState([]); // store backend validation errors

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]); // reset errors

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/astrology"); // Redirect back to list
            } else {
                // If backend sends array of errors
                if (Array.isArray(data.detail)) {
                    setErrors(data.detail);
                } else {
                    setErrors([{ msg: data.detail || "Something went wrong!" }]);
                }
            }
        } catch (error) {
            setErrors([{ msg: "Something went wrong!" }]);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-900 text-white px-6 py-10 flex justify-center">

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl max-w-lg w-full shadow-xl">
                
                {/* Back Button */}
                <button
                    onClick={() => router.push("/")}
                    className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold text-center mb-6">
                    ✨ Generate Astrology Report
                </h1>

                {/* Display backend validation errors */}
                {errors.length > 0 && (
                    <ul className="text-red-400 text-sm mb-4 list-disc ml-5">
                        {errors.map((err, idx) => (
                            <li key={idx}>{err.msg}</li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white"
                        required
                    />

                    <input
                        type="date"
                        name="dob"
                        onChange={handleChange}
                        className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white"
                        required
                    />

                    <input
                        type="time"
                        name="tob"
                        onChange={handleChange}
                        className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white"
                        required
                    />

                    <input
                        type="text"
                        name="pob"
                        placeholder="Place of Birth"
                        onChange={handleChange}
                        className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl mt-4 font-semibold transition-all duration-300 
                            ${loading 
                                ? "bg-purple-400 cursor-not-allowed" 
                                : "bg-purple-600 hover:bg-purple-700"}`}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center gap-2">
                                <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Generating...
                            </div>
                        ) : (
                            "🔮 Generate Report"
                        )}
                    </button>
                </form>
            </div>

            {/* Loader CSS */}
            <style>{`
                .loader {
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
}