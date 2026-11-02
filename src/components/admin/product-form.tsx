"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, conditions } from "@/modules/catalog/types";
import { ImageUploader } from "./image-uploader";
import { Icon } from "@/components/ui/icon";

type SpecEntry = {
  name: string;
  value: string;
};

type ImageEntry = {
  src: string;
  alt: string;
};

interface ProductFormProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    category?: string;
    price_pkr?: number | null;
    condition?: "Box Pack" | "Used" | "Refurbished";
    stock_status?: "in-stock" | "out-of-stock" | "on-request";
    description?: string;
    specs?: SpecEntry[];
    images?: ImageEntry[] | string[];
    featured?: boolean;
    published?: boolean;
  };
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({
  initialData,
  action,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Specifications state
  const [specs, setSpecs] = useState<SpecEntry[]>(() => {
    if (initialData?.specs && Array.isArray(initialData.specs)) {
      return initialData.specs;
    }
    return [
      { name: "Brand", value: "" },
      { name: "Model / Series", value: "" },
    ];
  });

  // Images state
  const [images, setImages] = useState<ImageEntry[]>(() => {
    if (!initialData?.images) return [];
    return initialData.images.map((img) =>
      typeof img === "string" ? { src: img, alt: "" } : img
    );
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { name: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: "name" | "value", value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set("specs_json", JSON.stringify(specs.filter((s) => s.name.trim())));
      formData.set("images_json", JSON.stringify(images));

      await action(formData);
    } catch (err: unknown) {
      console.error("Form submit error:", err);
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-3xl border border-[#24272D] bg-[#14161A] p-6 sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-white">Basic Information</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Product Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. ASUS ROG Strix GeForce RTX 4080 Super 16GB"
              className="mt-2 w-full rounded-xl border border-[#2B2F38] bg-[#101114] px-4 py-3 text-sm text-white placeholder-[#505763] focus:border-[#D6FF43] focus:outline-none focus:ring-1 focus:ring-[#D6FF43]"
            />
          </div>

          {/* Slug */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="slug"
                className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
              >
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[11px] text-[#D6FF43] hover:underline"
              >
                {autoSlug ? "Manual Slug" : "Auto-generate from Title"}
              </button>
            </div>
            <div className="relative mt-2 flex items-center">
              <span className="pointer-events-none absolute left-4 text-xs text-[#525964]">
                /products/
              </span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                readOnly={autoSlug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className={`w-full rounded-xl border border-[#2B2F38] bg-[#101114] py-3 pl-24 pr-4 text-sm text-white placeholder-[#505763] focus:border-[#D6FF43] focus:outline-none ${
                  autoSlug ? "opacity-80" : ""
                }`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={initialData?.category || categories[0]}
              className="mt-2 w-full rounded-xl border border-[#2B2F38] bg-[#101114] px-4 py-3 text-sm text-white focus:border-[#D6FF43] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price (PKR) */}
          <div>
            <label
              htmlFor="price_pkr"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Price (PKR)
            </label>
            <div className="relative mt-2 flex items-center">
              <span className="pointer-events-none absolute left-4 text-xs font-medium text-[#7C8592]">
                Rs.
              </span>
              <input
                id="price_pkr"
                name="price_pkr"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData?.price_pkr ?? ""}
                placeholder="Leave blank for 'Price on Request'"
                className="w-full rounded-xl border border-[#2B2F38] bg-[#101114] py-3 pl-12 pr-4 text-sm text-white placeholder-[#505763] focus:border-[#D6FF43] focus:outline-none"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label
              htmlFor="condition"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Condition *
            </label>
            <select
              id="condition"
              name="condition"
              defaultValue={initialData?.condition || "Used"}
              className="mt-2 w-full rounded-xl border border-[#2B2F38] bg-[#101114] px-4 py-3 text-sm text-white focus:border-[#D6FF43] focus:outline-none"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status */}
          <div>
            <label
              htmlFor="stock_status"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Stock Status *
            </label>
            <select
              id="stock_status"
              name="stock_status"
              defaultValue={initialData?.stock_status || "in-stock"}
              className="mt-2 w-full rounded-xl border border-[#2B2F38] bg-[#101114] px-4 py-3 text-sm text-white focus:border-[#D6FF43] focus:outline-none"
            >
              <option value="in-stock">In Stock (Available)</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="on-request">On Request / Backorder</option>
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-[#AEB4BB]"
            >
              Description & Hardware Notes
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              placeholder="Detailed description, box accessories, condition details, benchmarking notes..."
              className="mt-2 w-full rounded-xl border border-[#2B2F38] bg-[#101114] px-4 py-3 text-sm text-white placeholder-[#505763] focus:border-[#D6FF43] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hardware Specifications Builder */}
      <div className="rounded-3xl border border-[#24272D] bg-[#14161A] p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Hardware Specifications</h2>
            <p className="text-xs text-[#8A929C]">Key technical specifications for this item.</p>
          </div>
          <button
            type="button"
            onClick={handleAddSpec}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#2B2F38] bg-[#1A1D23] px-3 py-1.5 text-xs font-semibold text-[#D6FF43] hover:bg-[#22272F]"
          >
            <Icon name="plus" width="14" height="14" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="space-y-3">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Spec Name (e.g. VRAM, Socket, Clock)"
                value={spec.name}
                onChange={(e) => handleSpecChange(idx, "name", e.target.value)}
                className="w-1/3 rounded-xl border border-[#2B2F38] bg-[#101114] px-3.5 py-2.5 text-xs text-white placeholder-[#525964] focus:border-[#D6FF43] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g. 16GB GDDR6X, AM5, 5.7 GHz)"
                value={spec.value}
                onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                className="flex-1 rounded-xl border border-[#2B2F38] bg-[#101114] px-3.5 py-2.5 text-xs text-white placeholder-[#525964] focus:border-[#D6FF43] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                title="Remove spec"
              >
                <Icon name="trash" width="15" height="15" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images Uploader */}
      <div className="rounded-3xl border border-[#24272D] bg-[#14161A] p-6 sm:p-8">
        <ImageUploader slug={slug} initialImages={images} onChange={setImages} />
      </div>

      {/* Visibility Settings */}
      <div className="rounded-3xl border border-[#24272D] bg-[#14161A] p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-white">Storefront Display</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initialData?.published !== false}
              className="h-4 w-4 rounded accent-[#D6FF43]"
            />
            <span className="text-sm font-medium text-white">
              Published (Visible on Storefront)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={Boolean(initialData?.featured)}
              className="h-4 w-4 rounded accent-[#D6FF43]"
            />
            <span className="text-sm font-medium text-white">
              Featured on Homepage
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/products"
          className="rounded-xl border border-[#2B2F38] px-5 py-3 text-sm font-semibold text-[#9CA3AF] transition hover:bg-[#1A1D23] hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D6FF43] px-7 py-3 text-sm font-bold text-[#101114] transition hover:bg-[#c3ec33] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Icon name="refresh" className="animate-spin" width="16" height="16" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}

