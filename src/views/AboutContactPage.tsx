'use client';

import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck, Send, HelpCircle } from 'lucide-react';
import { ContactSubmission } from '../types/tourism';

interface AboutContactPageProps {
  mode: 'about' | 'contact';
  totalPlaces: number;
  onSubmitContact: (submission: Omit<ContactSubmission, 'id' | 'createdAt' | 'resolved'>) => void;
}

export const AboutContactPage: React.FC<AboutContactPageProps> = ({
  mode,
  totalPlaces,
  onSubmitContact,
}) => {
  const [formType, setFormType] = useState<'inquiry' | 'suggest_place' | 'report_update'>(
    'suggest_place'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    onSubmitContact({
      type: formType,
      name: name.trim(),
      email: email.trim(),
      placeName: placeName.trim() || undefined,
      message: message.trim(),
    });
    setName('');
    setEmail('');
    setPlaceName('');
    setMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* About Section */}
      <section className="space-y-6">
        <div className="space-y-2 border-b border-[#E5E9E2] pb-6">
          <p className="text-xs font-semibold text-[#406246]">
            {mode === 'about' ? 'Project Blueprint & Data Ethics' : 'Help, Support & Community Input'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26352A]">
            Mae Sai Tourism Intelligence &amp; Discovery Platform
          </h1>
          <p className="text-base text-[#4B5563] max-w-3xl leading-relaxed">
            “Discover Mae Sai, explore local communities, and plan your journey with better tourism
            information.”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#26352A]">Project Objectives</h2>
            <ul className="space-y-2 text-sm text-[#4B5563] list-disc pl-5 leading-relaxed">
              <li>
                Centralize discovery of Mae Sai temples, historical landmarks, mountain viewpoints,
                coffee roasters, local food, accommodation, and visitor facilities.
              </li>
              <li>
                Provide transparent geographic intelligence and interactive OpenStreetMap routing
                without fabricating visitor numbers or ratings.
              </li>
              <li>
                Help travelers estimate realistic THB trip costs across walking, bicycle, scooter,
                rental car, taxi, and community songthaew options.
              </li>
              <li>
                Promote small community enterprises, handmade saa paper artisans, and local
                homestays in Mae Sai District, Chiang Rai.
              </li>
            </ul>
          </div>

          <div className="bg-[#f5f0de]/70 rounded-xl border border-[#E5E9E2] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#26352A]">
              <ShieldCheck className="w-5 h-5 text-[#406246]" />
              <h2 className="font-display text-lg font-bold">
                Data Quality &amp; Reliability Practices
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#374151] list-disc pl-5 leading-relaxed">
              <li>
                Every listing records its information source and last verification date (currently{' '}
                <span className="font-mono-tabular font-semibold">{totalPlaces}</span> prototype
                records).
              </li>
              <li>
                External ratings are kept strictly separate from visitor feedback submitted directly
                on this platform.
              </li>
              <li>
                Estimated price ranges and travel times are clearly labeled as planning estimates,
                never guaranteed prices.
              </li>
              <li>
                Unverified or sample records are transparently labeled so visitors know what to
                double-check locally.
              </li>
            </ul>
          </div>
        </div>

        {/* Reference Sources */}
        <div className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-[#26352A]">
            Initial Research &amp; Reference Sources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <a
              href="https://www.tourismthailand.org/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E9E2] hover:bg-[#fafaf8] text-[#26352A]"
            >
              <span className="font-medium">Tourism Authority of Thailand</span>
              <ExternalLink className="w-4 h-4 text-[#406246]" />
            </a>
            <a
              href="https://www.chiangraiguide.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E9E2] hover:bg-[#fafaf8] text-[#26352A]"
            >
              <span className="font-medium">Chiang Rai Digital Directory</span>
              <ExternalLink className="w-4 h-4 text-[#406246]" />
            </a>
            <a
              href="https://www.tourismchiangrai-phayao.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E9E2] hover:bg-[#fafaf8] text-[#26352A]"
            >
              <span className="font-medium">TAT Chiang Rai Office</span>
              <ExternalLink className="w-4 h-4 text-[#406246]" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact, Suggest Place & Help Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#406246]">
            <HelpCircle className="w-4 h-4" />
            <span>Visitor Support &amp; Local Submissions</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#26352A]">
            Contact &amp; Suggest a Mae Sai Place
          </h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Found updated opening hours, want to recommend a local café or handmade shop in Mae Sai,
            or have questions about using the trip planner? Send a message to the prototype team.
          </p>
          <div className="bg-[#fafaf8] rounded-xl border border-[#E5E9E2] p-4 space-y-2 text-xs text-[#4B5563]">
            <div>
              <strong className="text-[#26352A]">Emergency &amp; Tourist Assistance (Thailand):</strong>
            </div>
            <div>Tourist Police Hotline: <span className="font-mono-tabular font-semibold">1155</span></div>
            <div>TAT Call Center: <span className="font-mono-tabular font-semibold">1672</span></div>
            <div>Medical Emergency (EMS): <span className="font-mono-tabular font-semibold">1669</span></div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'suggest_place', label: 'Suggest a Place' },
              { id: 'report_update', label: 'Report Info Update' },
              { id: 'inquiry', label: 'General Question' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormType(opt.id as typeof formType)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  formType === opt.id
                    ? 'bg-[#406246] text-white border-[#406246]'
                    : 'bg-[#fafaf8] text-[#26352A] border-[#E5E9E2] hover:bg-[#f5f0de]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-[#26352A] mb-1">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-[#26352A] mb-1">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
              />
            </div>
          </div>

          {formType !== 'inquiry' && (
            <div>
              <label htmlFor="contact-place" className="block text-xs font-semibold text-[#26352A] mb-1">
                Place or Business Name in Mae Sai
              </label>
              <input
                id="contact-place"
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g., Doi Pha Mee Viewpoint Café"
                className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="contact-msg" className="block text-xs font-semibold text-[#26352A] mb-1">
              Details / Message
            </label>
            <textarea
              id="contact-msg"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share address, opening hours, or questions..."
              className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message</span>
            </button>

            {submitted && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#406246]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Received! Thank you for contributing to Mae Sai data.</span>
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};
