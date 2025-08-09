import React, { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "@/services/purchase.service";

const Tile: React.FC<{
  title: string;
  value: string | number;
  to?: string;
}> = ({ title, value, to }) => {
  const content = (
    <div className="rounded-xl border border-border bg-card/60 p-4 hover:bg-accent/30 transition-colors">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

const ProgressCircle: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 48;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        stroke="#e5e7eb"
        strokeWidth="12"
        fill="none"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        stroke="#22c55e"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-foreground text-2xl font-semibold"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
};

const MiniBars: React.FC<{ values: number[] }> = ({ values }) => {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-2 h-20">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-3 rounded bg-emerald-400"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const MiniArea: React.FC<{ points: number[] }> = ({ points }) => {
  const w = 260;
  const h = 100;
  const max = Math.max(1, ...points);
  const step = w / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (p / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <path d={path} fill="none" stroke="#10b981" strokeWidth={2} />
    </svg>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAgent = user?.role === "agent";
  const isAdminOrCoord = user?.role === "admin" || user?.role === "coordinator";
  const [period] = useState("Monthly");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const shortId = (id: string) =>
    id?.length > 16 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(value);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };

  const { data: stats } = useQuery({
    queryKey: ["purchases", "stats"],
    queryFn: () => purchaseService.stats(),
  });

  const byType = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {
      small: { count: 0, amount: 0 },
      big: { count: 0, amount: 0 },
      king: { count: 0, amount: 0 },
    };
    stats?.sales.byType.forEach((t: any) => {
      map[t.type] = { count: t.count, amount: t.amount };
    });
    return map;
  }, [stats]);

  const totalOrders =
    (stats?.summary.confirmationPending ?? 0) +
    (stats?.summary.processing ?? 0) +
    (stats?.summary.pendingPayment ?? 0) +
    (stats?.summary.completed ?? 0);
  const completedPct = totalOrders
    ? ((stats?.summary.completed ?? 0) / totalOrders) * 100
    : 0;

  // Build simple weekly series from recent activity amounts
  const weeklySeries = useMemo(() => {
    const arr = new Array(7).fill(0);
    (stats?.recentActivity || []).forEach((r: any) => {
      const d = new Date(r.date);
      const day = d.getDay(); // 0..6
      arr[day] += Number(r.amount) || 0;
    });
    return arr;
  }, [stats]);

  const weeklyOrderSeries = useMemo(() => {
    const arr = new Array(7).fill(0);
    (stats?.recentActivity || []).forEach((r: any) => {
      const d = new Date(r.date);
      const day = d.getDay();
      arr[day] += 1;
    });
    return arr;
  }, [stats]);

  // Comparison (this 7 days vs previous 7 days)
  const comparison = useMemo(() => {
    const MS_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const startCurrent = now - 7 * MS_DAY;
    const startPrev = now - 14 * MS_DAY;

    let revCurr = 0,
      revPrev = 0,
      cntCurr = 0,
      cntPrev = 0;

    (stats?.recentActivity || []).forEach((r: any) => {
      const t = new Date(r.date).getTime();
      if (t >= startCurrent && t <= now) {
        revCurr += Number(r.amount) || 0;
        cntCurr += 1;
      } else if (t >= startPrev && t < startCurrent) {
        revPrev += Number(r.amount) || 0;
        cntPrev += 1;
      }
    });

    const revDelta = revPrev ? ((revCurr - revPrev) / revPrev) * 100 : 100;
    const cntDelta = cntPrev ? ((cntCurr - cntPrev) / cntPrev) * 100 : 100;

    return { revCurr, revPrev, cntCurr, cntPrev, revDelta, cntDelta };
  }, [stats]);

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              My Summary
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back{user?.email ? `, ${user.email}` : ""}. Track your
              performance at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAgent ? (
              <Button onClick={() => navigate("/purchases/new")}>
                Place Order
              </Button>
            ) : (
              <Button asChild>
                <Link to="/purchases">Manage Purchases</Link>
              </Button>
            )}
          </div>
        </header>

        {/* Top grid: Comparison + Goals */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">Comparison</div>
              <div className="text-sm text-muted-foreground">{period}</div>
            </div>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Revenue (7d)
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold">
                    ₹ {comparison.revCurr.toFixed(2)}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${comparison.revDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                  >
                    {comparison.revDelta >= 0 ? (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    )}
                    {Math.abs(comparison.revDelta).toFixed(1)}%
                  </span>
                </div>
                <MiniArea points={weeklySeries} />
                <div className="text-xs text-muted-foreground">
                  Prev 7d: ₹ {comparison.revPrev.toFixed(2)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Orders (7d)</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold">
                    {comparison.cntCurr}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${comparison.cntDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                  >
                    {comparison.cntDelta >= 0 ? (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    )}
                    {Math.abs(comparison.cntDelta).toFixed(1)}%
                  </span>
                </div>
                <MiniArea points={weeklyOrderSeries} />
                <div className="text-xs text-muted-foreground">
                  Prev 7d: {comparison.cntPrev}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <Button variant="secondary" asChild>
                <Link to="/purchases">See details</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="text-base font-semibold">Goals Performance</div>
            <div className="mt-4 flex items-center gap-5">
              <ProgressCircle percent={completedPct} />
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  This period
                  <div className="text-lg font-semibold">
                    ₹ {(stats?.sales.totalValue ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  Completed
                  <div className="text-lg font-semibold">
                    {stats?.summary.completed ?? 0} orders
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="secondary" asChild>
                <Link to="/purchases?status=completed">View Full Report</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Middle grid: Sales report, By type, Insights */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">Sales report</div>
              <Link
                to="/purchases"
                className="text-sm text-muted-foreground hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              <MiniArea points={weeklySeries} />
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <div className="text-base font-semibold">Most Impressions</div>
            <div className="rounded-xl border border-border bg-background p-3 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Small
              </div>
              <div className="text-muted-foreground">
                {byType.small.count} (
                {totalOrders
                  ? Math.round((byType.small.count / totalOrders) * 100)
                  : 0}
                %)
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Big
              </div>
              <div className="text-muted-foreground">
                {byType.big.count} (
                {totalOrders
                  ? Math.round((byType.big.count / totalOrders) * 100)
                  : 0}
                %)
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" /> King
              </div>
              <div className="text-muted-foreground">
                {byType.king.count} (
                {totalOrders
                  ? Math.round((byType.king.count / totalOrders) * 100)
                  : 0}
                %)
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <div className="text-base font-semibold">Status Overview</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-background p-3">
                Pending
                <div className="text-lg font-semibold">
                  {stats?.summary.confirmationPending ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                Processing
                <div className="text-lg font-semibold">
                  {stats?.summary.processing ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                Payment
                <div className="text-lg font-semibold">
                  {stats?.summary.pendingPayment ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                Completed
                <div className="text-lg font-semibold">
                  {stats?.summary.completed ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            {isAdminOrCoord && (
              <Link
                to="/purchases"
                className="text-sm text-muted-foreground hover:underline"
              >
                Go to purchases
              </Link>
            )}
          </div>
          <div className="grid gap-3">
            {stats?.recentActivity?.length ? (
              stats.recentActivity.map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Copy ID"
                        onClick={() => copyToClipboard(r.uniqueId)}
                        className="font-mono text-xs md:text-sm hover:underline truncate max-w-[60vw] md:max-w-[30vw] text-left"
                      >
                        {shortId(r.uniqueId)}
                      </button>
                      <button
                        type="button"
                        aria-label="Copy"
                        onClick={() => copyToClipboard(r.uniqueId)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-border hover:bg-accent hover:text-accent-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-3.5 w-3.5"
                        >
                          <rect x="9" y="9" width="10" height="10" rx="2" />
                          <path d="M5 15V7a2 2 0 0 1 2-2h8" />
                        </svg>
                      </button>
                      {copiedId === r.uniqueId && (
                        <span className="text-xs text-muted-foreground">
                          Copied
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {r.partyName}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {r.status.replace("_", " ")} •{" "}
                      {new Date(r.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm whitespace-nowrap">
                    ₹ {Number(r.amount).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
