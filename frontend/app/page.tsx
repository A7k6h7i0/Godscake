import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Cake Delivery Platform</p>
      <h1 className="text-4xl font-bold leading-tight text-gray-900">Order Cakes Nearby or Send Gifts Anywhere</h1>
      <p className="max-w-2xl text-gray-700">
        Discover bakeries near your delivery location, browse their cakes, place orders, and track status in real time.
      </p>
      <div className="flex gap-3">
        <Link href="/bakeries" className="rounded-md bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
          Find Bakeries
        </Link>
        <Link href="/register" className="rounded-md border border-brand-500 px-5 py-2.5 font-medium text-brand-700">
          Create Account
        </Link>
      </div>
    </section>
  );
}
