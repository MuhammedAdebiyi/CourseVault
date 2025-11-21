"use client";
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [brandName, setBrandName] = useState("CourseVault");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState(500);
  const [currency, setCurrency] = useState("NGN");

  const handleSaveSettings = () => {
    alert("Settings saved! (Would call backend API)");
  };

  const handleAddAdmin = () => {
    alert("New admin added! (Would call backend API)");
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">System Settings</h1>

        {/* Branding */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Branding</h2>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand Name"
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save Branding
          </button>
        </section>

        {/* Maintenance Mode */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Maintenance Mode</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            Enable Maintenance Mode
          </label>
          <p className="text-gray-500 text-sm">
            When enabled, regular users will see a maintenance page.
          </p>
        </section>

        {/* Admin Roles */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Add New Admin</h2>
          <input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={handleAddAdmin}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Add Admin
          </button>
        </section>

        {/* Payment Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Subscription & Payment</h2>
          <div className="mb-2">
            <label>Price per month (NGN)</label>
            <input
              type="number"
              value={subscriptionPrice}
              onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="mb-2">
            <label>Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="mb-2">
            <label>Stripe API Key</label>
            <input
              type="text"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save Payment Settings
          </button>
        </section>

        {/* Other Settings Placeholder */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Other Settings</h2>
          <p className="text-gray-500">
            Add more system settings here — email templates, API keys, logs, etc.
          </p>
        </section>
      </main>
    </div>
  );
}
