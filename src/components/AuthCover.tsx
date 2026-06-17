import React, { useState } from "react";
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  Terminal, 
  Users, 
  Coins, 
  Layers, 
  CheckCircle,
  FileCheck2,
  Bot
} from "lucide-react";
import { User, Organization } from "../types";

interface AuthCoverProps {
  onLogin: (user: User, customOrgId?: string) => void;
  users: User[];
  orgs: Organization[];
  onRequestPilot: (pilotData: {
    orgName: string;
    email: string;
    useCase: string;
    languages: string[];
    volume: string;
  }) => void;
  onJoinContributor: (contributorData: {
    name: string;
    email: string;
    mobile: string;
    college: string;
    degree: string;
    languages: string[];
    domains: string[];
  }) => void;
}

export default function AuthCover({ 
  onLogin, 
  users, 
  orgs, 
  onRequestPilot,
  onJoinContributor 
}: AuthCoverProps) {
  const [activeTab, setActiveTab] = useState<"landing" | "pilot-request" | "join-contributor" | "role-select">("landing");
  
  // Pilot Request State
  const [orgName, setOrgName] = useState("");
  const [pilotEmail, setPilotEmail] = useState("");
  const [useCase, setUseCase] = useState("Indic Language RLHF");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["Hindi"]);
  const [taskVolume, setTaskVolume] = useState("10,000–100,000");
  const [pilotSubmitted, setPilotSubmitted] = useState(false);

  // Contributor Application State
  const [contribName, setContribName] = useState("");
  const [contribEmail, setContribEmail] = useState("");
  const [contribMobile, setContribMobile] = useState("");
  const [contribCollege, setContribCollege] = useState("");
  const [contribDegree, setContribDegree] = useState("");
  const [contribLangs, setContribLangs] = useState<string[]>(["Hindi", "English"]);
  const [contribDomains, setContribDomains] = useState<string[]>(["Computer Science"]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [kycInDoc, setKycInDoc] = useState(false);
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [assignedTier, setAssignedTier] = useState<1 | 2 | 3 | null>(null);

  const indianLanguages = ["Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Kannada", "Gujarati", "English"];
  const studyDomains = ["Mathematics", "Physics", "Computer Science", "Biology", "Linguistics", "Medicine", "Law"];

  const handleRequestPilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !pilotEmail) return;
    onRequestPilot({
      orgName,
      email: pilotEmail,
      useCase,
      languages: selectedLangs,
      volume: taskVolume
    });
    setPilotSubmitted(true);
  };

  const handleSendOtp = () => {
    if (contribMobile.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === "2026") {
      setOtpVerified(true);
    } else {
      alert("Please enter the demo OTP: 2026");
    }
  };

  const runMockAssessment = () => {
    setAssessmentStarted(true);
    // Simulate scoring after 2 seconds
    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 80; // 80 - 100
      setTestScore(score);
      const tier = score >= 94 ? 3 : score >= 86 ? 2 : 1;
      setAssignedTier(tier);
      
      onJoinContributor({
        name: contribName,
        email: contribEmail,
        mobile: contribMobile,
        college: contribCollege || "IIT Madras",
        degree: contribDegree || "B.Tech Engineering",
        languages: contribLangs,
        domains: contribDomains
      });
    }, 2000);
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter(l => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const toggleContribLang = (lang: string) => {
    if (contribLangs.includes(lang)) {
      setContribLangs(contribLangs.filter(l => l !== lang));
    } else {
      setContribLangs([...contribLangs, lang]);
    }
  };

  const toggleDomain = (domain: string) => {
    if (contribDomains.includes(domain)) {
      setContribDomains(contribDomains.filter(d => d !== domain));
    } else {
      setContribDomains([...contribDomains, domain]);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-green selection:text-black">
      {/* Upper Tech bar */}
      <div className="border-b border-white/5 bg-white/[0.02] py-2 px-4 flex items-center justify-between text-xs font-mono text-brand-slate">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse-green" />
          <span>2UNE SECURE CLOUD SANDBOX — ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTC: 2026-06-17</span>
          <span>INR SUPPORT: ACTIVE</span>
        </div>
      </div>

      {/* Main Landing Page Header */}
      <header className="border-b border-white/5 bg-brand-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
            <div className="bg-brand-green text-black px-2.5 py-1 text-lg font-black tracking-tighter rounded font-mono">
              2UNE
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight">2UNE PLATFORM</div>
              <div className="text-[10px] text-brand-slate uppercase font-mono font-bold tracking-wider">India's Hybrid Human-Compute Layer for AI</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-brand-slate">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setActiveTab("landing")}>Platform Overview</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setActiveTab("pilot-request")}>Pilot Request</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setActiveTab("join-contributor")}>Contributor Application</span>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("role-select")}
              className="bg-brand-green hover:bg-brand-green/80 text-black px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2"
              id="magic-login-btn"
            >
              MAGIC LOGINS
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {activeTab === "landing" && (
        <main className="pb-20">
          {/* Hero Section */}
          <section className="relative px-4 pt-20 pb-16 overflow-hidden max-w-7xl mx-auto text-center">
            {/* Visual background element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-10 left-10 w-96 h-96 border border-white/5 bg-radial-grid rounded-full pointer-events-none -z-20 opacity-30" />

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-brand-green mb-6">
              <Bot size={13} />
              <span>THE LARGEST MANAGED DATA PIPELINE FOR GLOBAL LLM ALIGNMENT</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto">
              SLA-Backed Human Evaluation <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-teal">
                Built for Global AI Foundations
              </span>
            </h1>

            <p className="mt-6 text-brand-slate max-w-2xl mx-auto text-balance text-sm md:text-base leading-relaxed">
              Durable cloud persistence, verified top-tier academic human capital, and real-time Quality Assurance loops. Optimize your models for localization, safety red-teaming, voice, and complex reasoning tasks.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setActiveTab("pilot-request")}
                className="w-full sm:w-auto bg-brand-green hover:bg-brand-green/95 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                id="cta-request-pilot"
              >
                Request a Managed Pilot
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setActiveTab("join-contributor")}
                className="w-full sm:w-auto border border-white/10 hover:border-brand-green/30 hover:bg-white/5 text-white bg-transparent font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                id="cta-join-contributor"
              >
                Join as Academic Scholar (₹300 - ₹4,000/hr)
              </button>
            </div>
          </section>

          {/* Quick Platform Metrics Row */}
          <section className="px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-brand-charcoal border border-white/5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green/2 via-transparent to-brand-teal/2 pointer-events-none" />
              <div>
                <div className="text-xs font-mono text-brand-slate uppercase tracking-wider">Completed Tasks</div>
                <div className="text-2xl md:text-3xl font-black text-brand-green mt-1">1,840</div>
                <div className="text-[10px] text-brand-slate mt-0.5">SLA-approved batches</div>
              </div>
              <div className="border-l border-white/5 pl-4 md:pl-6">
                <div className="text-xs font-mono text-brand-slate uppercase tracking-wider">Scholars Verification</div>
                <div className="text-2xl md:text-3xl font-black text-white mt-1">1,482</div>
                <div className="text-[10px] text-brand-success mt-0.5">IITs, IISc, COEP vetted</div>
              </div>
              <div className="border-l border-white/5 pl-4 md:pl-6 col-span-1">
                <div className="text-xs font-mono text-brand-slate uppercase tracking-wider">SLA Accuracy</div>
                <div className="text-2xl md:text-3xl font-black text-brand-teal mt-1">96.4%</div>
                <div className="text-[10px] text-brand-slate mt-0.5">Agreement consensus rating</div>
              </div>
              <div className="border-l border-white/5 pl-4 md:pl-6">
                <div className="text-xs font-mono text-brand-slate uppercase tracking-wider">Weekly Payouts</div>
                <div className="text-2xl md:text-3xl font-black text-brand-green mt-1">₹1,64,620</div>
                <div className="text-[10px] text-brand-success mt-0.5">Transferred via UPI weekly</div>
              </div>
            </div>
          </section>

          {/* Grid Use Cases */}
          <section className="max-w-7xl mx-auto px-4 mt-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Global Human-Compute Capability Modules</h2>
              <p className="text-brand-slate text-sm mt-2">Delivering exact model evaluations with native multidialect intelligence and high security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Indic Language RLHF",
                  desc: "Preference ranking and translation validation for major Indian languages (Hindi, Marathi, Bengali, Tamil etc.) focused on localized dialectal accuracy over standard literal models.",
                  icon: <Layers className="text-brand-green" size={24} />
                },
                {
                  title: "Voice Agent Evaluation",
                  desc: "Evaluating ambient phone calls, transcription errors, latency feedback, and natural sound accents representing real-world Indian environments and slang terms.",
                  icon: <Bot className="text-brand-teal" size={24} />
                },
                {
                  title: "Coding & Reasoning Eval",
                  desc: "Recruiting JEE Advanced and NEET candidates to stress-test complex algebraic equations, biological computing proofs, and Python sieve algorithms.",
                  icon: <Terminal className="text-brand-green" size={24} />
                },
                {
                  title: "Safety & Red Teaming",
                  desc: "Deep inspection of model susceptibility to regional cyber-threats, digital KYC evasion models, Aadhaar intercept scenarios, and UPI payments bypass exploits.",
                  icon: <ShieldCheck className="text-brand-amber" size={24} />
                },
                {
                  title: "Benchmark Design",
                  desc: "Formulating custom, secure, zero-shot benchmarks in regional technical fields. Kept separated under highly confidential secure access scopes.",
                  icon: <FileCheck2 className="text-brand-teal" size={24} />
                },
                {
                  title: "Enterprise Validation",
                  desc: "Tailored testing of enterprise bots in healthcare and BFSI sectors with strict SLA alignment overseen by individual PMs and Account Leads.",
                  icon: <Building2 className="text-brand-green" size={24} />
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-brand-charcoal border border-white/5 rounded-xl p-6 hover:border-brand-green/30 transition-all group duration-300">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.03] flex items-center justify-center group-hover:bg-brand-green/10 transition-all mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-brand-green transition-all">{item.title}</h3>
                  <p className="mt-2 text-xs text-brand-slate leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Unified Flow diagram */}
          <section className="max-w-7xl mx-auto px-4 mt-20">
            <div className="bg-brand-charcoal/50 border border-white/5 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-center mb-8">The 2UNE Platform Cycle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-green/15 text-brand-green font-mono font-bold flex items-center justify-center mx-auto mb-4 border border-brand-green/30">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">Project Initiated (Ops / Customer)</h4>
                  <p className="text-xs text-brand-slate mt-2 max-w-xs mx-auto">Customers submit design rubrics. Ops Project Managers structure batches, set instructions, and load content CSVs securely.</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/15 text-brand-teal font-mono font-bold flex items-center justify-center mx-auto mb-4 border border-brand-teal/30">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">Vetted Academic Sourcing</h4>
                  <p className="text-xs text-brand-slate mt-2 max-w-xs mx-auto">Vetted Tier 1-3 contributors claim available batches on their feed matching their exact language & tier certifications.</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-amber/15 text-brand-amber font-mono font-bold flex items-center justify-center mx-auto mb-4 border border-brand-amber/30">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">Audit & Quality Assurance Log</h4>
                  <p className="text-xs text-brand-slate mt-2 max-w-xs mx-auto">Low agreement tasks trigger immediate QA Auditor tickets. Verified packages are auto-issued as secure JSONL deliverables.</p>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* Pilot Request Flow */}
      {activeTab === "pilot-request" && (
        <main className="max-w-2xl mx-auto px-4 py-16">
          <button 
            onClick={() => setActiveTab("landing")}
            className="text-xs text-brand-slate hover:text-white font-mono flex items-center gap-2 mb-6"
          >
            ← BACK TO HOME
          </button>

          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Building2 className="text-brand-green" />
              Request a Guided Pilot Account
            </h2>
            <p className="text-xs text-brand-slate mt-2">
              Our Managed Pilots are SLA-guaranteed and designed with project-level isolation. Fill this form, and your assigned Account Lead will issue your magic link within 24 hours.
            </p>

            {pilotSubmitted ? (
              <div className="mt-8 p-6 bg-brand-green/10 border border-brand-green/20 rounded-xl text-center">
                <CheckCircle className="text-brand-green mx-auto mb-3" size={32} />
                <h3 className="font-bold text-white">Request Successfully Dispatched</h3>
                <p className="text-xs text-brand-slate mt-2 max-w-md mx-auto">
                  We have registered <strong className="text-white">{orgName}</strong> in our Local Storage Sandbox. You can now use the <strong className="text-white">Magic Logins</strong> button above and log in directly as <strong className="text-white">Rohan Bhasin (Sarvam AI)</strong> to test your customer dashboard!
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button 
                    onClick={() => setActiveTab("role-select")}
                    className="bg-brand-green text-black hover:bg-brand-green/90 px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Go to Magic Logins
                  </button>
                  <button 
                    onClick={() => {
                      setOrgName("");
                      setPilotEmail("");
                      setPilotSubmitted(false);
                    }}
                    className="border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg text-xs text-white"
                  >
                    Request Another Pilot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestPilotSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Organization Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sarvam AI, CoRover"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-brand-green rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Work Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="you@domain.ai"
                    value={pilotEmail}
                    onChange={(e) => setPilotEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-brand-green rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Primary Use Case</label>
                  <select 
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-brand-green rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="Indic Language RLHF">Indic Language RLHF</option>
                    <option value="Voice Agent Evaluation">Voice Agent Evaluation</option>
                    <option value="Coding & Reasoning Eval">Coding & Reasoning Eval</option>
                    <option value="Safety & Red Teaming">Safety & Red Teaming & Jailbreaks</option>
                    <option value="Benchmark Design">Benchmark Design</option>
                    <option value="Enterprise AI Validation">Enterprise AI Validation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Languages Involved (Select Multiple)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {indianLanguages.map(lang => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                          selectedLangs.includes(lang) 
                            ? "bg-brand-green/10 border-brand-green text-brand-green" 
                            : "bg-black/40 border-white/5 text-brand-slate hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-slate uppercase tracking-wider mb-2">Approximate Task Volume</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["<1,000", "1,000–10,000", "10,000–100,000", "100,000+"].map(vol => (
                      <button
                        type="button"
                        key={vol}
                        onClick={() => setTaskVolume(vol)}
                        className={`py-2 px-3 rounded-lg text-xs border transition-all ${
                          taskVolume === vol 
                            ? "bg-brand-green/15 border-brand-green text-brand-green" 
                            : "bg-black/40 border-white/5 text-brand-slate hover:text-white"
                        }`}
                      >
                        {vol}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    Submit Secure Request
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      )}

      {/* Contributor Application Flow */}
      {activeTab === "join-contributor" && (
        <main className="max-w-2xl mx-auto px-4 py-16">
          <button 
            onClick={() => setActiveTab("landing")}
            className="text-xs text-brand-slate hover:text-white font-mono flex items-center gap-2 mb-6"
          >
            ← BACK TO HOME
          </button>

          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <GraduationCap className="text-brand-green" />
              Academic Scholar Registration
            </h2>

            {/* Mobile-first Stepper */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mt-4 text-[10px] font-mono tracking-widest text-brand-slate">
              <span className={contribName && contribEmail ? "text-brand-green" : ""}>1. DETAILS</span>
              <span>→</span>
              <span className={otpVerified ? "text-brand-green" : ""}>2. MOBILE OTP</span>
              <span>→</span>
              <span className={kycInDoc ? "text-brand-green" : ""}>3. KYC</span>
              <span>→</span>
              <span className={assignedTier ? "text-brand-green" : ""}>4. SKILL TEST</span>
            </div>

            {/* Step 1: Details */}
            {!otpVerified && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">FULL NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aarav Patel"
                      value={contribName}
                      onChange={(e) => setContribName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">EMAIL</label>
                    <input 
                      type="email" 
                      placeholder="you@iitb.ac.in"
                      value={contribEmail}
                      onChange={(e) => setContribEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">COLLEGE / INSTITUTION</label>
                    <input 
                      type="text" 
                      placeholder="e.g. IIT Kharagpur"
                      value={contribCollege}
                      onChange={(e) => setContribCollege(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">DEGREE & GRAD YEAR</label>
                    <input 
                      type="text" 
                      placeholder="e.g. B.Tech CS 2027"
                      value={contribDegree}
                      onChange={(e) => setContribDegree(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">MOBILE NUMBER (VITAL FOR WHATSAPP/UPI)</label>
                  <div className="flex gap-2">
                    <span className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-slate flex items-center">+91</span>
                    <input 
                      type="tel" 
                      placeholder="9876543210"
                      maxLength={10}
                      value={contribMobile}
                      onChange={(e) => setContribMobile(e.target.value)}
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                    <button 
                      type="button"
                      disabled={contribMobile.length < 10}
                      onClick={handleSendOtp}
                      className="bg-brand-green text-black disabled:opacity-50 px-4 rounded-lg text-xs font-bold font-mono"
                    >
                      SEND OTP
                    </button>
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-4">
                    <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">DEMO OTP (ENTER "2026")</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={4}
                        placeholder="XXXX"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-24 bg-black/80 border border-white/10 rounded-lg px-3 py-2 text-center text-xs text-white tracking-widest outline-none font-mono"
                      />
                      <button 
                        type="button"
                        onClick={handleVerifyOtp}
                        className="bg-brand-teal text-white px-4 rounded-lg text-xs font-bold font-mono"
                      >
                        VERIFY
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: KYC & Demographics */}
            {otpVerified && !kycInDoc && (
              <div className="mt-6 space-y-4">
                <div className="bg-brand-success/10 border border-brand-success/20 p-3 rounded-lg text-xs text-brand-success flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>Mobile OTP Vetted Successfully</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">LANGUAGES PROFICIENCY</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {indianLanguages.map(lang => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleContribLang(lang)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                          contribLangs.includes(lang) 
                            ? "bg-brand-teal/10 border-brand-teal text-brand-teal" 
                            : "bg-black/40 border-white/5 text-brand-slate hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">DOMAINS SPECIALIZATION</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {studyDomains.map(dom => (
                      <button
                        type="button"
                        key={dom}
                        onClick={() => toggleDomain(dom)}
                        className={`py-1.5 px-2 rounded-lg text-xs border transition-all ${
                          contribDomains.includes(dom) 
                            ? "bg-brand-green/10 border-brand-green text-brand-green" 
                            : "bg-black/40 border-white/5 text-brand-slate hover:text-white"
                        }`}
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-slate tracking-wider mb-1">DEMO AADHAAR CARD NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="12 Digit Aadhaar Number"
                    maxLength={12}
                    value={aadhaarNum}
                    onChange={(e) => setAadhaarNum(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  disabled={!aadhaarNum || contribLangs.length === 0}
                  onClick={() => setKycInDoc(true)}
                  className="w-full mt-4 bg-brand-green hover:bg-brand-green/90 text-black font-bold py-2.5 rounded-lg text-xs transition-all font-mono"
                >
                  SAVE & PROCEED TO SECURE SKILL ASSESSMENT
                </button>
              </div>
            )}

            {/* Step 3: Skill Test */}
            {kycInDoc && (
              <div className="mt-6 text-center">
                {!assessmentStarted ? (
                  <div>
                    <h3 className="font-bold text-sm text-white">2UNE TIMED SKILL ASSESSMENT</h3>
                    <p className="text-xs text-brand-slate mt-2 max-w-md mx-auto">
                      All candidates must undergo a non-pausable reasoning and linguistics test. This assesses your qualification tier and rate: Tier 1 (₹300/hr) up to Tier 3 (₹2,000 - ₹4,000/hr).
                    </p>
                    <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl block text-left text-xs space-y-2">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span>• QUESTIONS: 20</span>
                        <span>• DURATION: TIMED</span>
                      </div>
                      <div className="text-brand-slate">
                        The score achieved is auto-written to local storage matching structures to grant certification milestones.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={runMockAssessment}
                      className="mt-6 bg-brand-green hover:bg-brand-green/90 text-black font-mono text-xs font-bold py-3 px-6 rounded-xl"
                    >
                      BEGIN DEMO AUTOMATED ASSESSMENT
                    </button>
                  </div>
                ) : (
                  <div>
                    {testScore === null ? (
                      <div className="py-12 space-y-4">
                        <div className="w-12 h-12 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-xs font-mono text-brand-green animate-pulse">EVALUATING REASONING METRICS... STAY IN TAB</div>
                        <p className="text-[10px] text-brand-slate">2UNE anti-cheat monitoring active.</p>
                      </div>
                    ) : (
                      <div className="py-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center mx-auto">
                          <CheckCircle className="text-brand-success" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-white">Assessment Vetted!</h4>
                        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <div className="text-[10px] font-mono text-brand-slate uppercase">SCORE ACCURACY</div>
                            <div className="text-xl font-bold text-brand-green mt-1">{testScore}%</div>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <div className="text-[10px] font-mono text-brand-slate uppercase">ASSIGNED TIER</div>
                            <div className="text-xl font-bold text-brand-teal mt-1">Tier {assignedTier}</div>
                          </div>
                        </div>

                        <p className="text-xs text-brand-slate max-w-md mx-auto">
                          Excellent. Your academic profile has been linked to <strong className="text-white">{contribCollege}</strong>. You are fully certified as a <strong className="text-white">Tier {assignedTier} Contributor</strong> on 2UNE!
                        </p>

                        <button
                          type="button"
                          onClick={() => setActiveTab("role-select")}
                          className="mt-4 bg-brand-teal hover:bg-brand-teal/90 text-white font-mono text-xs font-bold py-2.5 px-6 rounded-lg"
                        >
                          PROCEED TO PORTALS SELECTOR
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Role Select Wizard */}
      {activeTab === "role-select" && (
        <main className="max-w-4xl mx-auto px-4 py-16">
          <button 
            onClick={() => setActiveTab("landing")}
            className="text-xs text-brand-slate hover:text-white font-mono flex items-center gap-2 mb-6"
          >
            ← BACK TO HOME
          </button>

          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Vented Sandbox Magic Portals</h2>
            <p className="text-brand-slate text-sm mt-1">Choose a sandbox participant to view the exact screen scope in real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Box */}
            <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-green/30 transition-all">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    CUSTOMER PORTAL
                  </div>
                  <Building2 size={18} className="text-brand-slate" />
                </div>
                <h3 className="font-bold text-base">Rohan Bhasin</h3>
                <p className="text-xs text-brand-green font-mono font-bold">Sarvam AI — Chief Scientist</p>
                <p className="text-xs text-brand-slate mt-2 leading-relaxed">
                  Evaluate regional chatbot preference sets, inspect overall SLA margins, trace inter-annotator agreements, and upload ground truth logs for active calibration feedback loops.
                </p>
              </div>
              <button
                onClick={() => {
                  const u = users.find(usr => usr.id === "U_C001") || users[0];
                  onLogin(u, "O_001");
                }}
                className="mt-6 w-full bg-brand-green text-black hover:bg-brand-green/80 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1"
              >
                Log In as Rohan (Sarvam)
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Contributor Box */}
            <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-green/30 transition-all">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    CONTRIBUTOR PORTAL
                  </div>
                  <GraduationCap size={18} className="text-brand-slate" />
                </div>
                <h3 className="font-bold text-base">Aarav Patel</h3>
                <p className="text-xs text-brand-teal font-mono font-bold">IIT Bombay — Tier 1</p>
                <p className="text-xs text-brand-slate mt-2 leading-relaxed">
                  Claim matching tasks (RLHF, Coding, Safety blocks), execute deep comparison tests, manage UPI bank withdrawals, track weekly Indian Rupee earnings, and collect certifications.
                </p>
              </div>
              <button
                onClick={() => {
                  const u = users.find(usr => usr.id === "U_CO001") || users[3];
                  onLogin(u);
                }}
                className="mt-6 w-full bg-brand-teal text-white hover:bg-brand-teal/80 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1"
              >
                Log In as Aarav (IIT Bombay)
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Ops Box */}
            <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-green/30 transition-all">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-brand-amber/10 text-brand-amber px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    OPERATIONS PORTAL
                  </div>
                  <ShieldCheck size={18} className="text-brand-slate" />
                </div>
                <h3 className="font-bold text-base">Arjun Mehta</h3>
                <p className="text-xs text-brand-amber font-mono font-bold">2UNE Admin / Lead PM</p>
                <p className="text-xs text-brand-slate mt-2 leading-relaxed">
                  Complete workforce KYC verifications, establish custom evaluation rubrics, run task batch pipelines, and review consensus disagreements in the high-stakes QA Auditor queue.
                </p>
              </div>
              <button
                onClick={() => {
                  const u = users.find(usr => usr.id === "U_O001") || users[6];
                  onLogin(u);
                }}
                className="mt-6 w-full bg-brand-amber text-white hover:bg-brand-amber/80 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1"
              >
                Log In as Arjun (Admin PM)
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
