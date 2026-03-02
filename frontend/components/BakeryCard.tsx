import Link from "next/link";

type Bakery = {
  _id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: number | null;
  imageUrl?: string;
};

export default function BakeryCard({ bakery }: { bakery: Bakery }) {
  const distanceKm =
    typeof bakery.distance === "number" && Number.isFinite(bakery.distance)
      ? `${(bakery.distance / 1000).toFixed(1)} km`
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {bakery.imageUrl ? (
        <img
          src={bakery.imageUrl}
          alt={bakery.name}
          className="h-36 w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "block";
          }}
        />
      ) : null}
      <div
        className="h-36 bg-gradient-to-br from-orange-500 via-rose-500 to-red-600"
        style={{ display: bakery.imageUrl ? "none" : "block" }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{bakery.name}</h3>
          <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            {bakery.rating?.toFixed(1) || "N/A"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{bakery.address}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Bakery</span>
          <span>{distanceKm || "Distance unavailable"}</span>
        </div>
      </div>
      <Link
        href={`/bakery/${bakery._id}`}
        className="mx-4 mb-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        View cakes
      </Link>
    </article>
  );
}
