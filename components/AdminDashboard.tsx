"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FaFileAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaGlobeAmericas,
  FaRegChartBar,
  FaChrome,
  FaFirefoxBrowser,
  FaSafari,
  FaEdge,
  FaOpera,
  FaInternetExplorer,
} from "react-icons/fa";

type ApiBlog = {
  id: number;
  post_title: string;
  post_content?: unknown;
  category?: string;
  tags?: string | string[] | null;
  post_status: string;
  createdAt?: string;
  post_date?: string;
};

interface Blog {
  id: number;
  post_title: string;
  post_status: string;
  createdAt?: string | null;
  _d?: Date | null;
}

type Lead = {
  id: number;
  key?: string;
  leadType?: string;
  leadSource?: string;
  referer?: string;
  fromIp: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneExt?: string | null;
  fromState: string;
  fromStateCode: string;
  fromCity: string;
  fromZip: string;
  toState: string;
  toStateCode: string;
  toCity: string;
  toZip: string;
  moveDate?: string | null;
  moveSize: string;
  selfPackaging?: boolean | null;
  hasCar?: boolean | null;
  carMake?: string | null;
  carModel?: string | null;
  carMakeYear?: string | null;
  createdAt: string;
};

type TrendInfo = { value: string; isPositive: boolean };
type DailyCount = { date: string; count: number };
type StatsState = {
  dailyLeads: DailyCount[];
  dailyResponses: DailyCount[];
};

type AnalyticsBucket = "hour" | "day";
type RangePreset = "today" | "24h" | "7d" | "30d" | "custom";

type AnalyticsSummary = {
  kpis: {
    visitors: number;
    pageViews: number;
    activeTimeSec: number;
    avgActiveTimeSec: number;
  };

  // ✅ LIVE USERS
  live?: {
    windowSec: number;
    users: number;
    since?: string;
    now?: string;
  };

  series: { t: string; visitors: number; pageViews: number }[];
  topPages: { path: string; views: number; avgActiveTimeSec: number }[];
  sources: { name: string; count: number }[];
  devices: {
    deviceType: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    os: { name: string; count: number }[];
  };
  geo: {
    enabled: boolean;
    countries: { name: string; count: number }[];
    cities: { name: string; count: number }[];
  };
};

// ---------- helpers ----------
function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}
function pctChange(curr: number, prev: number): TrendInfo {
  if (prev <= 0) {
    if (curr <= 0) return { value: "0%", isPositive: false };
    return { value: "+100%", isPositive: true };
  }
  const delta = ((curr - prev) / prev) * 100;
  const val = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
  return { value: val, isPositive: delta >= 0 };
}

const SUBS_PAGE_SIZE = 50;
const numberFormatter = new Intl.NumberFormat();

// ✅ idle callback helper
const runIdle = (cb: () => void) => {
  if (typeof window === "undefined") return cb();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb, { timeout: 500 });
  } else {
    setTimeout(cb, 0);
  }
};

// ✅ AbortError checker
function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

// ---------- Skeleton helpers ----------
const SkeletonBox: React.FC<{ className?: string }> = React.memo(function SkeletonBox({
  className = "",
}) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
});
SkeletonBox.displayName = "SkeletonBox";

const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = React.memo(
  function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }).map((__, j) => (
                <SkeletonBox key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
TableSkeleton.displayName = "TableSkeleton";

// ---------- Analytics helpers ----------
const fmtSec = (sec: number) => {
  if (!sec || sec <= 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m <= 0) return `${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${m}m ${s}s`;
  return `${h}h ${mm}m`;
};
function toISO(d: Date) {
  return d.toISOString();
}

// ✅ Local-day helpers (fix timezone shift with YYYY-MM-DD)
function startOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function parseLocalDate(dateStr: string) {
  const [y, m, day] = dateStr.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day, 0, 0, 0, 0);
}
function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

// ✅ Devices UI helpers
const pct = (part: number, total: number) =>
  total <= 0 ? 0 : Math.round((part / total) * 1000) / 10;

const PIE_COLORS = [
  "#111827",
  "#3b82f6",
  "#a855f7",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

const AdminDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState<boolean>(true);
  const [errorBlogs, setErrorBlogs] = useState<string | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);

  const [stats, setStats] = useState<StatsState>({
    dailyLeads: [],
    dailyResponses: [],
  });

  const [totalLeads, setTotalLeads] = useState(0);
  const [, setTotalResponses] = useState(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [submissions, setSubmissions] = useState<Lead[]>([]);
  const [responses, setResponses] = useState<number[]>([]);
  const [subsLoading, setSubsLoading] = useState<boolean>(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [subsPage, setSubsPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  const [showFullSubs, setShowFullSubs] = useState(false);
  const fullSubsRef = useRef<HTMLDivElement | null>(null);
  const [totalVisitorsValue, setTotalVisitorsValue] = useState(0);

  // ---------- Analytics state ----------
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [rangePreset, setRangePreset] = useState<RangePreset>("7d");
  const [bucket, setBucket] = useState<AnalyticsBucket>("day");
  const [tab, setTab] = useState<"traffic" | "sources" | "geo" | "devices">(
    "traffic"
  );
  const [deviceTab, setDeviceTab] = useState<"deviceType" | "browser" | "os">(
    "deviceType"
  );

  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // ✅ auto refresh controls (15s)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchAtRef = useRef<number>(0);
  const REFRESH_MS = 15_000;

  // ✅ force hourly for today/24h in charts
  const effectiveBucket: AnalyticsBucket = useMemo(() => {
    if (rangePreset === "today" || rangePreset === "24h") return "hour";
    return bucket;
  }, [rangePreset, bucket]);

  const BrowserLogo: React.FC<{ name?: string }> = ({ name }) => {
    const n = (name || "").toLowerCase();

    if (n.includes("chrome")) return <FaChrome className="text-blue-600" />;
    if (n.includes("firefox"))
      return <FaFirefoxBrowser className="text-orange-500" />;
    if (n.includes("safari")) return <FaSafari className="text-sky-500" />;
    if (n.includes("edge")) return <FaEdge className="text-emerald-600" />;
    if (n.includes("opera")) return <FaOpera className="text-red-500" />;
    if (n.includes("ie") || n.includes("internet explorer"))
      return <FaInternetExplorer className="text-sky-700" />;

    return <FaGlobeAmericas className="text-gray-500" />;
  };


  // ---------- Lazy render full submissions table ----------
  useEffect(() => {
    if (showFullSubs) return;
    const node = fullSubsRef.current;
    if (!node) return;

    if (!(typeof window !== "undefined" && "IntersectionObserver" in window)) {
      setShowFullSubs(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShowFullSubs(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showFullSubs]);

  // ---------- Fetch Blogs ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setIsLoadingBlogs(true);
      setErrorBlogs(null);
      try {
        const res = await fetch("/api/blogpost?page=1&limit=1000", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const payload = await res.json();

        const items: ApiBlog[] = Array.isArray(payload)
          ? payload
          : payload.data || payload.items || [];

        const total = Array.isArray(payload)
          ? items.length
          : payload.meta?.total || payload.total || items.length;

        const transformed: Blog[] = items.map((item) => {
          const createdAt = item.createdAt ?? item.post_date ?? null;
          const d = createdAt ? new Date(createdAt) : null;
          return {
            id: Number(item.id),
            post_title: String(item.post_title || ""),
            post_status: String(item.post_status ?? "draft"),
            createdAt,
            _d: d && !isNaN(d.getTime()) ? d : null,
          };
        });

        runIdle(() => {
          startTransition(() => {
            setBlogs(transformed);
            setTotalBlogs(total);
          });
        });
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error(err);
        setErrorBlogs("Failed to fetch blogs. Please try again later.");
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, []);

  // ---------- Fetch Leads Stats ----------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch("/api/admin/leads/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed stats");
        const data: {
          dailyLeads?: DailyCount[];
          dailyResponses?: DailyCount[];
          totalLeads?: number;
          totalResponses?: number;
        } = await res.json();

        setStats({
          dailyLeads: data.dailyLeads ?? [],
          dailyResponses: data.dailyResponses ?? [],
        });
        setTotalLeads(data.totalLeads ?? 0);
        setTotalResponses(data.totalResponses ?? 0);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [setTotalResponses]);

  // ---------- Fetch Submissions & Responses ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setSubsLoading(true);
      setSubsError(null);
      try {
        const [subRes, respRes] = await Promise.all([
          fetch("/api/admin/leads/submissions", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/leads/responses", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!subRes.ok || !respRes.ok)
          throw new Error("Failed submissions/responses");

        const [subData, respData] = await Promise.all([
          subRes.json(),
          respRes.json(),
        ]);

        runIdle(() => {
          startTransition(() => {
            setSubmissions(subData ?? []);
            setResponses(
              Array.isArray(respData) ? (respData as number[]).slice(0, 5) : []
            );
            setSubsPage(1);
          });
        });
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        console.error("Failed to load submissions/responses", e);
        setSubsError("Failed to load submissions.");
      } finally {
        setSubsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const submissionsWithDate = useMemo(
    () =>
      submissions.map((l) => ({
        ...l,
        _d: new Date(l.createdAt),
        _createdFmt: new Date(l.createdAt).toLocaleDateString(),
      })),
    [submissions]
  );

  const recentBlogs = useMemo(() => blogs.slice(0, 5), [blogs]);
  const recentSubmissions = useMemo(
    () => submissionsWithDate.slice(0, 5),
    [submissionsWithDate]
  );

  const weeklyPerformanceData = useMemo(
    () =>
      stats.dailyLeads.map((lead: DailyCount, index: number) => ({
        date: lead.date,
        leads: lead.count,
        responses: stats.dailyResponses[index]?.count ?? 0,
      })),
    [stats.dailyLeads, stats.dailyResponses]
  );

  const totalSubsPages = useMemo(
    () => Math.max(1, Math.ceil(submissions.length / SUBS_PAGE_SIZE)),
    [submissions.length]
  );

  const pagedSubmissions = useMemo(
    () =>
      submissionsWithDate.slice(
        (subsPage - 1) * SUBS_PAGE_SIZE,
        subsPage * SUBS_PAGE_SIZE
      ),
    [submissionsWithDate, subsPage]
  );

  const handleSubsPageChange = useCallback(
    (dir: "prev" | "next") => {
      setSubsPage((prev) => {
        if (dir === "prev") return Math.max(1, prev - 1);
        return Math.min(totalSubsPages, prev + 1);
      });
    },
    [totalSubsPages]
  );

  // ---------- Blog actions ----------
  const handleDeleteClick = useCallback(async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    try {
      const resp = await fetch("/api/blogpost", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!resp.ok) throw new Error("Delete failed");
      startTransition(() => {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setTotalBlogs((t) => Math.max(0, t - 1));
      });
    } catch {
      alert("Failed to delete blog post. Please try again.");
    }
  }, []);

  const handleEditClick = useCallback((blog: Blog) => {
    setEditBlogData(blog);
    setIsEditModalVisible(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditModalVisible(false);
    setEditBlogData(null);
  }, []);

  const handleEditSave = useCallback(async (updatedBlog: Blog) => {
    try {
      const resp = await fetch("/api/blogpost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedBlog.id,
          post_title: updatedBlog.post_title,
          post_status: updatedBlog.post_status,
        }),
      });
      if (!resp.ok) throw new Error("Update failed");

      startTransition(() => {
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === updatedBlog.id ? { ...b, ...updatedBlog } : b
          )
        );
        setIsEditModalVisible(false);
        setEditBlogData(null);
      });
    } catch {
      alert("Failed to update blog post. Please try again.");
    }
  }, []);

  const fmt = useCallback(
    (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v)),
    []
  );
  const fmtDate = useCallback(
    (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—"),
    []
  );

  // ---------- Analytics range + fetch ----------
  const resolveRange = useCallback(() => {
    const now = new Date();

    if (rangePreset === "today") {
      return {
        from: startOfDayLocal(now),
        to: now,
        bucket: "hour" as AnalyticsBucket,
      };
    }

    if (rangePreset === "24h") {
      return {
        from: addDays(now, -1),
        to: now,
        bucket: "hour" as AnalyticsBucket,
      };
    }

    if (rangePreset === "7d") return { from: addDays(now, -7), to: now, bucket };
    if (rangePreset === "30d") return { from: addDays(now, -30), to: now, bucket };

    const f0 = customFrom ? parseLocalDate(customFrom) : addDays(now, -7);
    const t0 = customTo ? parseLocalDate(customTo) : now;

    if (!f0 || !t0 || !isValidDate(f0) || !isValidDate(t0)) {
      return { from: addDays(now, -7), to: now, bucket };
    }

    const toExclusive = customTo ? addDays(t0, 1) : t0;
    return { from: f0, to: toExclusive, bucket };
  }, [rangePreset, bucket, customFrom, customTo]);

  // ✅ fetchAnalytics (reused by first-load + auto-refresh)
  const fetchAnalytics = useCallback(
    async (signal?: AbortSignal, isBgRefresh?: boolean) => {
      const { from, to, bucket: resolvedBucket } = resolveRange();

      if (!(from instanceof Date) || !(to instanceof Date) || from >= to) {
        throw new Error("Invalid date range (from must be earlier than to).");
      }

      const qs = new URLSearchParams({
        from: toISO(from),
        to: toISO(to),
        bucket: resolvedBucket,
      });

      if (isBgRefresh) setIsRefreshing(true);

      const res = await fetch(`/api/admin/analytics/summary?${qs.toString()}`, {
        cache: "no-store",
        signal,
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(
          `Analytics API failed (${res.status}): ${bodyText || res.statusText}`
        );
      }

      const data = (await res.json()) as AnalyticsSummary;
      startTransition(() => setAnalytics(data));
      lastFetchAtRef.current = Date.now();

      if (isBgRefresh) setIsRefreshing(false);
    },
    [resolveRange, startTransition]
  );

  // ✅ first load
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        await fetchAnalytics(controller.signal, false);
      } catch (e) {
        if (isAbortError(e)) return;
        console.error(e);
        setAnalyticsError(e instanceof Error ? e.message : "Failed to load analytics.");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [fetchAnalytics]);

  // ✅ auto refresh loop (15s) + pause when tab hidden
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;

      const elapsed = Date.now() - lastFetchAtRef.current;
      if (elapsed < REFRESH_MS - 200) return;

      const controller = new AbortController();
      try {
        await fetchAnalytics(controller.signal, true);
      } catch (e) {
        if (isAbortError(e)) return;
        console.warn("Auto refresh failed:", e);
        setIsRefreshing(false);
      }
    };

    const timer = setInterval(tick, REFRESH_MS);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchAnalytics]);

  // ✅ devices data memo
  const deviceTypeRows = useMemo(
    () => analytics?.devices?.deviceType ?? [],
    [analytics]
  );
  const osRows = useMemo(() => analytics?.devices?.os ?? [], [analytics]);
  const browserRows = useMemo(
    () => analytics?.devices?.browser ?? [],
    [analytics]
  );

  const deviceTypeTotal = useMemo(
    () => deviceTypeRows.reduce((a, x) => a + (x.count || 0), 0),
    [deviceTypeRows]
  );
  const osTotal = useMemo(
    () => osRows.reduce((a, x) => a + (x.count || 0), 0),
    [osRows]
  );

  const deviceTypePie = useMemo(
    () =>
      deviceTypeRows.map((r) => ({
        name: r.name || "Unknown",
        value: r.count || 0,
      })),
    [deviceTypeRows]
  );

  // ✅ live users values
  const liveUsers = analytics?.live?.users ?? 0;
  const liveWindowSec = analytics?.live?.windowSec ?? 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ---------- NEW Analytics ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Website Analytics
            </h2>
            <p className="text-sm text-gray-500">
              Visitors, page views, active time, sources, geo & devices
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="text-xs text-gray-500">
              {analyticsLoading ? "Loading..." : isRefreshing ? "Updating..." : "Live"}
            </div>

            <select
              value={rangePreset}
              onChange={(e) => setRangePreset(e.target.value as RangePreset)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="today">Today</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30d</option>
              <option value="custom">Custom</option>
            </select>

            {rangePreset === "custom" && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}

            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as AnalyticsBucket)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
              disabled={rangePreset === "24h" || rangePreset === "today"}
              title={
                rangePreset === "24h" || rangePreset === "today"
                  ? "This range uses hourly buckets"
                  : ""
              }
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mt-5">
          {/* ✅ LIVE USERS CARD */}
          <StatCard
            title="Live Users"
            value={analyticsLoading ? "…" : numberFormatter.format(liveUsers)}
            icon={<FaEye className="text-xl text-rose-500" />}
            color="bg-rose-100"
            loading={analyticsLoading || isPending}
          />

          <StatCard
            title="Total Visitors"
            value={
              analyticsLoading
                ? "…"
                : numberFormatter.format(analytics?.kpis.visitors ?? 0)
            }
            icon={<FaEye className="text-xl text-blue-500" />}
            color="bg-blue-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Page Views"
            value={
              analyticsLoading
                ? "…"
                : numberFormatter.format(analytics?.kpis.pageViews ?? 0)
            }
            icon={<FaRegChartBar className="text-xl text-indigo-500" />}
            color="bg-indigo-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Total Active Time"
            value={
              analyticsLoading
                ? "…"
                : fmtSec(analytics?.kpis.activeTimeSec ?? 0)
            }
            icon={<FaFileAlt className="text-xl text-amber-500" />}
            color="bg-amber-100"
            loading={analyticsLoading || isPending}
          />
          <StatCard
            title="Avg Active Time"
            value={
              analyticsLoading
                ? "…"
                : fmtSec(analytics?.kpis.avgActiveTimeSec ?? 0)
            }
            icon={<FaGlobeAmericas className="text-xl text-green-500" />}
            color="bg-green-100"
            loading={analyticsLoading || isPending}
          />
        </div>

        {analyticsError && (
          <div className="mt-4 text-sm text-red-600">{analyticsError}</div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200">
          {[
            { key: "traffic", label: "Traffic" },
            { key: "sources", label: "Sources" },
            { key: "geo", label: "Geo" },
            { key: "devices", label: "Devices" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                tab === t.key
                  ? "bg-gray-50 text-gray-900 border border-gray-200 border-b-0"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-5">
          {analyticsLoading ? (
            <SkeletonBox className="h-[320px] w-full" />
          ) : !analytics ? (
            <div className="text-gray-500 text-sm">No analytics data</div>
          ) : tab === "traffic" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitors Chart */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      Visitors Over Time
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Unique visitors trend
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaEye className="text-blue-600 text-sm" />
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={analytics.series}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="visitorsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="t"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={(value) => {
                          if (effectiveBucket === "hour") return value.slice(11, 16);
                          return value.slice(5, 10);
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Visitors"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#visitorsGradient)"
                        dot={{ stroke: "#6366f1", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {analytics.series.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-50">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">
                      Peak: {Math.max(...analytics.series.map((s) => s.visitors))}{" "}
                      visitors
                    </span>
                  </div>
                )}
              </div>

              {/* Page Views Chart */}
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      Page Views Over Time
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Total page views trend
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FaRegChartBar className="text-emerald-600 text-sm" />
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={analytics.series}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="pageViewsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="t"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={(value) => {
                          if (effectiveBucket === "hour") return value.slice(11, 16);
                          return value.slice(5, 10);
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Page Views"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Bar
                        dataKey="pageViews"
                        fill="url(#pageViewsGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={effectiveBucket === "hour" ? 12 : 24}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {analytics.series.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-50">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-gray-600">
                      Total:{" "}
                      {analytics.series.reduce((acc, s) => acc + s.pageViews, 0)}{" "}
                      page views
                    </span>
                  </div>
                )}
              </div>

              {/* Top Pages Table */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-800">
                      Top Performing Pages
                    </h3>
                    <span className="text-xs text-gray-500">Sorted by views</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">Path</th>
                        <th className="px-6 py-4 text-left font-medium">Views</th>
                        <th className="px-6 py-4 text-left font-medium">
                          Avg Active Time
                        </th>
                        <th className="px-6 py-4 text-left font-medium">
                          Engagement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {(analytics.topPages ?? []).length ? (
                        analytics.topPages.map((p, index) => (
                          <tr
                            key={p.path}
                            className="hover:bg-gray-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-900 truncate max-w-xs">
                                  {p.path}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {numberFormatter.format(p.views)}
                                </span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (p.views /
                                          (analytics.topPages[0]?.views || 1)) *
                                          100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-sm font-medium">
                                  {fmtSec(p.avgActiveTimeSec)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    p.avgActiveTimeSec > 120
                                      ? "bg-green-500"
                                      : p.avgActiveTimeSec > 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <span className="text-sm text-gray-600">
                                  {p.avgActiveTimeSec > 120
                                    ? "High"
                                    : p.avgActiveTimeSec > 60
                                    ? "Medium"
                                    : "Low"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FaFileAlt className="text-gray-400" />
                              </div>
                              <p>No page data available</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : tab === "sources" ? (
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Traffic Sources
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Where your visitors are coming from
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaGlobeAmericas className="text-purple-600 text-sm" />
                </div>
              </div>
              <div className="h-[320px]">
                {analytics.sources?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.sources}
                      margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        <linearGradient id="sourceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [value, "Visits"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="url(#sourceGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={30}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <FaGlobeAmericas className="text-gray-400 text-xl" />
                      </div>
                      <p>No source data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : tab === "geo" ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Geographic Distribution
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaGlobeAmericas className="text-blue-600 text-sm" />
                  </div>
                </div>
                {!analytics.geo?.enabled ? (
                  <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <FaGlobeAmericas className="text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-600 mb-2">Geo analytics not configured</p>
                    <p className="text-sm text-gray-500">
                      Enable server-side IP → country/city mapping to see geographic data
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-white">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Top Countries
                        </h4>
                      </div>
                      <div className="p-2">
                        {(analytics.geo.countries ?? []).map((c, index) => (
                          <div
                            key={c.name}
                            className="flex items-center justify-between p-3 hover:bg-blue-50/30 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-900">{c.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {numberFormatter.format(c.count)}
                              </span>
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (c.count /
                                        (analytics.geo.countries[0]?.count || 1)) *
                                        100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50/50 to-white">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          Top Cities
                        </h4>
                      </div>
                      <div className="p-2">
                        {(analytics.geo.cities ?? []).map((c, index) => (
                          <div
                            key={c.name}
                            className="flex items-center justify-between p-3 hover:bg-emerald-50/30 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-900">{c.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {numberFormatter.format(c.count)}
                              </span>
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (c.count / (analytics.geo.cities[0]?.count || 1)) * 100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "deviceType", label: "Device Type" },
                  { key: "browser", label: "Browser" },
                  { key: "os", label: "Operating System" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setDeviceTab(t.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                      deviceTab === t.key
                        ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {deviceTab === "deviceType" ? (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Device Types
                      </h3>
                      <p className="text-xs text-gray-500">
                        Distribution of device categories
                      </p>
                    </div>

                    {deviceTypeTotal > 0 ? (
                      <div className="h-[280px] mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceTypePie}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="45%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={2}
                              labelLine={false}
                              label={({ name, value }) =>
                                `${name}: ${pct(value as number, deviceTypeTotal)}%`
                              }
                            >
                              {deviceTypePie.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              formatter={(value: any, name: any) => [
                                `${numberFormatter.format(value)} (${pct(
                                  value,
                                  deviceTypeTotal
                                )}%)`,
                                name,
                              ]}
                            />
                            <Legend verticalAlign="bottom" height={26} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[260px] flex items-center justify-center text-gray-500">
                        No device data
                      </div>
                    )}
                  </div>
                </div>
              ) : deviceTab === "browser" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Browser Usage
                    </h3>
                    <p className="text-xs text-gray-500">
                      Top browsers with icons + percentage
                    </p>
                  </div>

                  {browserRows?.length ? (
                    <div className="mt-4 space-y-4">
                      {(() => {
                        const total =
                          browserRows.reduce((a, x) => a + (x.count || 0), 0) ||
                          0;

                        return browserRows.slice(0, 12).map((b, i) => {
                          const p = pct(b.count, total);
                          return (
                            <div key={`${b.name}-${i}`} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                    <BrowserLogo name={b.name} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {b.name}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-sm text-gray-700 font-medium">
                                  {p.toFixed(1)}%
                                </div>
                              </div>

                              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-2 rounded-full bg-indigo-600"
                                  style={{ width: `${Math.min(100, p)}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                      No browser data
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Operating Systems
                    </h3>
                    <p className="text-xs text-gray-500">Usage distribution</p>
                  </div>

                  {osTotal > 0 ? (
                    <div className="mt-4 space-y-4">
                      {osRows.slice(0, 12).map((r, i) => {
                        const p = pct(r.count, osTotal);
                        return (
                          <div key={`${r.name}-${i}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-900">
                                {r.name}
                              </span>
                              <span className="text-gray-500">{p.toFixed(1)}%</span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${Math.min(100, p)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                      No OS data
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaRegChartBar className="text-indigo-500" /> Weekly Performance
            </h2>
          </div>

          {statsLoading ? (
            <SkeletonBox className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="responses"
                  fill="#10b981"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* TWO SMALL TABLES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Lead Submissions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Lead Submissions
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              {recentSubmissions.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {subsLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead.email || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead._createdFmt}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                        No recent submissions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Lead Responses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Lead Responses
            </h2>
            <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
              {responses.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {subsLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Lead ID</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responses.length > 0 ? (
                    responses.map((leadId: number, index: number) => (
                      <tr key={index}>
                        <td className="px-5 py-4 whitespace-nowrap">#{leadId}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Responded
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">—</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                        No recent responses
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Full submissions table */}
      <section className="mb-8" ref={fullSubsRef}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Calculate Form Submissions User
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full">
              {submissions.length}
            </span>
          </div>

          {!showFullSubs ? (
            <TableSkeleton rows={8} cols={6} />
          ) : subsLoading ? (
            <TableSkeleton rows={8} cols={8} />
          ) : subsError ? (
            <div className="p-6 text-center text-red-500">{subsError}</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No submissions found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">From State</th>
                      <th className="px-4 py-3 text-left">From Code</th>
                      <th className="px-4 py-3 text-left">From City</th>
                      <th className="px-4 py-3 text-left">From ZIP</th>
                      <th className="px-4 py-3 text-left">To State</th>
                      <th className="px-4 py-3 text-left">To Code</th>
                      <th className="px-4 py-3 text-left">To City</th>
                      <th className="px-4 py-3 text-left">To ZIP</th>
                      <th className="px-4 py-3 text-left">Move Date</th>
                      <th className="px-4 py-3 text-left">Move Size</th>
                      <th className="px-4 py-3 text-left">IP</th>
                      <th className="px-4 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagedSubmissions.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-4 py-3 whitespace-nowrap">#{lead.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.firstName)} {fmt(lead.lastName)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.email)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.phone)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.fromState)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.fromStateCode)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.fromCity)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.fromZip)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.toState)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.toStateCode)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.toCity)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.toZip)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(lead.moveDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.moveSize)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(lead.fromIp)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{lead._createdFmt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-600">
                <div>
                  Showing{" "}
                  <span className="font-semibold">
                    {(subsPage - 1) * SUBS_PAGE_SIZE + 1}-
                    {Math.min(subsPage * SUBS_PAGE_SIZE, submissions.length)}
                  </span>{" "}
                  of <span className="font-semibold">{submissions.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubsPageChange("prev")}
                    disabled={subsPage === 1}
                    className={`px-3 py-1 rounded border text-xs ${
                      subsPage === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page <span className="font-semibold">{subsPage}</span> of{" "}
                    <span className="font-semibold">{totalSubsPages}</span>
                  </span>
                  <button
                    onClick={() => handleSubsPageChange("next")}
                    disabled={subsPage === totalSubsPages}
                    className={`px-3 py-1 rounded border text-xs ${
                      subsPage === totalSubsPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recent Blogs */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Blog Posts</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add New Post
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingBlogs ? (
              <TableSkeleton rows={5} cols={3} />
            ) : errorBlogs ? (
              <div className="p-6 text-center text-red-500">{errorBlogs}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {blog.post_title}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            blog.post_status === "publish" || blog.post_status === "published"
                              ? "bg-green-100 text-green-800"
                              : blog.post_status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {blog.post_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalVisible && editBlogData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleEditClose}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Blog Post</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  value={editBlogData.post_title}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      post_title: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Status
                </label>
                <select
                  value={editBlogData.post_status}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      post_status: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                  <option value="unpublish">Unpublish</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditSave(editBlogData)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: TrendInfo | null;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  subText?: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  subText,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-1">
            {loading ? (
              <SkeletonBox className="h-7 w-20" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            )}
          </div>
          {!!subText && <div className="mt-1 text-xs text-gray-500">{subText}</div>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
});
StatCard.displayName = "StatCard";

export default AdminDashboard;
