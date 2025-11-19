"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    setPaid(true);
    alert("Payment confirmed! You now have full access (dummy)");
  };

  if (paid) return <div className="p-6 text-center text-green-500">Payment Successful! Reload to access full features.</div>;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[var(--background)]">
      <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Complete Your Payment</h1>
      <p className="mb-6 text-[var(--foreground)]">Monthly subscription: ₦500 after your 1-month free trial</p>
      <button onClick={handlePay} className="p-3 bg-green-500 text-white rounded">Pay Now</button>
    </div>
  );
}
