"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { AlertCircle, ImagePlus, Loader2, Star, X } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Matches the backend limits in backend/src/lib/product-images.ts. */
const MAX_MB = 5;
const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };

type Tile = { id: string; url?: string; preview: string; status: "uploading" | "done" | "error"; error?: string; name?: string };

const fromUrls = (urls: string[]): Tile[] => urls.map((url) => ({ id: url, url, preview: url, status: "done" }));

function rejectionMessage(rejection: FileRejection) {
  const code = rejection.errors[0]?.code;
  if (code === "file-too-large") return `${rejection.file.name} is larger than ${MAX_MB} MB.`;
  if (code === "file-invalid-type") return `${rejection.file.name} is not a JPG, PNG or WebP image.`;
  if (code === "too-many-files") return "Too many images at once.";
  return `${rejection.file.name} could not be added.`;
}

/**
 * Drag-and-drop product photo uploader. Each image uploads as soon as it is
 * added; the resulting URLs are written to a hidden `name` field (one per
 * line), so the surrounding form submits them like any other value. While an
 * upload is in progress the root carries `data-uploading`, which forms check
 * before submitting.
 */
export function ImageUploader({
  name,
  defaultValue = [],
  disabled = false,
  max = 8,
}: {
  name: string;
  defaultValue?: string[];
  disabled?: boolean;
  max?: number;
}) {
  const [tiles, setTiles] = useState<Tile[]>(() => fromUrls(defaultValue));
  const [notice, setNotice] = useState("");
  const previews = useRef(new Set<string>());

  // Release the in-memory previews created for local files.
  useEffect(() => {
    const created = previews.current;
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const upload = useCallback(async (tile: Tile, file: File) => {
    const body = new FormData();
    body.append("image", file);
    try {
      const result = await api.post<{ data: { url: string } }>("/api/v1/admin/products/images", body);
      setTiles((current) => current.map((item) => (item.id === tile.id ? { ...item, url: result.data.url, status: "done" } : item)));
    } catch (cause) {
      setTiles((current) => current.map((item) => (item.id === tile.id ? { ...item, status: "error", error: errorMessage(cause, "Upload failed.") } : item)));
    }
  }, []);

  const remaining = max - tiles.filter((tile) => tile.status !== "error").length;

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      const room = Math.max(0, remaining);
      const files = accepted.slice(0, room);
      const messages = rejected.map(rejectionMessage);
      if (accepted.length > room) messages.push(`Only ${max} images are allowed per product.`);
      setNotice(messages.join(" "));
      const added = files.map((file) => {
        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        return { id: preview, preview, status: "uploading" as const, name: file.name, file };
      });
      setTiles((current) => [...current, ...added.map(({ file: _file, ...tile }) => tile)]);
      added.forEach(({ file, ...tile }) => void upload(tile, file));
    },
    [max, remaining, upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_MB * 1024 * 1024,
    disabled: disabled || remaining <= 0,
    onDrop,
  });

  const remove = (id: string) => setTiles((current) => current.filter((tile) => tile.id !== id));
  const makeMain = (id: string) =>
    setTiles((current) => {
      const tile = current.find((item) => item.id === id);
      return tile ? [tile, ...current.filter((item) => item.id !== id)] : current;
    });

  const urls = tiles.filter((tile) => tile.status === "done" && tile.url).map((tile) => tile.url!);
  const uploading = tiles.some((tile) => tile.status === "uploading");

  return (
    <div className="grid gap-3 font-sans" data-uploading={uploading ? "true" : undefined}>
      <input type="hidden" name={name} value={urls.join("\n")} />

      {tiles.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-5 lg:grid-cols-6">
          {tiles.map((tile, index) => (
            <li key={tile.id} className={cn("group relative aspect-square overflow-hidden rounded-xl border bg-sage-50", tile.status === "error" ? "border-red-300" : index === 0 ? "border-brand-400 ring-1 ring-brand-300" : "border-sage-200")}>
              {/* Previews are blob: URLs or catalogue CDN links, so next/image does not apply. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.preview} alt={tile.name ?? `Product image ${index + 1}`} className={cn("block size-full object-contain p-2", tile.status !== "done" && "opacity-40")} />

              {index === 0 && tile.status === "done" && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  <Star className="size-3 fill-current" /> Main
                </span>
              )}

              {tile.status === "uploading" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-forest-900 shadow-sm">
                    <Loader2 className="size-3.5 animate-spin" /> Uploading
                  </span>
                </span>
              )}

              {tile.status === "error" && (
                <span className="absolute inset-x-2 bottom-2 flex items-start gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] leading-snug text-red-700">
                  <AlertCircle className="mt-px size-3 shrink-0" /> {tile.error}
                </span>
              )}

              {!disabled && tile.status !== "uploading" && (
                <span className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  {index > 0 && tile.status === "done" && (
                    <button
                      type="button"
                      onClick={() => makeMain(tile.id)}
                      title="Use as main image"
                      aria-label={`Use image ${index + 1} as the main image`}
                      className="grid size-7 cursor-pointer place-items-center rounded-lg border-0 bg-white/95 p-0 text-sage-600 shadow-sm hover:text-brand-700"
                    >
                      <Star className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(tile.id)}
                    title="Remove image"
                    aria-label={`Remove image ${index + 1}`}
                    className="grid size-7 cursor-pointer place-items-center rounded-lg border-0 bg-white/95 p-0 text-sage-600 shadow-sm hover:text-red-700"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && !disabled && (
        <div
          {...getRootProps({
            className: cn(
              "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-5 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isDragActive ? "border-brand-500 bg-brand-50" : "border-sage-300 bg-sage-50/60 hover:border-brand-400 hover:bg-brand-50/40",
            ),
          })}
        >
          <input {...getInputProps({ "aria-label": "Upload product images" })} />
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-xs ring-1 ring-sage-200", isDragActive ? "text-brand-600" : "text-sage-500")}>
            <ImagePlus className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-forest-900">
              {isDragActive ? "Drop the images here" : <><span className="font-semibold text-brand-700">Click to upload</span> or drag and drop</>}
            </span>
            <span className="mt-0.5 block text-xs text-sage-500">
              JPG, PNG or WebP · up to {MAX_MB} MB each · {remaining} of {max} remaining. The first image is the main photo.
            </span>
          </span>
        </div>
      )}

      {notice && <p className="m-0 text-sm text-red-700">{notice}</p>}
    </div>
  );
}

/** True while any uploader inside `form` is still sending images. */
export const hasPendingUploads = (form: HTMLFormElement) => Boolean(form.querySelector("[data-uploading]"));
