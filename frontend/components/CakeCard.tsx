type Cake = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  bakeryId: string;
};

export default function CakeCard({ cake, onAdd }: { cake: Cake; onAdd: () => void }) {
  return (
    <article className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <img
        src={cake.imageUrl || "https://placehold.co/600x400"}
        alt={cake.name}
        className="h-44 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{cake.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{cake.description || "Freshly made cake"}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-brand-700">Rs. {cake.price}</span>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
