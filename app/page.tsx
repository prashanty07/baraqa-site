"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Phone,
  CheckCircle,
  Calculator,
  Building2,
  Globe,
  Briefcase,
  ArrowRight,
  User,
  ChevronDown,
  Clock,
  Mail,
  RefreshCw,
  FileSignature,
  Search,
  Key,
  MapPin,
  ArrowLeft,
  Handshake,
  Landmark,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import { motion, useScroll, useSpring, useInView, AnimatePresence } from "framer-motion";

/**
 * IMPORTANT:
 * - Baraqa is NOT a bank or licensed mortgage broker.
 * - Applications (if any) are processed via a licensed mortgage broker platform partner and then submitted to lenders.
 * - No guarantees for approval/rate/timeline.
 *
 * This file includes:
 * - Safer marketing copy
 * - Consent capture gate (required) before any upload/submission
 * - Clear calculator assumptions (sticky EMI uses 4.5% p.a. / 25 years)
 */

// --- DESIGN TOKENS (used in inline <style>) ---
const COLORS = {
  primary: "#116656",
  primaryHover: "#0E5548",
  bgLight: "#FAF4E8",
};

// --- UTILS ---
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const safeScrollToTop = () => {
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
};

const safeScrollToTarget = (targetId) => {
  if (typeof window === "undefined" || !targetId) return;
  const el = document.getElementById(targetId);
  if (!el) return;
  const offset = el.getBoundingClientRect().top + window.pageYOffset - 100;
  window.scrollTo({ top: offset, behavior: "smooth" });
};

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", { style: "decimal", maximumFractionDigits: 0 });
};

// --- DATA ---
const BANKS = ["FAB", "Emirates NBD", "ADCB", "Dubai Islamic Bank", "RAKBANK", "Mashreq", "CBD", "HSBC"];

// FIX: Avoid duplicate id with the section id="eligibility"
const JOURNEY_STEPS = [
  {
    id: "budget_check",
    title: "Check Eligibility",
    desc: "Get an estimated borrowing range in minutes.",
    icon: Calculator,
    time: "5 Minutes",
    risk: "Making offers without a budget check",
    tips: {
      resident: "Start with down payment and DBR basics.",
      non_resident: "LTV can vary by lender and profile.",
      national: "Ask about applicable government programs.",
    },
  },
  {
    id: "pre_approval",
    title: "Pre-Approval (via licensed broker partner + lender)",
    desc: "Prepare your file for submission through a licensed broker platform partner.",
    icon: FileSignature,
    time: "Typically 3–5 Working Days*",
    risk: "Signing MOU/MOA before lender feedback",
    tips: {
      resident: "Salary certificate and bank statements are common requirements.",
      non_resident: "A home-country credit report can help where accepted.",
      national: "Some lenders may have dedicated processes.",
    },
  },
  {
    id: "valuation",
    title: "Property Valuation",
    desc: "Lender-appointed valuation confirms property value for underwriting.",
    icon: Search,
    time: "Typically 3–4 Working Days*",
    risk: "Valuation below purchase price",
    tips: {
      resident: "Ensure property access is arranged for the valuer.",
      non_resident: "Your agent can coordinate access on your behalf.",
      national: "Check if any valuation fee arrangements apply.",
    },
  },
  {
    id: "final_offer",
    title: "Final Offer Letter (FOL)",
    desc: "Review and sign final lender terms (subject to lender policy).",
    icon: Landmark,
    time: "Typically 2–3 Working Days*",
    risk: "Terms changing before signing",
    tips: {
      resident: "Review insurance and fees carefully.",
      non_resident: "Double-check remittance FX costs and timelines.",
      national: "Confirm product terms and disclosures.",
    },
  },
  {
    id: "handover",
    title: "Transfer & Handover",
    desc: "Trustee-day steps: transfer, mortgage registration, and key collection.",
    icon: KeyRound,
    time: "1 Day (Trustee/Authority scheduling)",
    risk: "Manager’s cheques prepared incorrectly",
    tips: {
      resident: "Carry original Emirates ID and required cheques.",
      non_resident: "Power of Attorney may be required in some cases.",
      national: "Bring any additional documents requested by the authority.",
    },
  },
];

const FEATURES = [
  {
    k: "Match",
    title: "Lender options via licensed partners",
    desc: "We help you prepare a clean file for submission through licensed broker platform partner(s), then lenders decide.",
    chips: ["Subject to lender criteria", "Products vary by lender", "No guarantees"],
    icon: BadgeCheck,
  },
  {
    k: "DBR",
    title: "DBR-aware preparation",
    desc: "Reduce surprises by checking affordability basics and common lender requirements.",
    chips: ["Liabilities awareness", "Affordability buffers", "Cleaner submissions"],
    icon: Calculator,
  },
  {
    k: "Docs",
    title: "Documents made simple",
    desc: "Checklists for salaried / self-employed / non-resident, with consistent file structure.",
    chips: ["Salary cert", "Bank statements", "Trade license + financials"],
    icon: FileSignature,
  },
  {
    k: "Speed",
    title: "Guided milestones (not promised timelines)",
    desc: "We guide the steps and help avoid common pitfalls—processing times depend on third parties.",
    chips: ["Pre-approval*", "Valuation*", "FOL + transfer day*"],
    icon: Sparkles,
  },
  {
    k: "ZeroFees",
    title: "Zero Baraqa advisory fees",
    desc: "Baraqa does not charge advisory fees. Third-party fees may still apply.",
    chips: ["No Baraqa advisory fee", "Third-party fees may apply", "Some fees non-refundable"],
    icon: Wallet,
  },
];

// --- HELPER COMPONENTS ---
const BaraqaMark = ({ dark = false }) => (
  <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
    <div className={`absolute inset-0 bg-gradient-to-br ${dark ? "from-[#116656] to-[#0E5548]" : "from-white to-slate-100"}`} />
    <div className={`absolute inset-[1px] rounded-[0.65rem] flex items-center justify-center ${dark ? "bg-white text-[#116656]" : "bg-[#116656] text-white"}`}>
      <span className="font-black tracking-tight text-sm">B</span>
    </div>
  </div>
);

const ServiceCard = ({ icon, title, desc, points }) => (
  <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E0D8CC] hover:shadow-[0_20px_40px_-15px_rgba(17,102,86,0.15)] hover:border-[#116656]/30 transition-all duration-500 group h-full flex flex-col hover:-translate-y-1 relative z-10">
    <div className="w-16 h-16 bg-[#FAF4E8] text-[#116656] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#116656] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-[#116656]/20">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-[#116656] mb-4 tracking-tight group-hover:text-[#0E5548] transition-colors">{title}</h3>
    <p className="text-[#4A7A70] mb-8 text-base leading-relaxed">{desc}</p>
    <ul className="space-y-4 mt-auto">
      {points.map((p, i) => (
        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[#4A7A70]">
          <CheckCircle size={20} className="text-[#116656] mt-0.5 shrink-0 opacity-100" />
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const JourneyStepCard = ({ step, index, activePersona, isActive }) => {
  const Icon = step.icon;

  return (
    <div className={`relative flex gap-8 md:gap-16 py-16 transition-all duration-700 ${isActive ? "opacity-100 scale-100" : "opacity-40 scale-95 blur-[1px]"}`} id={step.id}>
      <div className="flex-1 hidden md:block text-right pt-4">
        <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${isActive ? "bg-[#116656]/10 text-[#116656]" : "bg-white text-[#4A7A70]"}`}>
          Step 0{index + 1}
        </div>
        <h3 className="text-3xl font-black text-[#116656] mb-2">{step.title}</h3>
        <p className="text-[#4A7A70] text-lg">{step.desc}</p>
      </div>

      <div className="relative z-10 shrink-0">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-xl ${isActive ? "bg-[#116656] border-[#FAF4E8] text-white scale-110" : "bg-white border-[#E0D8CC] text-[#4A7A70]"}`}>
          <Icon size={28} />
        </div>
      </div>

      <div className="flex-1 pt-2">
        <div className="md:hidden mb-4">
          <span className="text-xs font-bold text-[#116656] uppercase tracking-wider">Step 0{index + 1}</span>
          <h3 className="text-2xl font-black text-[#116656]">{step.title}</h3>
          <p className="text-[#4A7A70] text-sm mb-4">{step.desc}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] shadow-lg relative overflow-hidden group hover:border-[#116656]/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FAF4E8] to-transparent -mr-8 -mt-8 rounded-bl-full pointer-events-none" />

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FAF4E8] text-[#116656] text-xs font-bold">
              <Clock size={12} /> {step.time}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold">
              <AlertTriangle size={12} /> Watch: {step.risk}
            </span>
          </div>

          <div className="bg-[#FAF4E8] rounded-xl p-4 border-l-4 border-[#116656]">
            <p className="text-xs font-bold text-[#116656] uppercase mb-1 flex items-center gap-2">
              <User size={12} /> Pro Tip for {String(activePersona).replace("_", " ")}s
            </p>
            <p className="text-sm text-[#4A7A70] font-medium">{(step.tips && step.tips[activePersona]) || step.tips.resident}</p>
          </div>

          <p className="mt-4 text-[11px] text-[#4A7A70]/70 font-semibold">*Timelines are estimates only and depend on third parties and lender processes.</p>
        </div>
      </div>
    </div>
  );
};

const StickyEligibilityBar = ({ show }) => {
  const [price, setPrice] = useState("1500000");
  const [downPayment, setDownPayment] = useState("20");

  const safePrice = Math.max(0, Number(price) || 0);
  const safeDown = clamp(Number(downPayment) || 0, 0, 100);

  const loanAmount = safePrice * (1 - safeDown / 100);

  // Assumptions (illustration only)
  const annualRate = 0.045; // 4.5% p.a.
  const termMonths = 300; // 25 years
  const r = annualRate / 12;

  const emi = loanAmount > 0 && r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths)) : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: show ? 0 : 100, opacity: show ? 1 : 0 }}
      className="fixed bottom-0 left-0 w-full bg-[#FAF4E8]/95 backdrop-blur-xl border-t border-[#E0D8CC] z-40 px-6 py-4 shadow-[0_-10px_40px_-15px_rgba(17,102,86,0.1)]"
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#4A7A70]">Property Price</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#116656]">AED</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-28 bg-transparent border-b border-[#E0D8CC] font-bold text-[#116656] focus:outline-none focus:border-[#116656]"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-[#4A7A70]">Down Payment</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-12 bg-transparent border-b border-[#E0D8CC] font-bold text-[#116656] focus:outline-none focus:border-[#116656]"
              />
              <span className="text-sm font-bold text-[#116656]">%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-l pl-6 border-[#E0D8CC]">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-[#4A7A70]">Est. Loan</p>
            <p className="font-bold text-[#116656]">{formatCurrency(loanAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[#4A7A70]">Est. Monthly EMI</p>
            <p className="font-black text-xl text-[#116656]">{formatCurrency(Math.round(emi))}</p>
            <p className="text-[10px] text-[#4A7A70]/70 font-semibold mt-1">Assumption: 4.5% p.a. • 25 years • Illustration only</p>
          </div>
          <button onClick={() => safeScrollToTarget("eligibility")} className="bg-[#116656] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#0E5548] transition-colors" type="button">
            Check Eligibility
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const LegalModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-[#116656]/40 backdrop-blur-sm transition-opacity" onClick={onClose} aria-label="Close modal overlay" type="button" />
      <div className="bg-[#FAF4E8] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col border border-[#E0D8CC]">
        <div className="p-5 border-b border-[#E0D8CC] flex justify-between items-center bg-[#FAF4E8] sticky top-0 z-20">
          <h2 className="text-lg font-black text-[#116656] tracking-tight">Baraqa Legal, Disclaimers & Privacy Policy</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-slate-100 text-[#4A7A70] hover:text-[#116656] transition-colors" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto text-[#4A7A70] text-sm leading-relaxed">
          <div className="text-xs text-[#4A7A70]/70 mb-6 uppercase tracking-widest font-bold">
            <p>Effective date: 16 December 2025</p>
            <p>Entity: Baraqa Mortgage FZ-LLC (Sharjah Publishing City Free Zone, Sharjah, UAE)</p>
          </div>

          <h3 className="text-base font-black text-[#116656] mt-6">1. Legal Terms and Disclaimers</h3>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.1 What Baraqa is (and is not)</h4>
          <p className="mt-2">Baraqa is a mortgage readiness and document-preparation service. We help you organize your information, prepare a lender-style document pack, and guide you through process steps.</p>
          <p className="mt-2">
            Baraqa is <span className="font-black">not</span> a bank, lender, or licensed mortgage broker. We do not lend money, issue approvals, or commit loan terms.
          </p>
          <p className="mt-2">No financial advice. Any information we provide is general and operational in nature (process, documentation, typical timelines, typical fees). It is not investment, legal, tax, or financial advice.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.2 How submissions work (third-party licensed broker platform)</h4>
          <p className="mt-2">
            If you proceed, your file is processed through a third-party <span className="font-black">licensed</span> mortgage broker platform partner (“Broker Partner”) and then submitted to one or more banks/lenders (“Lenders”).
          </p>
          <p className="mt-2">Any mortgage processing/arrangement and any loan relationship is with the Broker Partner and/or Lenders (and other third parties involved), not with Baraqa.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.3 No guarantees</h4>
          <p className="mt-2">No guarantee of approval, pre-approval, rate, amount, tenure, terms, or timelines. Decisions are made solely by Lenders, based on their policies and underwriting.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.4 Fees and non-refundability</h4>
          <p className="mt-2">
            Baraqa does not charge advisory fees. You may still pay third-party fees (banks, valuers, developers, authorities, trustees, insurers, agents). Some fees may be non-refundable, including where the mortgage is declined or the transaction does not complete.
          </p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.5 Deal risk after MOU/MOA or payments</h4>
          <p className="mt-2">
            Real estate transactions can fail even after signing MOU/MOA, paying deposits, or ordering valuation. Baraqa has no control over lender decisions, valuations, legal/title issues, developer NOCs, or trustee scheduling. Baraqa is not responsible for third-party losses, penalties, forfeited deposits, or fees.
          </p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.6 Your responsibilities</h4>
          <p className="mt-2">You must provide true, accurate, complete, and up-to-date information and documents. Missing/incorrect documents or undisclosed liabilities can cause delays, rejection, cancellation, or revised terms.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.7 KYC/AML</h4>
          <p className="mt-2">We may request additional documents or clarification and may pause/stop processing if information is incomplete, inconsistent, or raises compliance concerns.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">1.8 Limitation of liability</h4>
          <p className="mt-2">The site and services are provided “as is” and “as available.” To the maximum extent permitted by UAE law, Baraqa disclaims warranties and is not liable for indirect or consequential damages.</p>

          <h3 className="text-base font-black text-[#116656] mt-8">2. Privacy Policy</h3>
          <p className="mt-2">This policy explains how Baraqa collects, uses, shares, stores, and protects personal data when you use our site/services.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">2.1 What we collect</h4>
          <p className="mt-2">
            Identity & contact (name, phone, email, Emirates ID/passport/visa), financial & employment (salary certificate, payslips, bank statements), self-employed documents (trade license, VAT returns/receipts, business bank statements), property/transaction documents (MOU/MOA/SPA, developer info), and technical data (cookies/analytics/logs).
          </p>

          <h4 className="text-sm font-black text-[#116656] mt-4">2.2 Sharing</h4>
          <p className="mt-2">
            With your consent, Baraqa may share your file with licensed Broker Partner(s) and Lenders for mortgage processing. We may also use service providers (hosting, CRM, storage, IT/security) under confidentiality obligations and disclose information to authorities where legally required.
          </p>

          <h4 className="text-sm font-black text-[#116656] mt-4">2.3 International transfers</h4>
          <p className="mt-2">Your data may be stored/processed outside the UAE by certain service providers or broker systems, subject to reasonable safeguards.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">2.4 Security incident notice</h4>
          <p className="mt-2">If a data security incident occurs, Baraqa will take reasonable steps to contain it and will notify affected parties and regulators where required by applicable law.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">2.5 Retention</h4>
          <p className="mt-2">We retain data only as long as needed for the services, dispute handling, and compliance/record-keeping, then delete or anonymize using reasonable measures.</p>

          <h3 className="text-base font-black text-[#116656] mt-8">3. Cookies Policy</h3>
          <p className="mt-2">We use cookies to keep the site working, remember preferences, understand usage (analytics), and measure marketing performance (only if enabled).</p>

          <h3 className="text-base font-black text-[#116656] mt-8">4. Required Client Consent</h3>

          <h4 className="text-sm font-black text-[#116656] mt-4">4.1 Third-party processing disclosure</h4>
          <p className="mt-2">Mortgage applications are processed through a third-party licensed mortgage broker platform partner and then submitted to UAE lenders.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">4.2 Required consent before any upload/submission</h4>
          <p className="mt-2">Before Baraqa uploads or submits any personal data to a Broker Partner platform, we must obtain your explicit consent.</p>

          <h4 className="text-sm font-black text-[#116656] mt-4">4.3 Proof of consent</h4>
          <p className="mt-2">We may store proof of consent (timestamp and method such as website checkbox and/or WhatsApp message) as part of our compliance record.</p>

          <h3 className="text-base font-black text-[#116656] mt-8">5. Updates</h3>
          <p className="mt-2">We may update these terms from time to time. Continued use of the site indicates acceptance of the updated version.</p>

          <h3 className="text-base font-black text-[#116656] mt-8">6. Contact</h3>
          <p className="mt-2">
            Email:{" "}
            <a className="font-black text-[#116656] hover:underline" href="mailto:support@baraqa.io">
              support@baraqa.io
            </a>
          </p>
          <p className="mt-2">Address: Business Center, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates.</p>
        </div>
      </div>
    </div>
  );
};

// --- CONSENT HELPERS ---
const CONSENT_STORAGE_KEY = "baraqa_consent_proof_v1";

const buildConsentPayload = ({ required, optionalThirdParty, method }) => ({
  required: !!required,
  optionalThirdParty: !!optionalThirdParty,
  method: method || "website_checkbox",
  ts: new Date().toISOString(),
});

const persistConsentProof = (payload) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // no-op
  }
};

const getConsentProof = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// --- ELIGIBILITY CALCULATOR ---
const EligibilityCalculator = ({ id, embedded = true, onOpenLegal }) => {
  const [income, setIncome] = useState("");
  const [result, setResult] = useState(null);

  // Consent states (required gate for any submission/upload)
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentThirdParty, setConsentThirdParty] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);

  useEffect(() => {
    const proof = getConsentProof();
    if (proof?.required) {
      setConsentRequired(true);
      setConsentThirdParty(!!proof.optionalThirdParty);
      setConsentSaved(true);
    }
  }, []);

  const preventMinus = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
  };

  const calculateEligibility = () => {
    const monthlyIncome = parseFloat(income);
    if (!monthlyIncome || monthlyIncome <= 0) return;

    // Simple estimate (NOT a lender decision)
    const loanAmount = monthlyIncome * 60;

    setResult({
      amount: Math.round(loanAmount),
      rangeLow: Math.round(loanAmount * 0.9),
      rangeHigh: Math.round(loanAmount * 1.1),
    });
  };

  const resetForm = () => {
    setResult(null);
    setIncome("");
  };

  const saveConsent = () => {
    if (!consentRequired) return;
    const payload = buildConsentPayload({
      required: true,
      optionalThirdParty: consentThirdParty,
      method: "website_checkbox",
    });
    persistConsentProof(payload);
    setConsentSaved(true);
  };

  const openWhatsAppWithConsent = () => {
    if (typeof window === "undefined") return;
    if (!consentRequired) return;

    const payload = buildConsentPayload({
      required: true,
      optionalThirdParty: consentThirdParty,
      method: "website_checkbox",
    });
    persistConsentProof(payload);
    setConsentSaved(true);

    const messageLines = [
      "I CONSENT",
      "",
      "I consent to Baraqa collecting and preparing my documents and sharing them with a licensed mortgage broker platform partner and UAE lenders for mortgage processing.",
      "I understand Baraqa is not a bank or licensed mortgage broker and does not guarantee approval, rate, or timelines.",
      consentThirdParty
        ? "I also authorize Baraqa to contact my employer/developer/agent and other relevant parties only as necessary to progress my transaction."
        : "",
      "",
      `Consent timestamp (UTC): ${payload.ts}`,
    ].filter(Boolean);

    const text = encodeURIComponent(messageLines.join("\n"));
    const url = `https://wa.me/971581589603?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const containerClass = embedded
    ? "bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(17,102,86,0.1)] overflow-hidden min-h-[420px] border border-[#E0D8CC]/60 backdrop-blur-xl"
    : "bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(17,102,86,0.1)] overflow-hidden min-h-[420px] border border-[#E0D8CC] max-w-4xl mx-auto";

  return (
    <div className={containerClass} id={id}>
      {!result ? (
        <div className="p-8 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col justify-center h-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#116656] mb-4 tracking-tight">Check Your Eligibility</h2>
            <p className="text-[#4A7A70] text-base font-light">Estimated borrowing range (illustration only; lender decides).</p>
          </div>

          <div className="space-y-8 max-w-md mx-auto w-full">
            <div className="group relative">
              <label className="block text-[10px] font-bold text-[#4A7A70] uppercase tracking-widest mb-2 ml-1 group-focus-within:text-[#116656] transition-colors">
                Monthly Income (AED)
              </label>
              <input
                type="number"
                min="0"
                onKeyDown={preventMinus}
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 25,000"
                className="w-full px-6 py-4 rounded-xl border border-[#E0D8CC] bg-[#FAF4E8] focus:bg-white focus:border-[#116656] focus:ring-4 focus:ring-[#116656]/10 outline-none transition-all duration-300 font-bold text-xl text-[#116656] placeholder-slate-400"
              />
            </div>

            <button
              onClick={calculateEligibility}
              className="w-full bg-[#116656] text-white py-4 rounded-xl text-base font-bold hover:bg-[#0E5548] transition-all duration-300 shadow-lg hover:shadow-[#116656]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              type="button"
            >
              See My Options <ArrowRight size={20} />
            </button>

            <p className="text-[11px] text-[#4A7A70]/80 font-semibold text-center leading-relaxed">
              Baraqa is not a bank or licensed mortgage broker. If you proceed, your file may be processed via licensed broker platform partner(s) and submitted to lenders.
              <button onClick={onOpenLegal} className="ml-1 font-black text-[#116656] hover:underline" type="button">
                Read Legal & Privacy
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 md:p-14 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 h-full bg-gradient-to-b from-white to-[#FAF4E8]/80">
          <div className="w-16 h-16 bg-[#FAF4E8] text-[#116656] rounded-full flex items-center justify-center mb-6 shadow-md ring-4 ring-white">
            <CheckCircle size={32} />
          </div>

          <h3 className="text-xs font-bold text-[#4A7A70] uppercase tracking-widest mb-4">Estimated Eligibility (Illustration)</h3>

          <h2 className="text-5xl md:text-6xl font-black text-[#116656] mb-3 tracking-tighter">
            {result.amount.toLocaleString()} <span className="text-2xl text-[#4A7A70] font-bold">AED</span>
          </h2>

          <p className="text-[#4A7A70] mb-6 text-sm">
            Range: {result.rangeLow.toLocaleString()} – {result.rangeHigh.toLocaleString()} AED
          </p>

          {/* CONSENT GATE */}
          <div className="w-full max-w-xl bg-white/85 backdrop-blur-xl border border-[#E0D8CC] rounded-2xl p-5 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-[#116656] mt-0.5" size={18} />
              <div>
                <p className="text-sm font-black text-[#116656]">Consent required before any upload/submission</p>
                <p className="text-[12px] text-[#4A7A70] mt-1 leading-relaxed">
                  Before Baraqa uploads/submits any personal data to a licensed mortgage broker platform partner, we must capture your explicit consent and store proof (timestamp/method).
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentRequired}
                  onChange={(e) => {
                    setConsentRequired(e.target.checked);
                    setConsentSaved(false);
                  }}
                  className="mt-1"
                />
                <span className="text-[12px] text-[#4A7A70] leading-relaxed">
                  <span className="font-black text-[#116656]">Required:</span> I consent to Baraqa collecting and preparing my documents and sharing them with a licensed mortgage broker platform partner and UAE lenders for mortgage processing. I understand Baraqa is not a bank or licensed mortgage broker and does not guarantee approval, rate, or timelines.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentThirdParty}
                  onChange={(e) => {
                    setConsentThirdParty(e.target.checked);
                    setConsentSaved(false);
                  }}
                  className="mt-1"
                />
                <span className="text-[12px] text-[#4A7A70] leading-relaxed">
                  <span className="font-black text-[#116656]">Optional:</span> I authorize Baraqa to contact my employer, developer, real estate agent, and other relevant parties only as necessary to progress my transaction.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveConsent}
                  disabled={!consentRequired}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                    consentRequired ? "bg-white border-[#E0D8CC] text-[#116656] hover:bg-[#FAF4E8]" : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Save Consent Proof
                </button>

                <button
                  type="button"
                  onClick={openWhatsAppWithConsent}
                  disabled={!consentRequired}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    consentRequired ? "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg shadow-green-500/10 hover:shadow-green-500/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  WhatsApp “I CONSENT”
                </button>

                <button type="button" onClick={onOpenLegal} className="px-4 py-2 rounded-xl text-xs font-black bg-[#116656] text-white hover:bg-[#0E5548] transition-colors">
                  View Legal & Privacy
                </button>
              </div>

              {consentSaved && <p className="text-[11px] text-[#4A7A70]/80 font-semibold pt-1">Consent proof saved (where supported). You can proceed to WhatsApp to create an additional record in chat.</p>}
            </div>
          </div>

          <div className="mt-6 w-full max-w-sm">
            <button onClick={resetForm} className="w-full text-[#4A7A70] text-xs font-bold hover:text-[#116656] flex items-center justify-center gap-1.5 transition-colors py-3 px-4 rounded-xl hover:bg-[#FAF4E8]" type="button">
              <RefreshCw size={14} /> Recalculate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ONBOARDING FLOW ---
const OnboardingFlow = ({ onBack, onOpenLegal }) => {
  const [step, setStep] = useState(0);

  const stages = [
    { icon: <FileSignature size={28} />, title: "Signed Agreement", desc: "I have a contract in hand" },
    { icon: <Key size={28} />, title: "Making Offers", desc: "I found a property I like" },
    { icon: <MapPin size={28} />, title: "Viewing Homes", desc: "I'm actively looking" },
    { icon: <Search size={28} />, title: "Just Researching", desc: "Getting started" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF4E8] flex flex-col font-sans">
      <div className="px-6 md:px-12 py-6 flex justify-between items-center bg-[#FAF4E8]/80 backdrop-blur-md border-b border-[#E0D8CC] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#116656] rounded-lg flex items-center justify-center text-white shadow-md">
            <Building2 size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-[#116656]">Baraqa</span>
        </div>
        <button onClick={onBack} className="text-[#4A7A70] hover:text-[#116656] font-bold flex items-center gap-2 text-sm" type="button">
          <X size={16} /> Close
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-6 md:p-12">
        {step === 0 ? (
          <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-[#116656] mb-4 tracking-tight">Where are you in the home buying process?</h2>
              <p className="text-sm text-[#4A7A70] font-semibold">Educational flow only. Baraqa is not a bank or licensed mortgage broker.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {stages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(1)}
                  className="group bg-white p-6 rounded-2xl border border-[#E0D8CC] hover:border-[#116656] hover:shadow-lg text-left transition-all duration-300 flex items-start gap-6 hover:-translate-y-0.5"
                  type="button"
                >
                  <div className="w-12 h-12 bg-[#FAF4E8] rounded-xl flex items-center justify-center text-[#4A7A70] group-hover:bg-[#116656] group-hover:text-white transition-colors">
                    {s.icon}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold text-[#116656] mb-1">{s.title}</h3>
                    <p className="text-[#4A7A70] text-sm">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button onClick={onOpenLegal} className="text-xs font-black text-[#116656] hover:underline" type="button">
                Read Legal & Privacy
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep(0)} className="mb-8 text-[#4A7A70] hover:text-[#116656] font-bold flex items-center gap-2 transition-colors pl-2 text-sm" type="button">
              <ArrowLeft size={16} /> Back to options
            </button>
            <EligibilityCalculator embedded={false} onOpenLegal={onOpenLegal} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- HERO (kohost vibe) ---
const HeroKohostStyle = ({ onPrimary, onSecondary, onOpenLegal }) => {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: "-20% 0px -20% 0px" });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.2, 0.8, 0.2, 1] } },
  };

  const badges = [
    { label: "Fast pre-approval support*", icon: Clock },
    { label: "Multiple UAE lenders*", icon: Landmark },
    { label: "Zero Baraqa advisory fees*", icon: Wallet },
    { label: "Sharia-compliant options*", icon: BadgeCheck },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#FAF4E8]">
      <div className="absolute inset-0 -z-10 bg-[#FAF4E8]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_circle_at_50%_15%,rgba(17,102,86,0.05),transparent_55%),radial-gradient(900px_circle_at_20%_60%,rgba(17,102,86,0.03),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(245,158,11,0.05),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.4] bg-[linear-gradient(to_right,rgba(17,102,86,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,102,86,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <motion.div ref={wrapRef} variants={container} initial="hidden" animate={inView ? "show" : "hidden"} className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24 text-center">
        <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full bg-[#116656]/5 border border-[#116656]/10 px-4 py-2 text-[#116656] text-[11px] font-black uppercase tracking-[0.22em]">
          <ShieldCheck size={14} /> UAE mortgage readiness • via licensed broker partners
        </motion.div>

        <motion.h1 variants={item} className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-[1.02] text-[#116656]">
          Your Dream Home.
          <br />
          <span className="text-[#116656]/70">Prepared Smarter.</span>
        </motion.h1>

        <motion.p variants={item} className="mt-6 text-base md:text-lg text-[#4A7A70] leading-relaxed max-w-2xl mx-auto">
          Zero Baraqa advisory fees. We help you prepare a bank-ready file and access competitive lender options via licensed broker platform partner(s)—subject to lender criteria and approval.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onPrimary} className="px-8 py-3.5 bg-[#116656] text-white rounded-full font-black text-base hover:bg-[#0E5548] transition-all hover:scale-[1.02] shadow-lg shadow-[#116656]/20 inline-flex items-center justify-center gap-2" type="button">
            Check Eligibility <ArrowRight size={18} />
          </button>

          <button onClick={onSecondary} className="px-8 py-3.5 bg-white border border-[#E0D8CC] text-[#116656] rounded-full font-black text-base hover:bg-[#FAF4E8] transition-all inline-flex items-center justify-center gap-2" type="button">
            Explore Features <ChevronDown size={18} />
          </button>
        </motion.div>

        <motion.div variants={item} className="mt-6 flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <div key={b.label} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#E0D8CC] text-[#116656] text-xs font-black">
              <b.icon size={14} /> {b.label}
            </div>
          ))}
        </motion.div>

        <motion.p variants={item} className="mt-6 text-[11px] text-[#4A7A70]/80 font-semibold max-w-3xl mx-auto leading-relaxed">
          Baraqa is not a bank or licensed mortgage broker. Applications (if any) are processed via licensed broker platform partner(s) and submitted to lenders. No guarantee of approval, rate, or timeline.{" "}
          <button onClick={onOpenLegal} className="font-black text-[#116656] hover:underline" type="button">
            Legal & Privacy
          </button>
        </motion.p>
      </motion.div>
    </section>
  );
};

const BorrowerFlowStrip = () => {
  const steps = [
    { title: "Know your budget", desc: "Eligibility + down payment ranges in minutes.", icon: Calculator },
    { title: "Get bank-ready", desc: "Document checklist + submission hygiene.", icon: FileSignature },
    { title: "Close smoothly", desc: "FOL + transfer-day prep (third-party dependent).", icon: KeyRound },
  ];

  return (
    <section className="relative bg-[#116656] border-t border-[#116656]/20 border-b border-[#116656]/20 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.1),transparent_45%),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-white/60 mb-4">The Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Simple, Transparent, Clear.</h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold">
            <AlertTriangle size={14} /> Avoid “MOU-first” mistakes
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/15 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6">
                <s.icon size={24} />
              </div>
              <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">Step 0{i + 1}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[11px] text-white/60 font-semibold">*Processing times and outcomes depend on broker partner processes and lender discretion.</p>
      </div>
    </section>
  );
};

// --- PINNED FEATURES ---
const PinnedFeaturesKohostStyle = () => {
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });

  const [active, setActive] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const idx = clamp(Math.floor(v * FEATURES.length), 0, FEATURES.length - 1);
      setActive(idx);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const activeFeature = FEATURES[active];

  return (
    <section id="features" ref={wrapRef} className="relative bg-[#FAF4E8]">
      <div className="h-[300vh]">
        <div className="sticky top-0 min-h-screen flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#4A7A70]/60 mb-4">Features & Benefits</p>
                <h2 className="text-4xl md:text-6xl font-black text-[#116656] tracking-tight leading-[1.1] mb-6">
                  Power comes from everything <span className="text-[#116656]/50">working together.</span>
                </h2>
                <p className="text-[#4A7A70] text-lg max-w-xl leading-relaxed mb-10">
                  A single flow that helps borrowers understand the UAE process and prepare cleaner submissions (subject to lender and broker partner requirements).
                </p>

                <div className="space-y-2">
                  {FEATURES.map((f, i) => (
                    <button
                      key={f.k}
                      onClick={() => {
                        const el = document.getElementById("features");
                        if (el && typeof window !== "undefined") {
                          window.scrollTo({ top: el.offsetTop + window.innerHeight * i * 0.5, behavior: "smooth" });
                        }
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                        i === active ? "bg-[#116656] border-[#116656] text-white shadow-lg" : "border-transparent text-[#4A7A70] hover:text-[#116656] hover:bg-white"
                      }`}
                      type="button"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === active ? "bg-white text-[#116656]" : "bg-[#116656]/10 text-[#116656]"}`}>
                        <f.icon size={16} />
                      </div>
                      <span className="font-bold text-sm">{f.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-[2.5rem] border border-[#E0D8CC] bg-white overflow-hidden shadow-2xl aspect-[4/5] md:aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#116656]/10 to-[#FAF4E8] transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center p-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeature.k}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-[#E0D8CC] shadow-xl w-full"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#116656] text-white flex items-center justify-center mb-6 shadow-lg">
                          <activeFeature.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-[#116656] mb-3">{activeFeature.title}</h3>
                        <p className="text-[#4A7A70] leading-relaxed mb-6">{activeFeature.desc}</p>

                        <div className="flex flex-wrap gap-2">
                          {activeFeature.chips.map((chip) => (
                            <span key={chip} className="px-3 py-1 bg-[#FAF4E8] text-[#116656] rounded-full text-xs font-bold border border-[#E0D8CC]">
                              {chip}
                            </span>
                          ))}
                        </div>

                        <p className="mt-6 text-[11px] text-[#4A7A70]/70 font-semibold">Baraqa is not a bank or licensed mortgage broker. Lenders decide approvals, rates, and timelines.</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-10 text-[11px] text-[#4A7A70]/70 font-semibold">*Statements are general and may vary by lender and broker partner operations.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- FOOTER ---
const DarkFooter = ({ onLegal }) => (
  <footer className="bg-[#116656] border-t border-white/10">
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <BaraqaMark dark />
            <span className="text-white text-xl font-black tracking-tight">Baraqa</span>
          </div>
          <p className="text-white/80 mt-4 max-w-sm leading-relaxed text-sm">Borrower-first mortgage readiness for the UAE. Understand your budget, prep your documents, and follow a clean path to transfer.</p>

          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white/90 text-xs font-bold">
            SPCFZ business license • Not a bank / not a licensed mortgage broker
          </div>

          <p className="mt-4 text-[11px] text-white/60 font-semibold max-w-md">Applications (if any) are processed via licensed mortgage broker platform partner(s) and submitted to lenders. No guarantee of approval, rate, or timelines.</p>
        </div>

        <div>
          <h4 className="text-white/90 font-black text-xs uppercase tracking-[0.22em] mb-6">Company</h4>
          <ul className="space-y-4 text-white/70 text-sm font-medium">
            <li>
              <a href="#journey" className="hover:text-white transition-colors">
                The Journey
              </a>
            </li>
            <li>
              <a href="#mortgages" className="hover:text-white transition-colors">
                Mortgage Solutions
              </a>
            </li>
            <li>
              <button onClick={onLegal} className="hover:text-white transition-colors" type="button">
                Legal & Privacy
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white/90 font-black text-xs uppercase tracking-[0.22em] mb-6">Contact</h4>
          <ul className="space-y-4 text-white/70 text-sm font-medium">
            <li className="flex items-center gap-3">
              <Phone size={16} /> +971 58 158 9603
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} /> hello@baraqa.io
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/50 font-medium">
        <p>&copy; 2025 Baraqa Mortgage FZ-LLC. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <button onClick={onLegal} className="hover:text-white transition-colors" type="button">
            Terms
          </button>
          <button onClick={onLegal} className="hover:text-white transition-colors" type="button">
            Privacy
          </button>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Journey State
  const [activePersona, setActivePersona] = useState("resident"); // resident, non_resident, national
  const [journeyProgress, setJourneyProgress] = useState(0);
  const journeyRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start center", "end center"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (latest) => setJourneyProgress(latest));
    return () => unsub();
  }, [smoothProgress]);

  const handleGetStarted = (e) => {
    if (e) e.preventDefault();
    setCurrentView("onboarding");
    safeScrollToTop();
    setIsMobileMenuOpen(false);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    safeScrollToTop();
  };

  const handleNavigation = (e, targetId) => {
    if (e) e.preventDefault();
    if (currentView !== "home") {
      setCurrentView("home");
      if (typeof window !== "undefined") setTimeout(() => safeScrollToTarget(targetId), 100);
    } else {
      safeScrollToTarget(targetId);
    }
    setIsMobileMenuOpen(false);
  };

  const navClass = `fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl rounded-full transition-all duration-500 border ${
    scrolled ? "bg-[#FAF4E8]/95 backdrop-blur-xl border-[#E0D8CC]/50 py-3 shadow-sm" : "bg-transparent border-transparent py-6"
  }`;

  if (currentView === "onboarding") {
    return <OnboardingFlow onBack={handleBackToHome} onOpenLegal={() => setIsLegalOpen(true)} />;
  }

  return (
    <div className="min-h-screen font-sans text-[#116656] bg-[#FAF4E8]">
      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
      <StickyEligibilityBar show={scrolled} />

      <style>{`
        .marquee-container {
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .marquee-track { animation: marquee 60s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bgLight}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.primary}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.primaryHover}; }
      `}</style>

      {/* Navigation */}
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              safeScrollToTop();
            }}
            className="flex items-center gap-2 group text-[#116656]"
          >
            <BaraqaMark />
            <span className="text-xl font-black tracking-tight">Baraqa</span>
          </a>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#116656]">
            <a href="#mortgages" onClick={(e) => handleNavigation(e, "mortgages")} className="hover:opacity-70 transition-opacity">
              Mortgages
            </a>
            <a href="#journey" onClick={(e) => handleNavigation(e, "journey")} className="hover:opacity-70 transition-opacity">
              The Journey
            </a>
            <a href="#partners" onClick={(e) => handleNavigation(e, "partners")} className="hover:opacity-70 transition-opacity">
              For Partners
            </a>
            <button onClick={() => setIsLegalOpen(true)} className="hover:opacity-70 transition-opacity" type="button">
              Legal
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => safeScrollToTarget("eligibility")} className="px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-[#116656] text-white hover:bg-[#0E5548]" type="button">
              Check Eligibility
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen((s) => !s)} className="md:hidden text-[#116656]" type="button" aria-label="Toggle menu">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FAF4E8]/95 backdrop-blur-xl pt-32 px-6 overflow-y-auto md:hidden animate-in slide-in-from-top-10 duration-300">
          <div className="flex flex-col gap-6 text-center">
            <a href="#mortgages" onClick={(e) => handleNavigation(e, "mortgages")} className="text-2xl font-bold text-[#116656]">
              Mortgages
            </a>
            <a href="#journey" onClick={(e) => handleNavigation(e, "journey")} className="text-2xl font-bold text-[#116656]">
              The Journey
            </a>
            <a href="#partners" onClick={(e) => handleNavigation(e, "partners")} className="text-2xl font-bold text-[#116656]">
              Partners
            </a>
            <button
              onClick={() => {
                setIsLegalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-2xl font-bold text-[#116656]"
              type="button"
            >
              Legal & Privacy
            </button>

            <div className="mt-8 space-y-4">
              <button onClick={handleGetStarted} className="block w-full text-center bg-[#116656] text-white py-4 rounded-xl font-bold text-lg shadow-lg" type="button">
                Get Started
              </button>
              <a href="https://wa.me/971581589603" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border border-[#E0D8CC] text-[#116656] py-4 rounded-xl font-bold text-lg">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <HeroKohostStyle onPrimary={() => safeScrollToTarget("eligibility")} onSecondary={() => safeScrollToTarget("features")} onOpenLegal={() => setIsLegalOpen(true)} />

      {/* Below-hero strip */}
      <BorrowerFlowStrip />

      {/* Pinned features */}
      <PinnedFeaturesKohostStyle />

      {/* Bank Marquee */}
      <section className="bg-[#116656] border-y border-white/10 py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-bold">Example UAE lenders (via licensed broker platform partners)</p>
          <p className="mt-3 text-[11px] text-white/60 font-semibold">Availability and products change. Listing is illustrative and not an endorsement.</p>
        </div>

        <div className="marquee-container overflow-hidden w-full relative">
          <div className="marquee-track flex gap-24 w-max items-center">
            {BANKS.concat(BANKS).map((b, i) => (
              <span key={`b-${i}`} className="text-3xl font-bold text-white/20 whitespace-nowrap tracking-tight hover:text-white/80 transition-colors cursor-default duration-500">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="relative py-24 bg-white" ref={journeyRef}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#116656] mb-6 tracking-tight">The Path to Ownership</h2>

            <div className="inline-flex bg-[#FAF4E8] p-1 rounded-full shadow-inner mb-6 border border-[#E0D8CC]">
              {[
                { id: "resident", label: "UAE Resident" },
                { id: "non_resident", label: "Non-Resident" },
                { id: "national", label: "UAE National" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activePersona === p.id ? "bg-white text-[#116656] shadow-sm" : "text-[#4A7A70] hover:text-[#116656]"}`}
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#4A7A70]/80 font-semibold max-w-3xl mx-auto">Educational process overview. Baraqa is not a bank or licensed mortgage broker. Submissions (if any) are via licensed broker platform partner(s) and lenders decide.</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px -ml-[1px] md:-ml-0 h-full z-0">
              <div className="absolute top-0 bottom-0 w-[2px] bg-[#E0D8CC] left-0" />
              <motion.div className="absolute top-0 w-[2px] bg-[#116656] left-0" style={{ height: `${journeyProgress * 100}%` }} />
            </div>

            <div className="space-y-0">
              {JOURNEY_STEPS.map((step, idx) => (
                <JourneyStepCard key={step.id} step={step} index={idx} activePersona={activePersona} isActive={journeyProgress > idx / JOURNEY_STEPS.length} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Profiles */}
      <section id="mortgages" className="py-24 bg-[#FAF4E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#116656] mb-6 tracking-tight">Mortgage Solutions</h2>
            <p className="text-[#4A7A70] text-sm font-semibold">Examples by borrower profile (subject to lender policy).</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ServiceCard icon={<User size={32} />} title="Salaried Employees" desc="Common requirements vary by lender and profile." points={["LTV varies by lender and profile", "Rates vary by lender and profile", "Salary transfer rules depend on lender"]} />
            <ServiceCard icon={<Briefcase size={32} />} title="Self-Employed" desc="Documents and eligibility vary by lender policy and business profile." points={["Often based on business income/profit", "Case-by-case assessment", "Business vintage requirements vary"]} />
            <ServiceCard icon={<Globe size={32} />} title="Non-Residents" desc="Eligibility and LTV vary by lender policy and country profile." points={["LTV varies by lender", "No UAE residency needed in some cases", "Remote processing may be possible"]} />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FAF4E8] to-white -z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-3 py-1 bg-[#116656]/10 text-[#116656] rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">Partner Program</div>
              <h2 className="text-3xl md:text-5xl font-black text-[#116656] mb-6 tracking-tight leading-tight">Unlock New Revenue Streams.</h2>
              <p className="text-base text-[#4A7A70] mb-8 leading-relaxed">Partner with Baraqa to help clients prepare cleaner submissions and navigate milestones. Partner compensation (if any) is governed by written agreements and applicable disclosures.</p>

              <div className="grid gap-4 mb-10">
                {["Cleaner submissions", "Clear process guidance", "Smoother transfer-day prep"].map((item) => (
                  <div key={item} className="flex items-center gap-3 font-semibold text-sm text-[#4A7A70]">
                    <div className="w-6 h-6 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#116656]">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <a href="mailto:partners@baraqa.com" className="inline-flex items-center gap-2 px-6 py-3 bg-[#116656] text-white rounded-xl font-bold hover:bg-[#0E5548] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm">
                <Handshake size={18} /> Register as Partner
              </a>

              <p className="mt-4 text-[11px] text-[#4A7A70]/70 font-semibold">Note: Partners may receive referral fees where applicable; details should be disclosed to clients as required.</p>
            </div>

            <div className="lg:w-1/2">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop"
                  alt="Partners"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#116656] to-transparent flex flex-col justify-end p-8 text-white">
                  <p className="font-bold text-2xl">Grow with Baraqa</p>
                  <p className="opacity-80 text-sm">Process support and cleaner submissions—subject to broker partner and lender processes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility" className="py-32 bg-[#116656] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FAF4E8]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <EligibilityCalculator id="calc" onOpenLegal={() => setIsLegalOpen(true)} />
        </div>
      </section>

      <DarkFooter onLegal={() => setIsLegalOpen(true)} />
    </div>
  );
}