import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "../../actions";
import type { DbProduct } from "@/modules/catalog/supabase-products";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as DbProduct;

  let specsArray: { name: string; value: string }[] = [];
  if (Array.isArray(product.specs)) {
    specsArray = product.specs;
  } else if (product.specs && typeof product.specs === "object") {
    specsArray = Object.entries(product.specs).map(([name, value]) => ({
      name,
      value: String(value),
    }));
  }

  const initialData = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category,
    price_pkr: product.price_pkr,
    condition: product.condition,
    stock_status: product.stock_status,
    description: product.description,
    specs: specsArray,
    images: product.images,
    featured: product.featured,
    published: product.published,
  };

  const boundUpdateAction = updateProductAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#8A929C]">
        <Link href="/admin/products" className="hover:text-white">
          Products
        </Link>
        <span>/</span>
        <span className="text-white">Edit</span>
        <span>/</span>
        <span className="truncate text-[#AEB4BB]">{product.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit Product
        </h1>
        <p className="mt-1 text-xs text-[#8A929C]">
          Update hardware details, stock availability, or imagery.
        </p>
      </div>

      <ProductForm
        initialData={initialData}
        action={boundUpdateAction}
        submitLabel="Update Component"
      />
    </div>
  );
}

