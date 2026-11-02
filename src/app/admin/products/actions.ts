"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProductAction(formData: FormData) {
  const supabase = await createClient({ writable: true });

  const title = formData.get("title")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim().toLowerCase();
  const category = formData.get("category")?.toString().trim();
  const priceRaw = formData.get("price_pkr")?.toString().trim();
  const condition = formData.get("condition")?.toString() || "Used";
  const stock_status = formData.get("stock_status")?.toString() || "in-stock";
  const description = formData.get("description")?.toString().trim() || "";
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  // Parse specs & images from JSON
  const specsRaw = formData.get("specs_json")?.toString();
  const imagesRaw = formData.get("images_json")?.toString();

  let specs = [];
  try {
    specs = specsRaw ? JSON.parse(specsRaw) : [];
  } catch {
    specs = [];
  }

  let images = [];
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : [];
  } catch {
    images = [];
  }

  if (!title || !slug || !category) {
    throw new Error("Title, slug, and category are required.");
  }

  const price_pkr = priceRaw ? parseInt(priceRaw, 10) : null;

  const { error } = await supabase.from("products").insert({
    title,
    slug,
    category,
    price_pkr,
    condition,
    stock_status,
    description,
    specs,
    images,
    featured,
    published,
  });

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient({ writable: true });

  const title = formData.get("title")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim().toLowerCase();
  const category = formData.get("category")?.toString().trim();
  const priceRaw = formData.get("price_pkr")?.toString().trim();
  const condition = formData.get("condition")?.toString() || "Used";
  const stock_status = formData.get("stock_status")?.toString() || "in-stock";
  const description = formData.get("description")?.toString().trim() || "";
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  const specsRaw = formData.get("specs_json")?.toString();
  const imagesRaw = formData.get("images_json")?.toString();

  let specs = [];
  try {
    specs = specsRaw ? JSON.parse(specsRaw) : [];
  } catch {
    specs = [];
  }

  let images = [];
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : [];
  } catch {
    images = [];
  }

  if (!title || !slug || !category) {
    throw new Error("Title, slug, and category are required.");
  }

  const price_pkr = priceRaw ? parseInt(priceRaw, 10) : null;

  const { error } = await supabase
    .from("products")
    .update({
      title,
      slug,
      category,
      price_pkr,
      condition,
      stock_status,
      description,
      specs,
      images,
      featured,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string, slug?: string) {
  const supabase = await createClient({ writable: true });

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  revalidatePath("/shop");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
}

export async function toggleStockAction(id: string, nextStatus: "in-stock" | "out-of-stock") {
  const supabase = await createClient({ writable: true });

  const { error } = await supabase
    .from("products")
    .update({ stock_status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update stock status: ${error.message}`);
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

