"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Mail, User, BookOpen } from "lucide-react";

interface FormState {
  fullName: string;
  emailOrRoll: string;
  department: string;
  topic: string;
  message: string;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    emailOrRoll: "",
    department: "AI",
    topic: "Exam Paper Feedback",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!form.emailOrRoll.trim()) {
      newErrors.emailOrRoll = "College email or student roll number is required.";
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = "Please provide at least 10 characters describing your inquiry.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate instantaneous local receipt and notification
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Mail className="h-3.5 w-3.5" />
            <span>Campus Helpdesk &amp; Support</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Contact Student Support &amp; Faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Have a question about an exam paper, notice an error in Bloom&apos;s marking, or need assistance with your student wallet? Reach out directly.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-6 sm:p-10 shadow-xs">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. The PBCOE Academic Helpdesk and student coordinators will review your inquiry shortly.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setForm({
                    fullName: "",
                    emailOrRoll: "",
                    department: "AI",
                    topic: "Exam Paper Feedback",
                    message: "",
                  });
                }}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="e.g. Romanchal Bopche"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* College Email / Roll Number */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>College Email or Roll No. *</span>
                  </label>
                  <input
                    type="text"
                    value={form.emailOrRoll}
                    onChange={(e) =>
                      setForm({ ...form, emailOrRoll: e.target.value })
                    }
                    placeholder="e.g. 26-AI-042 or student@pbcoe.edu"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.emailOrRoll && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.emailOrRoll}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Department Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    <span>Department / Branch</span>
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="AI">Artificial Intelligence (AI)</option>
                    <option value="CSE">Computer Science and Engineering (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                    <option value="ECE">Electronics &amp; Communication (ECE)</option>
                    <option value="ETC">Electronics &amp; Telecommunication (ETC)</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="MECH">Mechanical Engineering</option>
                  </select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Topic / Category
                  </label>
                  <select
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Exam Paper Feedback">Exam Paper Question Feedback</option>
                    <option value="Bloom's Level Inquiry">Bloom&apos;s Level / CO Inquiry</option>
                    <option value="Student Task Escrow">Student Task &amp; Wallet Escrow</option>
                    <option value="Faculty Admin Access">Faculty / College Admin Access</option>
                    <option value="General Support">General Student Portal Support</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Message / Details *
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Describe your inquiry, question paper code, or task details..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.message && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
