
import { useState } from "react";
import { Bell, ShieldCheck, Database, Save } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [autoScan, setAutoScan] = useState(false);

  const [saved, setSaved] = useState(false);

  const settings = [
    {
      title: "Notifications",
      description: "Receive document scan notifications.",
      value: notifications,
      change: setNotifications,
    },
    {
      title: "Security Alerts",
      description: "Receive alerts when suspicious content is detected.",
      value: alerts,
      change: setAlerts,
    },
    {
      title: "Automatic Scanning",
      description: "Request automatic scanning when a document is uploaded.",
      value: autoScan,
      change: setAutoScan,
    },
  ];

  return (
    <div className="max-w-4xl space-y-6 p-5 md:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manage your SENTINEL preferences.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <Bell className="text-blue-600" />
          <h3 className="font-bold">Notification Preferences</h3>
        </div>

        {settings.map((setting) => (
          <div key={setting.title} className="flex items-center justify-between gap-4 border-t py-5">
            <div>
              <p className="font-semibold">{setting.title}</p>
              <p className="mt-1 text-sm text-slate-500">{setting.description}</p>
            </div>

            <button
              role="switch"
              aria-checked={setting.value}
              onClick={() => {
                setting.change(!setting.value);
                setSaved(false);
              }}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                setting.value ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  setting.value ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" />
          <div>
            <h3 className="font-bold">Security</h3>
            <p className="text-sm text-slate-500">Document security preferences.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t pt-5">
          <Database className="text-slate-500" />
          <div>
            <p className="font-semibold">Data Storage</p>
            <p className="text-sm text-slate-500">
              Storage and retention policies will be connected to the backend.
            </p>
          </div>
        </div>
      </section>

      <button
        onClick={() => setSaved(true)}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <Save size={17} />
        Save Preferences
      </button>

      {saved && (
        <p className="text-sm font-medium text-emerald-600">
          Preferences saved for this session.
        </p>
      )}
    </div>
  );
}
