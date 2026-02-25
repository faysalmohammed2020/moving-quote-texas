import React from "react";
import { LoaderCircle } from "lucide-react";

const Loading: React.FC = () => {
  return (
    <div
      className="min-h-[50vh] w-full flex items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="grid place-items-center size-12 rounded-xl bg-cyan-50 border border-cyan-100">
            <LoaderCircle className="size-6 animate-spin text-cyan-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Loading your content
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Please wait a moment…
            </p>
          </div>
        </div>

        {/* subtle progress shimmer */}
        <div className="mt-5">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-cyan-500/70 animate-pulse" />
          </div>

          {/* optional skeleton lines */}
          <div className="mt-4 space-y-2">
            <div className="h-3 w-11/12 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-9/12 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>

        {/* screen-reader only */}
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
};

export default Loading;
