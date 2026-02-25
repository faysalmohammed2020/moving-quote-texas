export default function Loading() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Header Skeleton */}
      <header className="py-6 border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
        </div>
      </header>

      {/* 3 COLUMN LAYOUT */}
      <main
        className="
          mx-auto w-full
          max-w-none
          px-3 sm:px-6 lg:px-8 2xl:px-10
          pt-8 md:pt-10 pb-20 md:pb-24
          grid grid-cols-1 lg:grid-cols-12
          gap-6 lg:gap-8 2xl:gap-10
        "
      >
        {/* LEFT ADS Skeleton */}
        <aside className="order-2 lg:order-1 lg:col-span-2 hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="h-[700px] bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </aside>

        {/* CENTER BLOG Skeleton */}
        <article className="order-1 lg:order-2 lg:col-span-8 xl:col-span-7 2xl:col-span-8 min-w-0">
          <div className="max-w-none space-y-8 bg-white lg:border lg:border-slate-100 lg:rounded-2xl lg:p-8 xl:p-10 2xl:p-12 lg:shadow-sm">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-10 w-4/5 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-2/5 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Meta */}
            <div className="flex gap-3">
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
            </div>

            {/* Content lines */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-10/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-9/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-10/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-8/12 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </article>

        {/* RIGHT RECENT BLOGS Skeleton */}
        <aside className="order-3 lg:order-3 lg:col-span-2 xl:col-span-3 2xl:col-span-2 mt-2 lg:mt-0 min-w-0">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="p-5 sm:p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-4" />

              <div className="space-y-3">
                <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
              </div>

              <div className="mt-4 h-4 w-24 bg-slate-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </aside>

        {/* MOBILE ADS Skeleton */}
        <div className="order-4 lg:hidden">
          <div className="mt-6 space-y-4">
            <div className="h-[220px] bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-[160px] bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
