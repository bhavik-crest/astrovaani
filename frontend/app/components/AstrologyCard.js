export default function AstrologyCard({ title, description, remedy }) {
  return (
    <div className="card mb-4 p-5">
      <h2 className="text-xl font-bold text-purple-300 mb-2">{title}</h2>
      <p className="text-gray-300 mb-3">{description}</p>

      {remedy && (
        <div className="mt-2 p-3 rounded bg-purple-900/40 border border-purple-600/50">
          <p className="text-sm text-purple-200">⭐ Remedy: {remedy}</p>
        </div>
      )}
    </div>
  );
}
