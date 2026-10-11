"use client";

import { useDropzone, type FileRejection } from "react-dropzone";
import { CheckCircle2, FileText, ImageIcon, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const MAX_UPLOAD_MB = 10;
const ACCEPT = { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

export const fileSizeLabel = (bytes: number) =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function rejectionMessage(rejections: FileRejection[]) {
  const code = rejections[0]?.errors[0]?.code;
  if (code === "file-too-large") return `That file is larger than ${MAX_UPLOAD_MB} MB.`;
  if (code === "file-invalid-type") return "Upload a PDF, JPG or PNG file.";
  if (code === "too-many-files") return "Choose one file for this document.";
  return "That file could not be used. Try another.";
}

/** One document slot: drop or browse, then shows the chosen file with a remove action. */
export function FileDrop({
  id,
  label,
  description,
  required,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const [rejected, setRejected] = useState("");
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_UPLOAD_MB * 1024 * 1024,
    multiple: false,
    noClick: Boolean(file),
    onDrop: (accepted, rejections) => {
      if (accepted[0]) {
        setRejected("");
        onChange(accepted[0]);
      } else if (rejections.length) {
        setRejected(rejectionMessage(rejections));
      }
    },
  });
  const message = rejected || error;
  const isImage = file?.type.startsWith("image/");

  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-forest-900">
          {label}
          {required ? <span className="text-brand-600" aria-hidden="true">*</span> : <span className="ml-1.5 text-xs font-normal text-sage-500">Optional</span>}
        </span>
      </div>
      <div
        {...getRootProps({
          className: cn(
            "group relative flex min-h-20 min-w-0 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            file ? "cursor-default border-solid border-brand-200 bg-brand-50/60" : "border-sage-300 bg-sage-50/60 hover:border-brand-400 hover:bg-brand-50/40",
            isDragActive && "scale-[1.01] border-brand-500 bg-brand-50",
            message && !file && "border-destructive/50 bg-destructive/5",
          ),
          "aria-invalid": message ? true : undefined,
          "aria-describedby": message ? `${id}-error` : undefined,
        })}
      >
        <input {...getInputProps({ id, "aria-label": label })} />
        {file ? (
          <>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-brand-700 shadow-xs ring-1 ring-brand-100">
              {isImage ? <ImageIcon className="size-4.5" /> : <FileText className="size-4.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-forest-900" title={file.name}>
                <CheckCircle2 className="size-4 shrink-0 text-brand-600" />
                <span className="truncate">{file.name}</span>
              </span>
              <span className="mt-0.5 block text-xs text-sage-500">{fileSizeLabel(file.size)} · ready to upload</span>
              <button type="button" onClick={open} className="mt-1 cursor-pointer text-xs font-semibold text-brand-700 hover:underline">Replace file</button>
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Remove ${label}`}
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-sage-400 transition-colors hover:bg-white hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-white text-sage-500 shadow-xs ring-1 ring-sage-200 transition-colors group-hover:text-brand-600", isDragActive && "text-brand-600")}>
              <UploadCloud className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-forest-900">
                {isDragActive ? "Drop the file here" : <><span className="font-semibold text-brand-700">Click to upload</span> or drag and drop</>}
              </span>
              <span className="mt-0.5 block text-xs text-sage-500">{description ?? `PDF, JPG or PNG · up to ${MAX_UPLOAD_MB} MB`}</span>
            </span>
          </>
        )}
      </div>
      {message && <p id={`${id}-error`} className="text-sm text-destructive">{message}</p>}
    </div>
  );
}
