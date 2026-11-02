import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { toggleStockAction, deleteProductAction } from "./actions";
import { formatPrice } from "@/modules/catalog/presentation";
import { Icon } from "@/components/ui/icon";
import type { DbProduct } from "@/modules/catalog/supabase-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: DbProduct[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      products = data || [];
    }
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : "Failed to connect to database.";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Inventory & Products
          </h1>
          <p className="mt-1 text-xs text-[#8A929C]">
            Manage your hardware catalog, live stock availability, and prices.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6FF43] px-5 py-2.5 text-xs font-bold text-[#101114] transition hover:bg-[#c3ec33]"
        >
          <Icon name="plus" width="16" height="16" />
          <span>Upload Product</span>
        </Link>
      </div>

      {fetchError && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-amber-200">
          <p className="font-semibold text-amber-300">Notice connecting to Supabase `products` table:</p>
          <p className="mt-1">{fetchError}</p>
          <p className="mt-2 text-[#AEB4BB]">
            If you have not yet created the table in Supabase, run the script provided in{" "}
            <code className="text-[#D6FF43]">supabase/schema.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-3xl border border-[#24272D] bg-[#14161A]">
        {products.length === 0 && !fetchError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E2127] text-[#D6FF43]">
              <Icon name="box" width="28" height="28" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">No products found</h3>
            <p className="mt-1 max-w-sm text-xs text-[#8A929C]">
              Your database is connected. Start adding hardware components to your catalog.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D6FF43] px-5 py-2.5 text-xs font-bold text-[#101114] hover:bg-[#c3ec33]"
            >
              <Icon name="plus" width="14" height="14" />
              <span>Upload First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#24272D] bg-[#101114] text-[10px] font-semibold uppercase tracking-wider text-[#8A929C]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Product</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="px-5 py-3.5">Condition</th>
                  <th scope="col" className="px-5 py-3.5">Price</th>
                  <th scope="col" className="px-5 py-3.5">Stock</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228]">
                {products.map((product) => {
                  const firstImage =
                    Array.isArray(product.images) && product.images.length > 0
                      ? typeof product.images[0] === "string"
                        ? product.images[0]
                        : product.images[0].src
                      : "/images/catalog/sample-gpu.svg";

                  const isInStock = product.stock_status === "in-stock";

                  return (
                    <tr key={product.id} className="transition hover:bg-[#181A1F]">
                      {/* Product thumbnail & title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#2B2F38] bg-[#101114]">
                            <Image
                              src={firstImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                              unoptimized={firstImage.startsWith("http")}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white sm:max-w-xs">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-[#6B7280]">
                              /products/{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 font-medium text-[#D1D5DB]">
                        {product.category}
                      </td>

                      {/* Condition */}
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-[#24272D] px-2 py-0.5 text-[10px] font-semibold text-[#D6FF43]">
                          {product.condition}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 font-semibold text-white">
                        {formatPrice(product.price_pkr)}
                      </td>

                      {/* Stock Toggle Button */}
                      <td className="px-5 py-3.5">
                        <form
                          action={async () => {
                            "use server";
                            await toggleStockAction(
                              product.id,
                              isInStock ? "out-of-stock" : "in-stock"
                            );
                          }}
                        >
                          <button
                            type="submit"
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                              isInStock
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            }`}
                          >
                            {isInStock ? "● In Stock" : "○ Out of Stock"}
                          </button>
                        </form>
                      </td>

                      {/* Visibility Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${
                            product.published
                              ? "bg-white/5 text-[#AEB4BB]"
                              : "bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {product.published ? "Live" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="rounded-lg p-1.5 text-[#8A929C] transition hover:bg-[#252830] hover:text-white"
                            title="View on storefront"
                          >
                            <Icon name="eye" width="15" height="15" />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg p-1.5 text-[#8A929C] transition hover:bg-[#252830] hover:text-[#D6FF43]"
                            title="Edit product"
                          >
                            <Icon name="edit" width="15" height="15" />
                          </Link>

                          <form
                            action={async () => {
                              "use server";
                              await deleteProductAction(product.id, product.slug);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded-lg p-1.5 text-[#8A929C] transition hover:bg-red-500/10 hover:text-red-400"
                              title="Delete product"
                            >
                              <Icon name="trash" width="15" height="15" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

