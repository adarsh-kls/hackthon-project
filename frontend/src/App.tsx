
import { useState } from "react";

import {
  ShieldCheck,
  LayoutDashboard,
  Upload,
  ScanSearch,
  History,
  FileChartColumn,
  Settings,
  Bell,
  Search,
  FileText,
  ShieldAlert,
  ShieldCheck as SafeIcon,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Menu,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import UploadPage from "./components/upload/UploadPage";
import ScanResultsPage from "./components/results/ScanResultsPage";
import HistoryPage from "./pages/HistoryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

// -------------------- DASHBOARD DATA --------------------

const scanActivity = [
  { day: "Mon", scans: 32 },
  { day: "Tue", scans: 48 },
  { day: "Wed", scans: 39 },
  { day: "Thu", scans: 65 },
  { day: "Fri", scans: 52 },
  { day: "Sat", scans: 78 },
  { day: "Sun", scans: 61 },
];

const threatData = [
  { name: "Critical", value: 12, color: "#DC2626" },
  { name: "High", value: 24, color: "#F97316" },
  { name: "Medium", value: 36, color: "#EAB308" },
  { name: "Low", value: 28, color: "#2563EB" },
];

const recentScans = [
  {
    name: "Employee_Records.pdf",
    type: "PDF Document",
    date: "Today, 10:42 AM",
    status: "Safe",
    risk: "Low",
  },
  {
    name: "Financial_Report.xlsx",
    type: "Excel Spreadsheet",
    date: "Today, 09:18 AM",
    status: "Threats Found",
    risk: "High",
  },
  {
    name: "Customer_Database.csv",
    type: "CSV File",
    date: "Yesterday, 04:35 PM",
    status: "Review Required",
    risk: "Medium",
  },
  {
    name: "Project_Proposal.docx",
    type: "Word Document",
    date: "Yesterday, 02:10 PM",
    status: "Safe",
    risk: "Low",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Upload Document", icon: Upload },
  { label: "Scan Results", icon: ScanSearch },
  { label: "Scan History", icon: History },
  { label: "Reports", icon: FileChartColumn },
];

// -------------------- DASHBOARD PAGE --------------------

function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const stats = [
    {
      title: "Total Documents Scanned",
      value: "1,284",
      change: "+12.8%",
      positive: true,
      description: "Compared to last week",
      icon: FileText,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Safe Documents",
      value: "1,102",
      change: "+8.2%",
      positive: true,
      description: "Compared to last week",
      icon: SafeIcon,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Threats Detected",
      value: "86",
      change: "-4.3%",
      positive: true,
      description: "Compared to last week",
      icon: ShieldAlert,
      iconStyle: "bg-red-50 text-red-600",
    },
    {
      title: "Sensitive Data Found",
      value: "96",
      change: "+6.5%",
      positive: false,
      description: "Compared to last week",
      icon: AlertTriangle,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] p-5 md:p-8">

      {/* Dashboard heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Welcome to SENTINEL
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Security Overview
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your documents and identify potential security risks.
          </p>
        </div>

        <button
          onClick={() => onNavigate("Upload Document")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {/* Statistics cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const ChangeIcon = stat.positive
            ? ArrowUpRight
            : ArrowDownRight;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                >
                  <Icon size={21} />
                </div>

                <button
                  className="text-slate-400 hover:text-slate-700"
                  aria-label={`More options for ${stat.title}`}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h3>

                <span
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                    stat.positive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <ChangeIcon size={14} />
                  {stat.change}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Charts */}
      <section className="mt-6 grid gap-6 xl:grid-cols-3">

        {/* Scan activity chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Scan Activity
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Documents scanned over the last 7 days
              </p>
            </div>

            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
              defaultValue="7"
              aria-label="Scan activity time range"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={scanActivity}
                margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="scanGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E9EEF5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#scanGradient)"
                  activeDot={{ r: 6, fill: "#2563EB" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat distribution chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="font-bold text-slate-900">
            Threat Distribution
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Findings by severity level
          </p>

          <div className="relative mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={4}
                  stroke="none"
                >
                  {threatData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">
                100
              </span>

              <span className="text-xs text-slate-400">
                Findings
              </span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            {threatData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-xs text-slate-500">
                  {item.name}
                </span>

                <span className="ml-auto text-xs font-bold text-slate-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent scans table */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 md:px-6">
          <div>
            <h3 className="font-bold text-slate-900">
              Recent Scans
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Latest document security analysis
            </p>
          </div>

          <button
            onClick={() => onNavigate("Scan History")}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4 font-semibold">Document</th>
                <th className="px-6 py-4 font-semibold">Date Scanned</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Risk Level</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentScans.map((scan) => (
                <tr
                  key={scan.name}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {scan.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {scan.type}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {scan.date}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        scan.status === "Safe"
                          ? "bg-emerald-50 text-emerald-700"
                          : scan.status === "Threats Found"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold ${
                        scan.risk === "Low"
                          ? "text-emerald-600"
                          : scan.risk === "High"
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {scan.risk}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onNavigate("Scan Results")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-col justify-between gap-2 pb-4 text-xs text-slate-400 sm:flex-row">
        <p>
          © 2026 SENTINEL. Document Intelligence Platform.
        </p>

        <p className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Dashboard preview · Sample data
        </p>
      </footer>
    </div>
  );
}

// -------------------- MAIN APPLICATION --------------------

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // -------------------- PAGE NAVIGATION --------------------

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;

      case "Upload Document":
        return (
          <div className="mx-auto max-w-[1600px] p-5 md:p-8">
            <UploadPage />
          </div>
        );

      case "Scan Results":
        return (
          <div className="mx-auto max-w-[1600px] p-5 md:p-8">
            <ScanResultsPage />
          </div>
        );

      case "Scan History":
        return <HistoryPage />;

      case "Reports":
        return <ReportsPage />;

      case "Settings":
        return <SettingsPage />;

      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#101C35] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                SENTINEL
              </h1>

              <p className="text-[10px] tracking-[2px] text-blue-200">
                DOCUMENT INTELLIGENCE
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-300 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sidebar navigation */}
        <div className="px-4 pt-8">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />

                  {item.label}

                  {active && (
                    <ChevronRight className="ml-auto" size={16} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System status */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />

              <span className="text-sm font-semibold">
                System Protected
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Your document security workspace is ready.
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-emerald-400" />
            </div>

            <p className="mt-2 text-[10px] text-slate-400">
              System status indicator
            </p>
          </div>

          {/* Settings navigation */}
          <button
            onClick={() => handleNavigate("Settings")}
            className={`mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10 ${
              activePage === "Settings"
                ? "bg-white/10 text-white"
                : ""
            }`}
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-slate-500">
              SENTINEL v1.0.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-64">

        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activePage}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Security workspace / {activePage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={17} className="text-slate-400" />

              <input
                placeholder="Search..."
                className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </span>
            </div>

            <button
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              ST
            </div>
          </div>
        </header>

        {/* Render selected page */}
        {renderPage()}

      </main>
    </div>
  );
}

export default App;
