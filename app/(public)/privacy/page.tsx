import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — GIKI Plus" };

const LAST_UPDATED = "June 2025";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-0.5">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 text-sm text-brand-800">
          GIKI Plus is built by students, for students. We take privacy seriously and collect only what&apos;s necessary to run the service.
        </div>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">1</span>
            Overview
          </h2>
          <p>
            GIKI Plus is a student utility app built for Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
            We take privacy seriously. This policy explains what data we collect, why, and how it is handled.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">2</span>
            What we collect
          </h2>

          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-green-800 text-sm">Data that stays on your device only</h3>
              </div>
              <ul className="space-y-1.5 text-green-700 text-xs">
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0 mt-0.5">•</span> GPA / CGPA calculator data — stored in your browser&apos;s localStorage</li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0 mt-0.5">•</span> Merit calculator inputs — never sent to any server</li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0 mt-0.5">•</span> GPA Planner data — client-side only</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-amber-800 text-sm">Data we collect (server-side)</h3>
              </div>
              <ul className="space-y-1.5 text-amber-700 text-xs">
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Hashed IP addresses</strong> — for rate limiting and preventing abuse. IPs are irreversibly hashed using HMAC-SHA256. Raw IPs are never stored.</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Push notification subscriptions</strong> — endpoint and keys for delivering exam schedule notifications. You can unsubscribe at any time.</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Professor reviews</strong> — your review text and ratings, linked to a hashed IP (not your identity).</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Campus memories</strong> — location, message, and optional photo you submit.</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Lost &amp; Found posts</strong> — item details and an anonymous contact token.</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0 mt-0.5">•</span> <span><strong>Contact/feedback messages</strong> — your name, optional email, and message.</span></li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-800 text-sm">Technical data</h3>
              </div>
              <ul className="space-y-1.5 text-blue-700 text-xs">
                <li className="flex items-start gap-2"><span className="text-blue-400 flex-shrink-0 mt-0.5">•</span> Vercel edge logs (standard server logs) — retained per Vercel&apos;s policy</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 flex-shrink-0 mt-0.5">•</span> Supabase database — hosted in the EU/US, encrypted at rest</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">3</span>
            How we use data
          </h2>
          <p className="mb-3">We use collected data only to operate the app:</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            {[
              "Rate limiting to prevent abuse and spam",
              "Sending exam schedule push notifications (only with your consent)",
              "Moderating professor reviews, campus memories, and lost & found posts",
              "Responding to contact/feedback submissions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
          <p className="mt-3">We do <strong>not</strong> sell data, serve ads, or share data with third parties for marketing.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">4</span>
            Anonymous content
          </h2>
          <p>
            Professor reviews, campus memories, and lost &amp; found posts are anonymous by design.
            We store a hashed version of your IP to prevent duplicate submissions and abuse,
            but this hash cannot be reversed to identify you.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">5</span>
            Push notifications
          </h2>
          <p>
            If you subscribe to push notifications, we store your browser&apos;s push subscription (endpoint and keys).
            We use this only to send exam schedule notifications. You can unsubscribe at any time through your browser settings
            or by clicking the unsubscribe option in the app.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">6</span>
            Data retention
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            {[
              "Lost & Found posts expire automatically after 30 days",
              "Push subscriptions are removed when your browser reports them as expired (HTTP 410)",
              "Other data is retained while the service is operational",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">7</span>
            Security
          </h2>
          <p>
            GIKI Plus uses industry-standard security practices: HTTPS-only (HSTS), secure cookies,
            Content Security Policy headers, rate limiting, and Row Level Security on the database.
            Admin access requires authentication with role-based permissions.
          </p>
        </section>

        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">8</span>
            Contact
          </h2>
          <p>
            If you have questions about this privacy policy or want to request data deletion,{" "}
            <a href="/contact" className="text-brand-600 hover:text-brand-800 font-medium underline underline-offset-2">contact us</a>.
          </p>
        </section>

      </div>
    </main>
  );
}
