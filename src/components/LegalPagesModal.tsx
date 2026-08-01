import { useState, useEffect } from "react";
import { ShieldCheck, FileText, Stethoscope, Mail, X, Check, Lock, Database, AlertTriangle, Send } from "lucide-react";
import { Language, translate } from "../translations";

export type LegalTab = "privacy" | "terms" | "disclaimer" | "contact";

interface LegalPagesModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  language: Language;
}

export default function LegalPagesModal({
  isOpen,
  initialTab = "privacy",
  onClose,
  language
}: LegalPagesModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Lock background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMsg) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMsg("");
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div 
        id="legal-pages-modal"
        className="relative w-full max-w-3xl max-h-[90vh] bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-2xl flex flex-col overflow-hidden text-stone-800"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200">
              {activeTab === "privacy" && <ShieldCheck className="w-6 h-6 text-emerald-300" />}
              {activeTab === "terms" && <FileText className="w-6 h-6 text-emerald-300" />}
              {activeTab === "disclaimer" && <Stethoscope className="w-6 h-6 text-rose-300" />}
              {activeTab === "contact" && <Mail className="w-6 h-6 text-teal-300" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-extrabold tracking-wide uppercase">
                {activeTab === "privacy" && (language === "ms" ? "Dasar Privasi" : language === "zh" ? "隐私政策" : language === "ko" ? "개인정보 처리방침" : "Privacy Policy")}
                {activeTab === "terms" && (language === "ms" ? "Syarat Perkhidmatan" : language === "zh" ? "服务条款" : language === "ko" ? "이용약관" : "Terms of Service")}
                {activeTab === "disclaimer" && (language === "ms" ? "Penafian Perubatan" : language === "zh" ? "医疗免责声明" : language === "ko" ? "의료 면책 조항" : "Medical Disclaimer")}
                {activeTab === "contact" && (language === "ms" ? "Hubungi Kami" : language === "zh" ? "联系我们" : language === "ko" ? "문의하기" : "Contact Us")}
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                {language === "ms" ? "Komitmen Lindungi & Kebajikan Pengguna Bloom" : language === "zh" ? "Bloom 保护与符合合规的标准" : language === "ko" ? "Bloom 사용자 보호 및 준수 약관" : "Bloom Trust, Privacy & Protection Standards"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 p-2 bg-emerald-50/80 border-b border-emerald-100 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-2 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer border-none shrink-0 ${
              activeTab === "privacy"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === "ms" ? "Privasi" : language === "zh" ? "隐私政策" : language === "ko" ? "개인정보" : "Privacy Policy"}</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3.5 py-2 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer border-none shrink-0 ${
              activeTab === "terms"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === "ms" ? "Syarat" : language === "zh" ? "服务条款" : language === "ko" ? "이용약관" : "Terms of Service"}</span>
          </button>

          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`px-3.5 py-2 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer border-none shrink-0 ${
              activeTab === "disclaimer"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{language === "ms" ? "Penafian Perubatan" : language === "zh" ? "医疗免责" : language === "ko" ? "의료면책" : "Medical Disclaimer"}</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3.5 py-2 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer border-none shrink-0 ${
              activeTab === "contact"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{language === "ms" ? "Hubungi" : language === "zh" ? "联系我们" : language === "ko" ? "문의하기" : "Contact Us"}</span>
          </button>
        </div>

        {/* Scrollable Content View */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed text-stone-700 font-sans">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                <div className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Data Protection & Privacy Overview</span>
                </div>
                <p className="text-xs text-stone-600">
                  Bloom is built with privacy-first architecture adhering to Malaysia PDPA (Personal Data Protection Act), EU GDPR, and Korea PIPC/PIPA standards.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">1. Information We Collect</h3>
                <p>
                  To provide you with personalized cessation tracking, habit reflection tools, and companion plant progression, Bloom collects:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li><strong>Account Credentials:</strong> Email address and username.</li>
                  <li><strong>Recovery Data:</strong> Daily habit logs, smoking/vaping urge frequency, trigger reasons, and coping solutions.</li>
                  <li><strong>Self-Reflection Content:</strong> Personal diary entries and journal records.</li>
                  <li><strong>App Progress & Settings:</strong> Quit streaks, companion plant growth stage, seed type preferences, and theme choices.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">2. Secure Storage & Supabase Encryption</h3>
                <p>
                  All user data is stored securely in Supabase utilizing Row Level Security (RLS) and SSL/TLS encrypted database connections. Each user's data is isolated so only authenticated account owners can read or write their own records.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">3. No Third-Party Data Selling or Sharing</h3>
                <p>
                  Bloom strictly does <strong>NOT</strong> sell, rent, or trade your personal information to advertisers or third parties. Information is processed exclusively to deliver your self-help experience, unless required by applicable law or emergency health requests.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">4. Data Retention & Permanent Deletion Rights</h3>
                <p>
                  You retain complete ownership over your data. You can edit your profile information or permanently delete your entire account and all associated logs, diary entries, and plant progress at any time through the <strong>Account Settings</strong> page.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === "terms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                <div className="font-extrabold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Terms & Acceptable Use Policy</span>
                </div>
                <p className="text-xs text-stone-600">
                  By creating an account or using Bloom, you agree to these Terms of Service.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">1. Acceptable Use</h3>
                <p>
                  Bloom is provided as a personal health support and smoking/vaping cessation tracking tool. You agree to use the application solely for lawful, self-improvement, and personal logging purposes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">2. Account Responsibility</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your username and password. You must notify us immediately if you suspect unauthorized access to your account.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">3. Prohibited Conduct</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Attempt to bypass app security controls, reverse engineer, or exploit database infrastructure.</li>
                  <li>Use automated bots or scripts to scrape or overload the service.</li>
                  <li>Submit unlawful, malicious, or abusive content through in-app journals or forms.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">4. Termination & Service Availability</h3>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these terms or compromise service integrity. Bloom is provided on an "as-is" and "as-available" basis.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: MEDICAL DISCLAIMER */}
          {activeTab === "disclaimer" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/80 space-y-1.5">
                <div className="font-extrabold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                  <span>Important Medical Notice</span>
                </div>
                <p className="text-xs text-rose-900 font-medium leading-relaxed">
                  Bloom is an educational self-help companion app designed to encourage behavior modification and emotional tracking during nicotine reduction.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">1. Not Medical Advice</h3>
                <p>
                  The content, quests, WHO 4D strategies, and progress insights in Bloom do <strong>NOT</strong> constitute professional medical advice, clinical diagnosis, or medical treatment.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">2. Consult Healthcare Professionals</h3>
                <p>
                  Always seek the advice of your physician, addiction specialist, or certified healthcare provider regarding any severe nicotine withdrawal symptoms, medical condition, or treatment plan.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">3. Emergency & Support Helplines</h3>
                <p>
                  If you or someone you know is experiencing severe medical distress or psychological crisis, please contact emergency services immediately or reach official cessation hotlines:
                </p>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                  <div><strong>🇲🇾 Malaysia (mQuit / AADK):</strong> Call 03-8883 4400 / 1-800-22-2235</div>
                  <div><strong>🇰🇷 South Korea (Quitline):</strong> Call 1544-9030</div>
                  <div><strong>🌍 International Emergency:</strong> Call local national emergency services.</div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {activeTab === "contact" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                <div className="font-extrabold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-teal-700" />
                  <span>Get in Touch with Bloom Support</span>
                </div>
                <p className="text-xs text-stone-600">
                  Have questions, feedback, or need assistance with your account data? We'd love to hear from you.
                </p>
              </div>

              {contactSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h4 className="font-serif font-bold text-emerald-950 text-base">Thank You!</h4>
                  <p className="text-xs text-emerald-800">
                    Your message has been sent successfully. Our support team will review your feedback shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Name / Username</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Message or Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="How can we help you..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-none"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}

              <div className="pt-3 border-t border-stone-200 text-xs text-stone-500 space-y-1">
                <div><strong>Support Email:</strong> support@bloomapp.org</div>
                <div><strong>Response Time:</strong> Within 24-48 hours on business days</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-stone-500">
            Bloom Cessation Companion • v4.2
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold text-xs transition-all cursor-pointer border-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
