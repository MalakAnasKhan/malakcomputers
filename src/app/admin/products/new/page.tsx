import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#8A929C]">
        <Link href="/admin/products" className="hover:text-white">
          Products
        </Link>
        <span>/</span>
        <span className="text-white">New Product</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Upload New Component
        </h1>
        <p className="mt-1 text-xs text-[#8A929C]">
          Add a new graphics card, processor, motherboard, or hardware part to the Malak Computers catalog.
        </p>
      </div>

      <ProductForm action={createProductAction} submitLabel="Publish Component" />
    </div>
  );
}

