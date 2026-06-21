"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMessMenuAction } from "./actions";
import { formatBytes } from "@/lib/utils";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_MB  = 10;

export function MessMenuUploadForm() {
  const formRef      = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, start]    = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    setSuccess(null);
    setPreview(null);
    if (!f) return setFile(null);
    if (!ALLOWED.includes(f.type)) {
      setError("Only PDF, JPEG, PNG, or WebP files are allowed.");
      return setFile(null);
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum is ${MAX_MB} MB.`);
      return setFile(null);
    }
    setFile(f);
    // Show image preview immediately
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Please select a file.");
    setError(null);

    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await uploadMessMenuAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Menu uploaded! Students can now see the new menu.");
        setFile(null);
        setPreview(null);
        formRef.current?.reset();
      }
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Upload New Menu
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        The new upload will immediately replace the current menu shown to students.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Menu Label <span className="text-red-500">*</span>
          </label>
          <input
            name="label"
            type="text"
            required
            placeholder='e.g. "Week of June 19, 2026" or "Eid Menu"'
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            This label is shown to students below the menu.
          </p>
        </div>

        {/* File drop zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Menu File <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl cursor-pointer
                        hover:border-brand-400 hover:bg-brand-50 transition-colors
                        ${file ? "border-green-400 bg-green-50" : "border-gray-300"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Image preview inside dropzone */}
            {preview ? (
              <div className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-auto mx-auto rounded-lg object-contain"
                />
                <p className="text-xs text-green-700 font-medium text-center mt-2">
                  {file?.name} · {formatBytes(file?.size ?? 0)}
                </p>
                <p className="text-xs text-gray-400 text-center mt-0.5">
                  Click to change
                </p>
              </div>
            ) : file ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">PDF</span>
                </div>
                <p className="text-sm font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-green-600 mt-1">{formatBytes(file.size)} · Click to change</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-brand-600">Click to upload</span>{" "}
                  a photo or PDF of the menu
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP, or PDF · Max {MAX_MB} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            ✓ {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !file}
          className="w-full rounded-lg bg-brand-900 hover:bg-brand-800 text-white font-semibold
                     py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Uploading…" : "Upload & Publish Menu"}
        </button>
      </form>
    </div>
  );
}
