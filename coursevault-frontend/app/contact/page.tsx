"use client";

import { useState } from "react";
import { FiMail, FiMessageSquare, FiUser, FiSend } from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <FiMail size={24} className="text-gray-700 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-gray-600">support@coursevault.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <FiMessageSquare size={24} className="text-gray-700 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-gray-600">Available Mon-Fri, 9AM-5PM EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <FiUser size={24} className="text-gray-700 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Community</h3>
                <p className="text-gray-600">Join our Discord server for quick help</p>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
              <p className="text-gray-600 mb-3">
                Check out our FAQ page for common questions about CourseVault.
              </p>
              <a href="/faq" className="text-blue-600 hover:underline font-medium">
                Visit FAQ →
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="What is this about?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Tell us more..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {status === "sending" ? (
                  "Sending..."
                ) : (
                  <>
                    <FiSend size={18} />
                    Send Message
                  </>
                )}
              </button>

              {/* Success Message */}
              {status === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {/* Error Message */}
              {status === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
                  ✗ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}