export function CatalogLoading() {
  return <div aria-busy="true" role="status" className="py-12"><p className="mb-6 text-xs text-neutral-500">Loading the catalog…</p><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="aspect-square bg-neutral-100" />)}</div></div>;
}
