import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  purchaseService,
  ExecutiveAnalytics,
  AgentLeaderboards,
  PredictiveAnalytics,
} from "@/services/purchase.service";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  Clock,
  Target,
  Award,
  BarChart3,
  LineChart,
  Calendar,
  Activity,
  Trophy,
  Zap,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star,
  TrendingUpIcon,
  ActivityIcon,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Ultra minimal metric card
const UltraMinimalMetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  info?: string;
}> = ({ title, value, change, icon, trend, info }) => (
  <div className="p-6 bg-card border border-border rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex items-center gap-2">
        {info && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{info}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {trend && (
          <div
            className={`text-xs ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          </div>
        )}
      </div>
    </div>
    <div>
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-2xl font-semibold text-foreground mb-1">{value}</div>
      {change !== undefined && (
        <div
          className={`text-xs ${
            change >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change}% from last month
        </div>
      )}
    </div>
  </div>
);

// Ultra minimal leaderboard item
const UltraMinimalLeaderboardItem: React.FC<{
  rank: number;
  name: string;
  value: string;
  subtitle: string;
  medal?: "gold" | "silver" | "bronze";
}> = ({ rank, name, value, subtitle, medal }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          medal === "gold"
            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            : medal === "silver"
              ? "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              : medal === "bronze"
                ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {rank}
      </div>
      <div>
        <div className="font-medium text-slate-900 dark:text-slate-100">
          {name}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  </div>
);

const ExecutiveDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useQuery<ExecutiveAnalytics>({
    queryKey: ["executiveAnalytics"],
    queryFn: () => purchaseService.executiveAnalytics(),
    enabled: user?.role === "admin" || user?.role === "coordinator",
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: leaderboards, isLoading: leaderboardsLoading } =
    useQuery<AgentLeaderboards>({
      queryKey: ["agentLeaderboards"],
      queryFn: () => purchaseService.agentLeaderboards(),
      enabled: user?.role === "admin" || user?.role === "coordinator",
      refetchInterval: autoRefresh ? 30000 : false,
    });

  const { data: predictive, isLoading: predictiveLoading } =
    useQuery<PredictiveAnalytics>({
      queryKey: ["predictiveAnalytics"],
      queryFn: () => purchaseService.predictiveAnalytics(),
      enabled: user?.role === "admin" || user?.role === "coordinator",
      refetchInterval: autoRefresh ? 30000 : false,
    });

  // Debug logging
  console.log("Predictive data:", predictive);
  console.log("Revenue forecast:", predictive?.revenueForecast);

  if (analyticsLoading || leaderboardsLoading || predictiveLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md p-6 bg-card rounded-lg border border-border">
          <div className="text-center space-y-4">
            <div className="text-red-600 dark:text-red-400 font-medium">
              Failed to load analytics data
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

  // Section header with info icon
  const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    info?: string;
  }> = ({ icon, title, info }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-muted-foreground">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {info && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{info}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          {/* Ultra Minimal Header */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Executive Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Real-time insights and analytics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                  </span>
                  <span className="sm:hidden">
                    {autoRefresh ? "ON" : "OFF"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-slate-200 dark:border-slate-700"
                >
                  <Link to="/purchases">View All</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Ultra Minimal Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UltraMinimalMetricCard
              title="Current Month Revenue"
              value={formatCurrency(analytics.financial.currentMonthRevenue)}
              change={analytics.financial.revenueGrowth}
              icon={<DollarSign className="h-5 w-5" />}
              trend={analytics.financial.revenueGrowth >= 0 ? "up" : "down"}
              info="Total revenue generated from all completed orders in the current month. Calculated by summing the final amounts of all purchases with 'completed' status."
            />
            <UltraMinimalMetricCard
              title="Active Agents"
              value={analytics.agentPerformance.length.toString()}
              icon={<Users className="h-5 w-5" />}
              trend="up"
              info="Number of agents who have created at least one order. Shows the total count of unique agents in the system who are actively generating sales."
            />
            <UltraMinimalMetricCard
              title="Completion Rate"
              value={formatPercentage(
                analytics.agentPerformance.reduce(
                  (sum, agent) => sum + agent.completionRate,
                  0
                ) / Math.max(analytics.agentPerformance.length, 1)
              )}
              icon={<Target className="h-5 w-5" />}
              trend="up"
              info="Average completion rate across all agents. Calculated as (completed orders / total orders) × 100 for each agent, then averaged across all agents."
            />
            <UltraMinimalMetricCard
              title="Pending Payments"
              value={formatCurrency(analytics.risk.pendingPaymentAmount)}
              icon={<Clock className="h-5 w-5" />}
              trend="down"
              info="Total amount of money pending from orders that are not yet completed. Includes orders in 'confirmation_pending', 'processing', and 'payment_pending' statuses."
            />
          </div>

          {/* Ultra Minimal Tab Navigation */}
          <div className="bg-card rounded-lg border border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-50 dark:bg-gray-800 p-1">
                <TabsTrigger
                  value="overview"
                  className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 rounded"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboards"
                  className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 rounded"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Leaderboards</span>
                  <span className="sm:hidden">Leaders</span>
                </TabsTrigger>
                <TabsTrigger
                  value="predictions"
                  className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 rounded"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Predictions</span>
                  <span className="sm:hidden">Predict</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 rounded"
                >
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Activity</span>
                  <span className="sm:hidden">Activity</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Financial Performance */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <SectionHeader
                      icon={<DollarSign className="h-5 w-5" />}
                      title="Financial Performance"
                      info="Overview of revenue performance comparing current month vs previous month. Shows total revenue generated and tracks month-over-month growth trends."
                    />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              analytics.financial.currentMonthRevenue
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            This Month
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              analytics.financial.previousMonthRevenue
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Last Month
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Cash Flow by Status
                          </h4>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Breakdown of revenue by order status. Shows how
                                much money is tied up in different stages of the
                                order process.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {analytics.financial.cashFlow.map((flow) => (
                          <div
                            key={flow.status}
                            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                {flow.status.replace("_", " ")}
                              </span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {flow.count} orders
                              </span>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {formatCurrency(flow.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Agent Performance */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <SectionHeader
                      icon={<Users className="h-5 w-5" />}
                      title="Top Performing Agents"
                      info="Performance metrics for each sales agent. Shows total orders, revenue generated, completion rates, and average order values to identify top performers."
                    />
                    <div className="space-y-2">
                      {analytics.agentPerformance
                        .slice(0, 5)
                        .map((agent, index) => (
                          <div
                            key={agent.agentId}
                            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {agent.agentName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {agent.totalOrders} orders
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {formatCurrency(agent.totalRevenue)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {formatPercentage(agent.completionRate)}{" "}
                                completion
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Product Performance */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <SectionHeader
                    icon={<Package className="h-5 w-5" />}
                    title="Top Products"
                    info="Best performing products based on total revenue, quantity sold, and number of orders. Shows which products are driving the most sales."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.operations.productPerformance.map(
                      (product, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {product.productName}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                              {product.subcategoryName}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500 dark:text-slate-400">
                                Revenue
                              </span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {formatCurrency(product.totalRevenue)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500 dark:text-slate-400">
                                Quantity
                              </span>
                              <span className="text-slate-900 dark:text-slate-100">
                                {product.totalQuantity} units
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500 dark:text-slate-400">
                                Orders
                              </span>
                              <span className="text-slate-900 dark:text-slate-100">
                                {product.orderCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Leaderboards Tab */}
              <TabsContent value="leaderboards" className="p-6 space-y-6">
                {leaderboards && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Revenue Agents */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <SectionHeader
                        icon={<Trophy className="h-5 w-5" />}
                        title="Top Revenue Generators"
                        info="Agents ranked by total revenue generated. Shows which agents are bringing in the most money and their average order values."
                      />
                      <div className="space-y-0">
                        {leaderboards.topRevenueAgents.map((agent, index) => (
                          <UltraMinimalLeaderboardItem
                            key={agent.agentId}
                            rank={index + 1}
                            name={agent.agentName}
                            value={formatCurrency(agent.totalRevenue)}
                            subtitle={`${agent.totalOrders} orders • ₹${(agent.avgOrderValue || 0).toFixed(0)} avg`}
                            medal={
                              index === 0
                                ? "gold"
                                : index === 1
                                  ? "silver"
                                  : index === 2
                                    ? "bronze"
                                    : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Completion Rate */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <SectionHeader
                        icon={<Target className="h-5 w-5" />}
                        title="Highest Completion Rate"
                        info="Agents ranked by their order completion rate. Shows which agents are most effective at converting orders from creation to completion."
                      />
                      <div className="space-y-0">
                        {leaderboards.topCompletionAgents.map(
                          (agent, index) => (
                            <UltraMinimalLeaderboardItem
                              key={agent.agentId}
                              rank={index + 1}
                              name={agent.agentName}
                              value={`${agent.completionRate}%`}
                              subtitle={`${agent.completedOrders}/${agent.totalOrders} completed`}
                              medal={
                                index === 0
                                  ? "gold"
                                  : index === 1
                                    ? "silver"
                                    : index === 2
                                      ? "bronze"
                                      : undefined
                              }
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="p-6 space-y-6">
                {predictive && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Forecast */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <SectionHeader
                        icon={<LineChart className="h-5 w-5" />}
                        title="30-Day Revenue Forecast"
                        info="AI-powered revenue predictions for the next 30 days based on historical data patterns, seasonal trends, and current performance metrics."
                      />
                      <div className="space-y-2">
                        {predictive.revenueForecast &&
                        predictive.revenueForecast.length > 0 ? (
                          predictive.revenueForecast
                            .slice(0, 7)
                            .map((forecast, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                              >
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {new Date(
                                      forecast.date
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {getDayName(
                                      new Date(forecast.date).getDay()
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatCurrency(forecast.predictedRevenue)}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {forecast.confidence}% confidence
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <div className="text-sm">
                              No forecast data available
                            </div>
                            <div className="text-xs mt-1">
                              Forecast will appear once there's sufficient order
                              data
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seasonal Patterns */}
                    <div className="bg-card rounded-lg border border-border p-6">
                      <SectionHeader
                        icon={<Calendar className="h-5 w-5" />}
                        title="Weekly Activity Patterns"
                        info="Revenue patterns by day of the week showing which days are most profitable. Helps identify optimal business hours and peak activity periods."
                      />
                      <div className="space-y-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                          const dayData = predictive.seasonalPatterns.find(
                            (p) => p.dayOfWeek === day
                          );
                          const revenue = dayData?.revenue || 0;
                          const maxRevenue = Math.max(
                            ...predictive.seasonalPatterns.map((p) => p.revenue)
                          );
                          const percentage =
                            maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                          return (
                            <div
                              key={day}
                              className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                            >
                              <div className="w-16 text-sm font-medium text-slate-900 dark:text-slate-100">
                                {getDayName(day)}
                              </div>
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div
                                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="w-16 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                                {formatCurrency(revenue)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Processing Times */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <SectionHeader
                      icon={<Clock className="h-5 w-5" />}
                      title="Processing Efficiency"
                      info="Average time taken to process orders through different stages. Calculated as the mean duration between order creation and status updates."
                    />
                    <div className="space-y-2">
                      {analytics.operations.processingTimes.map((time) => (
                        <div
                          key={time.status}
                          className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                              {time.status.replace("_", " ")}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {time.count} orders
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {(time.avgDays || 0).toFixed(1)} days
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              average
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Insights */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <SectionHeader
                      icon={<Users className="h-5 w-5" />}
                      title="Customer Insights"
                      info="Customer behavior analysis including retention rates, new customer acquisition, and top customer performance based on total spending and order frequency."
                    />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 relative">
                          <div className="absolute top-2 right-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  Percentage of customers who have placed
                                  multiple orders. Calculated as (repeat
                                  customers / total customers) × 100.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {formatPercentage(
                              analytics.customers.retentionRate
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Retention Rate
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 relative">
                          <div className="absolute top-2 right-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  Number of new customers who placed their first
                                  order in the current month.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {analytics.customers.newCustomersThisMonth}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            New This Month
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Top Customers
                        </h4>
                        {analytics.customers.topCustomers
                          .slice(0, 3)
                          .map((customer) => (
                            <div
                              key={customer.partyId}
                              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                            >
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {customer.partyName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {customer.orderCount} orders
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {formatCurrency(customer.totalSpent)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  ₹{(customer.avgOrderValue || 0).toFixed(0)}{" "}
                                  avg
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ExecutiveDashboardPage;
