
import { useState } from "react";
import { Search, FileText, Download } from "lucide-react";

const history = [
  { name: "Employee_Records.pdf", date: "Nov 17, 2026", status: "Safe", risk: "Low" },
  { name: "Financial_Report.xlsx", date: "Nov 16, 2026", status: "Threats Found", risk: "High" },
  { name: "Customer_Database.csv", date: "Nov 15, 2026", status: "Review Required", risk: "Medium" },
  { name: "Project_Proposal.docx", date: "Nov 14, 2026", status: "Safe", risk: "Low" },
];

export default function HistoryPage() {
  const [query, setQuery] = useState("");

  const filtered = history.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Scan History</h2>
        <p className="mt-2 text-sm text-slate-500">
          View previously analyzed documents.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-5">Document</th>
              <th className="p-5">Date</th>
              <th className="p-5">Status</th>
              <th className="p-5">Risk</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <tr key={item.name}>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" />
                    {item.name}
                  </div>
                </td>
                <td className="p-5 text-sm text-slate-500">{item.date}</td>
                <td className="p-5 text-sm">{item.status}</td>
                <td className="p-5 text-sm font-semibold">{item.risk}</td>
                <td className="p-5">
                  <button
                    onClick={() => window.print()}
                    className="text-blue-600"
                    aria-label={`Export ${item.name}`}
                  >
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No matching documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
