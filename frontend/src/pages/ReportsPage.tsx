
import { FileChartColumn, Download, ShieldCheck, AlertTriangle, FileText } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { name: "Document Security Summary", date: "Nov 17, 2026", type: "Security Report" },
    { name: "Threat Analysis Summary", date: "Nov 16, 2026", type: "Threat Report" },
    { name: "Sensitive Data Summary", date: "Nov 15, 2026", type: "Data Report" },
  ];

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Reports</h2>
        <p className="mt-2 text-sm text-slate-500">
          View and export document security reports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Documents Scanned", value: "1,284", icon: FileText },
          { title: "Safe Documents", value: "1,102", icon: ShieldCheck },
          { title: "Threats Detected", value: "86", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Icon className="text-blue-600" size={25} />
              <p className="mt-4 text-sm text-slate-500">{item.title}</p>
              <h3 className="mt-2 text-3xl font-bold">{item.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="border-b p-5">
          <h3 className="font-bold">Available Reports</h3>
          <p className="mt-1 text-sm text-slate-500">
            Sample report entries for the frontend preview.
          </p>
        </div>

        {reports.map((report) => (
          <div key={report.name} className="flex flex-wrap items-center justify-between gap-3 border-b p-5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileChartColumn size={22} />
              </div>
              <div>
                <p className="font-semibold">{report.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.type} · {report.date}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Download size={16} /> Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
