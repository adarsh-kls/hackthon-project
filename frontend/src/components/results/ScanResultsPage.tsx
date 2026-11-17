
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Calendar,
  HardDrive,
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  ScanSearch,
  Info,
} from "lucide-react";

const findings = [
  {
    title: "Sensitive Information",
    description: "Personal information detected in the document.",
    severity: "High",
    category: "Data Privacy",
  },
  {
    title: "External Link Detected",
    description: "An external URL was found in the document.",
    severity: "Medium",
    category: "Suspicious Content",
  },
  {
    title: "Document Metadata",
    description: "Document metadata is available for inspection.",
    severity: "Low",
    category: "Metadata",
  },
];

const metadata = [
  { label: "File Name", value: "Employee_Records.pdf", icon: FileText },
  { label: "File Type", value: "PDF Document", icon: FileText },
  { label: "File Size", value: "2.4 MB", icon: HardDrive },
  { label: "Uploaded By", value: "Admin", icon: User },
  { label: "Scan Date", value: "17 November 2026", icon: Calendar },
];

function getSeverityStyle(severity: string) {
  switch (severity) {
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function ScanResultsPage() {
  const riskScore = 68;

  return (
    <div className="mx-auto max-w-[1600px] p-5 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ScanSearch size={16} />
            Security Analysis
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
            Scan Results
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review document security findings and potential risks.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={18} className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">
            Review Recommended
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info size={19} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm leading-6 text-blue-800">
          This is a sample scan report for frontend demonstration.
          These findings are illustrative and are not the result of
          an actual document security scan.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Overall Risk Score
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Illustrative risk assessment
          </p>

          <div className="mt-7 flex flex-col items-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#F97316 ${riskScore * 3.6}deg, #E2E8F0 0deg)`,
              }}
            >
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-5xl font-bold text-slate-900">
                  {riskScore}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Out of 100
                </span>
              </div>
            </div>

            <span className="mt-5 rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
              Medium Risk
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-slate-900">
            Security Findings Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Overview of illustrative security findings
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-red-50 p-5">
              <div className="flex items-center justify-between">
                <ShieldAlert className="text-red-600" size={25} />
                <span className="text-3xl font-bold text-red-700">1</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-red-800">
                High Severity
              </p>
              <p className="mt-1 text-xs text-red-600">
                Requires attention
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-center justify-between">
                <AlertTriangle className="text-amber-600" size={25} />
                <span className="text-3xl font-bold text-amber-700">1</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-amber-800">
                Medium Severity
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Needs review
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center justify-between">
                <Info className="text-blue-600" size={25} />
                <span className="text-3xl font-bold text-blue-700">1</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-blue-800">
                Low Severity
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Informational finding
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-center justify-between">
                <ShieldCheck className="text-emerald-600" size={25} />
                <span className="text-3xl font-bold text-emerald-700">0</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-emerald-800">
                Critical Findings
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                No critical findings in this sample
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Detailed Security Findings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review the findings associated with this sample document.
          </p>
        </div>

        <div className="space-y-4">
          {findings.map((finding) => (
            <div
              key={finding.title}
              className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    {finding.category === "Data Privacy" ? (
                      <Lock size={20} />
                    ) : finding.category === "Suspicious Content" ? (
                      <AlertTriangle size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {finding.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {finding.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Category: {finding.category}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getSeverityStyle(finding.severity)}`}
                >
                  {finding.severity} Severity
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Document Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Metadata associated with the sample document.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metadata.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon size={17} />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </div>
                <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-bold text-slate-900">
          Security Recommendations
        </h2>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={19} />
            <p className="text-sm leading-6 text-slate-600">
              Review the personal information present in the document.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
            <p className="text-sm leading-6 text-slate-600">
              Verify external links before opening or sharing them.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={19} />
            <p className="text-sm leading-6 text-slate-600">
              Follow your organization's document security policy
              before distributing sensitive files.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-8 pb-4 text-center text-xs text-slate-400">
        SENTINEL · Document Intelligence Platform · Sample Report
      </footer>
    </div>
  );
}

export default ScanResultsPage;
