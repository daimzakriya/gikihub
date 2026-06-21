"use client";

import { useRef, useState, useTransition } from "react";
import { uploadScheduleAction } from "./actions";
import { formatBytes } from "@/lib/utils";

interface Props {
  userId: string;
}

export function ExamScheduleUploadForm({ userId }: Props) {
  const formRef       = useRef<HTMLFormElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [file, setFile]     = useState<File | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, start]  = useTransition();

  const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const MAX_MB  = 10;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    setSuccess(null);
    if (!f) return setFile(null);
    if (!ALLOWED.includes(f.type)) {
      setError("Only PDF, JPEG, PNG, or WebP files are allowed.");
      return setFile(null);
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      return setFile(null);
    }
    setFile(f);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Please select a file.");
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.append("uploadedById", userId);

    start(async () => {
      const result = await uploadScheduleAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Schedule uploaded successfully!");
        setFile(null);
        formRef.current?.reset();
      }
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Schedule</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Mid Exam Schedule — Fall 2026"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Semester <span className="text-red-500">*</span>
            </label>
            <input
              name="semester"
              type="text"
              required
              placeholder="e.g. Fall 2026"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Exam type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Exam Type <span className="text-red-500">*</span>
          </label>
          <select
            name="examType"
            required
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="MID">Mid Exam</option>
            <option value="FINAL">Final Exam</option>
            <option value="QUIZ">Quiz</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Schedule File (PDF / Image) <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
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
            {file ? (
              <div>
                <p className="text-sm font-semibold text-green-700">{file.name}</p>
                <p className="text-xs text-green-600 mt-1">{formatBytes(file.size)}</p>
              </div>
            ) : (
              <div>
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-brand-600">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, WebP · Max {MAX_MB} MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Error / success */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !file}
          className="w-full rounded-lg bg-brand-900 hover:bg-brand-800 text-white font-semibold
                     py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Uploading…" : "Upload Schedule"}
        </button>
      </form>
    </div>
  );
}
