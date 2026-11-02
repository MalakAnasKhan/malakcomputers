"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";

type ImageEntry = {
  src: string;
  alt: string;
};

interface ImageUploaderProps {
  slug: string;
  initialImages?: ImageEntry[] | string[];
  onChange: (images: ImageEntry[]) => void;
}

export function ImageUploader({ slug, initialImages = [], onChange }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageEntry[]>(() => {
    return initialImages.map((img) =>
      typeof img === "string" ? { src: img, alt: "" } : img
    );
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  const updateImages = (newImages: ImageEntry[]) => {
    setImages(newImages);
    onChange(newImages);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const uploadedEntries: ImageEntry[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const cleanSlug = (slug || "product").toLowerCase().replace(/[^a-z0-9-]/g, "");
        const filePath = `${cleanSlug}/${Date.now()}_${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          throw new Error(`Upload failed for ${file.name}: ${uploadErr.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedEntries.push({
            src: urlData.publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          });
        }
      }

      const merged = [...images, ...uploadedEntries];
      updateImages(merged);
    } catch (err: unknown) {
      console.error("Storage upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload images.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    updateImages(next);
  };

  const addManualUrl = () => {
    if (!manualUrl.trim()) return;
    const next = [...images, { src: manualUrl.trim(), alt: "Product view" }];
    updateImages(next);
    setManualUrl("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-[#AEB4BB]">
          Product Images (Multi-upload to Supabase Storage)
        </label>
        <p className="text-xs text-[#8A929C]">
          Upload product photographs. First image will be used as the primary showcase thumbnail.
        </p>
      </div>

      {uploadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {uploadError}
        </div>
      )}

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-[#2B2F38] bg-[#14161A]"
          >
            <Image
              src={img.src}
              alt={img.alt || `Product image ${idx + 1}`}
              fill
              className="object-cover transition group-hover:scale-105"
              unoptimized={img.src.startsWith("http")}
            />
            {idx === 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-[#D6FF43] px-2 py-0.5 text-[9px] font-bold text-[#101114]">
                PRIMARY
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-red-400 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-red-500 hover:text-white"
              title="Remove Image"
            >
              <Icon name="close" width="14" height="14" />
            </button>
          </div>
        ))}

        {/* Upload Trigger Box */}
        <label
          className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2B2F38] bg-[#14161A]/50 p-4 text-center transition hover:border-[#D6FF43] hover:bg-[#181A1F] ${
            isUploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-xs text-[#D6FF43]">
              <Icon name="refresh" className="animate-spin" width="24" height="24" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-xs text-[#8A929C]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24272D] text-[#D6FF43]">
                <Icon name="upload" width="20" height="20" />
              </div>
              <span className="font-medium text-white">Upload Photos</span>
              <span className="text-[10px] text-[#6B7280]">PNG, JPG, WEBP</span>
            </div>
          )}
        </label>
      </div>

      {/* Manual URL Input Option */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="url"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Or paste an existing image URL (e.g. /images/catalog/sample-gpu.svg)"
          className="flex-1 rounded-xl border border-[#2B2F38] bg-[#14161A] px-3.5 py-2 text-xs text-white placeholder-[#525964] focus:border-[#D6FF43] focus:outline-none"
        />
        <button
          type="button"
          onClick={addManualUrl}
          className="rounded-xl border border-[#2B2F38] bg-[#1E2127] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#282D36]"
        >
          Add URL
        </button>
      </div>
    </div>
  );
}

