import Link from "next/link";

type Bakery = {
  _id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: number | null;
  imageUrl?: string;
};

const bakeryFallbackImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
      <rect width="800" height="400" fill="#f6e7d8" />
      <circle cx="160" cy="120" r="64" fill="#e8c2a0" opacity="0.55" />
      <circle cx="700" cy="90" r="48" fill="#d6a77a" opacity="0.45" />
      <circle cx="660" cy="320" r="84" fill="#edcfb2" opacity="0.65" />
      <text x="50%" y="48%" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#7a4b2d">
        Bakery Image
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#9a6a49">
        Preview unavailable
      </text>
    </svg>
  `);

export default function BakeryCard({ bakery }: { bakery: Bakery }) {
  const distanceKm =
    typeof bakery.distance === "number" && Number.isFinite(bakery.distance)
      ? `${(bakery.distance / 1000).toFixed(1)} km`
      : null;

  return (
    <Link href={`/bakery/${bakery._id}`} className="block hover:shadow-lg transition-shadow duration-300">
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <img
          src={bakery.imageUrl || bakeryFallbackImage}
          alt={bakery.name}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = bakeryFallbackImage;
          }}
        />
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-900">{bakery.name}</h3>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 13 14.29 15.45 20.05 12 16.77 8.55 20.05 11 14.29 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="text-sm font-medium text-yellow-600">
                {bakery.rating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{bakery.address}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              </svg>
              Bakery
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {distanceKm || "Distance unavailable"}
            </span>
          </div>
          <div className="mt-4">
            <button className="w-full bg-brand-500 text-white font-medium px-5 py-2 rounded-lg hover:bg-brand-600 transition-colors transform hover:-translate-y-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
              View cakes
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
