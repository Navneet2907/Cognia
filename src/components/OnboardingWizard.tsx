import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  BookOpen, 
  Award, 
  Coins, 
  Activity, 
  ShieldAlert, 
  Users, 
  Check, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  FileText, 
  CheckCircle,
  QrCode,
  Smartphone,
  CheckSquare,
  Lock,
  ArrowRight
} from "lucide-react";
import { Contributor, User } from "../types";

interface OnboardingWizardProps {
  user: User;
  contributor: Contributor;
  onComplete: (updatedFields: Partial<Contributor>) => void;
  onLogout: () => void;
}

export default function OnboardingWizard({
  user,
  contributor,
  onComplete,
  onLogout
}: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Step 1 States
  const [degree, setDegree] = useState("B.Tech");
  const [stream, setStream] = useState("CS");
  const [collegeTier, setCollegeTier] = useState("Tier 2");
  const [jeeNeet, setJeeNeet] = useState(false);

  // Step 2 States (Domain selector)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const domainsList = [
    { id: "Indic Language Evaluation", label: "Indic Language Evaluation", desc: "Localize & rate complex prompts across Indian vernaculars", tier: "Ters-1 eligible" },
    { id: "RLHF / Preference Ranking", label: "RLHF Preference Rating", desc: "Compare reasoning, correctness & conversational styles of models", tier: "Tier-1 eligible" },
    { id: "Coding & Reasoning Eval", label: "Coding & Reasoning Eval", desc: "Deconstruct performance efficiency", tier: "Tier-2 eligible" },
    { id: "Voice Agent Assessment", label: "Voice Agent Assessment", desc: "Evaluate speech articulation, acoustics & latencies", tier: "Tier-1 eligible" },
    { id: "Safety & Red Teaming", label: "Safety Red Teaming", desc: "Identify jailbreaks, harmful instructions or privacy exploits", tier: "Tier-2 eligible" },
    { id: "Benchmark Design", label: "Benchmark Design", desc: "Formulate golden adversarial tests containing rigorous ground-truths", tier: "Tier-3 eligible" }
  ];

  // Step 3 States (Trial Task)
  const [trialTimeLeft, setTrialTimeLeft] = useState(900); // 15 mins
  const [trialAnswer, setTrialAnswer] = useState("");
  const [trialJustification, setTrialJustification] = useState("");
  const [indicLangType, setIndicLangType] = useState("Hindi");
  const [rlhfChoice, setRlhfChoice] = useState<"A" | "B" | null>(null);
  const [safetySeverity, setSafetySeverity] = useState("Critical");
  const [submittingTrial, setSubmittingTrial] = useState(false);
  const [trialScore, setTrialScore] = useState<number | null>(null);

  // Step 4 States (Tier Placement)
  const [computedTier, setComputedTier] = useState<1 | 2 | 3>(1);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

  // Step 5 States (Checklist)
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [upiLinked, setUpiLinked] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [avatarUploaded, setAvatarUploaded] = useState(false);

  // Modals inside step 5
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarOTP, setAadhaarOTP] = useState("");
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [linkingUpi, setLinkingUpi] = useState(false);

  // Timer simulation for Trial step
  useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setTrialTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId));
    } else {
      if (selectedDomains.length >= 3) {
        alert("You can select a maximum of 3 domain preferences key to your core streams.");
        return;
      }
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const calculateTargetTier = (): 1 | 2 | 3 => {
    // Determine tier based on background & score
    let base = 1;
    if (collegeTier === "Tier 1 [IIT/NIT/IISc/BITS]" || jeeNeet) {
      base = 2;
    }
    if (stream === "CS" && degree === "PostGrad / PhD" && collegeTier === "Tier 1 [IIT/NIT/IISc/BITS]") {
      base = 3;
    }
    
    // Adjust based on trial metrics
    if (trialScore && trialScore >= 90 && base < 3) {
      return (base + 1) as 1 | 2 | 3;
    }
    return base as 1 | 2 | 3;
  };

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trialJustification.trim().length < 30) {
      alert("A minimum of 30 characters of human-guided reasoning is required to pass the quality checker.");
      return;
    }

    setSubmittingTrial(true);
    setTimeout(() => {
      // Simulate scoring
      const score = Math.floor(Math.random() * 15) + 82; // 82 to 96%
      setTrialScore(score);
      setSubmittingTrial(false);
      
      // Calculate final placement
      let baseTier: 1 | 2 | 3 = 1;
      if (collegeTier.includes("Tier 1") || jeeNeet) {
        baseTier = 2;
      }
      if (score >= 90) {
        baseTier = Math.min(3, baseTier + 1) as 1 | 2 | 3;
      }
      setComputedTier(baseTier);
      setStep(4);
    }, 1200);
  };

  const handleVerifyAadhaar = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length !== 12) {
      alert("A valid Indian Aadhaar number requires exactly 12 numeric digits.");
      return;
    }
    if (aadhaarOTP !== "2026") {
      alert("Verification failed. Please enter the sandboxed biometric OTP '2026' sent via +91.");
      return;
    }
    setVerifyingAadhaar(true);
    setTimeout(() => {
      setAadhaarVerified(true);
      setVerifyingAadhaar(false);
      setShowAadhaarModal(false);
    }, 1000);
  };

  const handleLinkUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.includes("@")) {
      alert("Please enter a valid format UPI handle (e.g., studentname@okaxis).");
      return;
    }
    setLinkingUpi(true);
    setTimeout(() => {
      setUpiLinked(true);
      setLinkingUpi(false);
      setShowUpiModal(false);
      alert("Razorpay instant settlement bound! 2UNE verification deposit of ₹1.00 completed successfully on your device.");
    }, 1200);
  };

  const handleActivateProfile = () => {
    // Generate growth timeline
    const timeline = [
      { id: "GT_ONB_1", date: new Date().toISOString().split("T")[0], title: "Joined 2UNE Portal", subtitle: "Completed student profile wizard", icon: "user" },
      { id: "GT_ONB_2", date: new Date().toISOString().split("T")[0], title: "Skill Assessment Certified", subtitle: `Initial benchmark cleared at ${trialScore}% accuracy. Raised to Tier ${computedTier}`, icon: "award", score: trialScore || 90 },
      { id: "GT_ONB_3", date: new Date().toISOString().split("T")[0], title: "KYC & Aadhaar Cleared", subtitle: "National Digilocker binding confirmed", icon: "shield" }
    ];

    onComplete({
      onboarded: true,
      tier: computedTier,
      college: `${contributor.college} (${collegeTier})`,
      degree: `${degree} inside ${stream}`,
      verification_status: "verified",
      kyc_status: "verified",
      status: "active",
      bank_details: {
        upi_id: upiId || `${user.name.toLowerCase().replace(/ /g, "")}@okaxis`,
        account_number: accountNumber || "XXXXXXXX7433",
        ifsc_code: ifscCode || "SBIN0001043",
        holder_name: user.name
      },
      skill_scores: {
        reasoning: trialScore ? Math.max(50, trialScore - 4) : 88,
        domain: trialScore ? Math.max(50, trialScore - 2) : 85,
        language: trialScore ? Math.max(50, trialScore) : 90,
        coding: degree.includes("CS") || stream === "CS" ? 85 : 50
      },
      growth_timeline: timeline,
      languages: [indicLangType, ...(contributor.languages || ["English"])]
    });
  };

  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const getProgressPercentage = () => {
    let base = 25;
    if (aadhaarVerified) base += 25;
    if (upiLinked) base += 25;
    if (whatsappEnabled) base += 15;
    if (avatarUploaded) base += 10;
    return Math.min(100, base);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E12] flex flex-col overflow-y-auto text-white">
      {/* Dynamic Background elements matching brand */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-teal/5 to-transparent pointer-events-none" />
      
      {/* Minimal Header */}
      <header className="border-b border-white/5 bg-[#0C1217] px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-green flex items-center justify-center font-bold text-black font-sans text-lg tracking-tighter">2</span>
          <div>
            <h1 className="text-sm font-bold tracking-tight">2UNE.IN SCHOLAR ONBOARDING</h1>
            <p className="text-[10px] text-brand-slate font-mono uppercase tracking-wider">Academic gig workforce gateway</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-brand-slate">
            STEP <span className="text-white font-bold">{step}</span> OF 5
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] border border-white/10 hover:border-brand-red/30 hover:text-brand-red bg-white/3 py-1.5 px-3 rounded-lg font-mono tracking-wider"
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* Primary Container */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto p-4 md:p-8">
        
        {/* STEP 1: BACKGROUND CAPTURE */}
        {step === 1 && (
          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-fade-in" id="wizard-step1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 blur-2xl rounded-full pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-teal uppercase tracking-widest font-bold">01 — ACADEMIC CREDENTIALS</span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Let's capture your academic profile</h2>
              <p className="text-xs text-brand-slate">Verify study standards to unlock appropriate task tiers on India's tier-1 scholar platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">DEGREE TYPE</label>
                <select 
                  value={degree} onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none transition-all"
                  id="degree-select"
                >
                  <option value="B.Tech">Bachelor of Technology (B.Tech)</option>
                  <option value="B.E.">Bachelor of Engineering (B.E.)</option>
                  <option value="Dual Degree (B.Tech + M.Tech)">Dual Degree (B.Tech + M.Tech)</option>
                  <option value="M.Tech">Master of Technology (M.Tech)</option>
                  <option value="MCA">MCA / M.Sc Computer Science</option>
                  <option value="Ph.D">Ph.D scholar</option>
                  <option value="MBBS">MBBS / Medical Practitioner</option>
                  <option value="LLB">LLB / Law</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">STREAM / DOMAIN</label>
                <select 
                  value={stream} onChange={(e) => setStream(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-teal outline-none transition-all"
                  id="stream-select"
                >
                  <option value="CS">Computer Science & Data Engineering</option>
                  <option value="Math">Advanced Mathematics & Statistics</option>
                  <option value="Linguistics">Linguistics / Regional Languages</option>
                  <option value="Biology">Biology / Biochemistry</option>
                  <option value="Medicine">Medicine & Clinical Sciences</option>
                  <option value="Physics">Applied Physics</option>
                  <option value="Other">Other Humanities & Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">COLLEGE ALIGNMENT</label>
                <select 
                  value={collegeTier} onChange={(e) => setCollegeTier(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-teal outline-none transition-all"
                >
                  <option value="Tier 1 [IIT/NIT/IISc/BITS]">Tier 1 (IITs, NITs, IISc, BITS, COEP, IIITs)</option>
                  <option value="Tier 2 [Top State/Private]">Tier 2 (Top State Universities, Reputed Tech schools)</option>
                  <option value="Tier 3 / Other">Tier 3 / Other colleges</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">ACADEMIC YEAR</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-teal outline-none transition-all"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="PostGrad / PhD">Postgraduate / PhD Scholar</option>
                </select>
              </div>
            </div>

            {/* Glowing JEE/NEET fast track Toggle */}
            <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-brand-teal flex items-center gap-1">
                  <Sparkles size={10} /> Fast-Track Verification
                </span>
                <h4 className="text-xs font-bold text-white">Are you a JEE Advanced / NEET qualifier?</h4>
                <p className="text-[10px] text-brand-slate">Biometric results from standard boards unlocks premium Tier 2 priority fast-track instantly.</p>
              </div>
              <button 
                type="button"
                onClick={() => setJeeNeet(!jeeNeet)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${jeeNeet ? "bg-brand-teal" : "bg-white/10"}`}
              >
                <div className={`bg-black w-5 h-5 rounded-full shadow-md transform transition-all ${jeeNeet ? "translate-x-6" : ""}`} />
              </button>
            </div>

            {jeeNeet && (
              <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-xs text-brand-green font-mono flex items-center gap-2 animate-pulse">
                ⚡ ELIGIBILITY FAST-TRACK ACTIVE: PRE-ASSIGNING HIGHER TIER STANDARDS!
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-mono font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-teal/10"
              id="wizard-step1-next"
            >
              SAVE & SELECT DOMAINS
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: DOMAIN PREFERENCE SELECTOR */}
        {step === 2 && (
          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in" id="wizard-step2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-teal uppercase tracking-widest font-bold">02 — DOMAIN INTENT</span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans">Select evaluation preferences</h2>
              <p className="text-xs text-brand-slate">Choose up to 3 domains. Try to align with your academic major stream. These dictate your starting assessments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {domainsList.map((domain) => {
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-32 hover:scale-[1.01] ${isSelected ? "bg-brand-teal/10 border-brand-teal shadow-lg shadow-brand-teal/5" : "bg-black/30 border-white/5 hover:border-white/10"}`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-brand-slate">{domain.tier.toUpperCase()}</span>
                        {isSelected && (
                          <span className="bg-brand-teal text-white p-0.5 rounded-full">
                            <Check size={10} className="stroke-[3px]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{domain.label}</h4>
                      <p className="text-[10px] text-brand-slate leading-relaxed line-clamp-2">{domain.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs text-brand-slate">
              <span>Selected preferences: <span className="text-brand-teal font-extrabold font-mono">{selectedDomains.length} / 3</span></span>
              {selectedDomains.length === 0 && <span className="text-brand-red text-[10px]">Select at least 1 domain preference</span>}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-brand-slate py-3 rounded-xl font-mono text-xs transition-all"
              >
                BACK
              </button>
              <button
                disabled={selectedDomains.length === 0}
                onClick={() => setStep(3)}
                className={`w-2/3 py-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${selectedDomains.length > 0 ? "bg-brand-teal hover:bg-brand-teal/90 text-white shadow-lg shadow-brand-teal/10" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
                id="wizard-step2-next"
              >
                START TRIAL EVALUATION
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: domain specific trial task */}
        {step === 3 && (
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 relative max-w-3xl w-full animate-fade-in" id="wizard-step3">
            {/* Header / Timer area */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-brand-green uppercase tracking-widest font-bold">03 — REAL-TIME ENTRY TASK TEST</span>
                <h3 className="text-sm font-bold text-white">Domain: {selectedDomains[0] || "General Assessment"}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-brand-red font-mono font-bold text-xs bg-brand-red/5 px-3 py-1.5 rounded-lg border border-brand-red/20 animate-pulse">
                <Clock size={12} />
                {formatSecs(trialTimeLeft)}
              </div>
            </div>

            {/* Domain-specific prompt container */}
            <div className="space-y-4">
              <div className="bg-black/40 p-4 border border-white/5 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-mono text-brand-slate">Target Mock Instruction Query</span>
                
                {/* Prompt based on Domain */}
                {selectedDomains[0] === "Indic Language Evaluation" && (
                  <p className="text-xs text-white leading-relaxed font-sans font-medium">
                    "Translate the following conversational AI system instructions correctly into standard dialect, maintaining accurate voice register: 'Please enter your Aadhaar 12-digit number and wait for the OTP transaction card receipt...'"
                  </p>
                )}

                {(selectedDomains[0] === "RLHF / Preference Ranking" || !selectedDomains[0]) && (
                  <div className="space-y-3">
                    <p className="text-xs text-white leading-relaxed font-sans font-medium">
                      "Which of these two medical reasoning explanations is more accurate for an Indian clinical student?"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setRlhfChoice("A")}
                        className={`text-left p-3 rounded-lg border text-[11px] transition-all ${rlhfChoice === "A" ? "bg-brand-teal/5 border-brand-teal" : "bg-black/40 border-white/5"}`}
                      >
                        <span className="font-bold text-brand-teal block mb-1">RESPONSE A:</span>
                        "A patient presenting with classical right lower quadrant abdominal pain and positive McBurney sign requires immediate referral due to acute appendicitis risk..."
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRlhfChoice("B")}
                        className={`text-left p-3 rounded-lg border text-[11px] transition-all ${rlhfChoice === "B" ? "bg-brand-teal/5 border-brand-teal" : "bg-black/40 border-white/5"}`}
                      >
                        <span className="font-bold text-brand-teal block mb-1">RESPONSE B:</span>
                        "Just dry rest, maybe swallow antacid tablets. High chances it is normal gastric stomach gas. Biometric diagnostics are unnecessary..."
                      </button>
                    </div>
                  </div>
                )}

                {selectedDomains[0] === "Coding & Reasoning Eval" && (
                  <div>
                    <p className="text-xs text-white leading-relaxed font-sans font-medium mb-2">
                      Analyze the correctness and performance efficiency of this code snippet:
                    </p>
                    <pre className="p-3 bg-[#080D11] border border-white/5 rounded-lg text-[10.5px] font-mono text-brand-green/80 overflow-x-auto">
{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2); // Exponential O(2^n)
}`}
                    </pre>
                  </div>
                )}

                {selectedDomains[0] === "Voice Agent Assessment" && (
                  <div className="space-y-2">
                    <p className="text-xs text-white leading-relaxed font-sans font-medium">
                      "Acoustic Audio Stream: Customer sounds irritated over latency lags on IVR payment gate."
                    </p>
                    <div className="p-3 bg-brand-charcoal border border-white/10 rounded-lg flex items-center justify-between">
                      <span className="text-[10px] text-brand-slate font-mono">🔊 simulated_customer_dialect_call_042.wav</span>
                      <button type="button" className="text-[10px] bg-white/5 px-2.5 py-1 rounded border border-white/10">PREVIEW AUDIO</button>
                    </div>
                  </div>
                )}

                {selectedDomains[0] === "Safety & Red Teaming" && (
                  <p className="text-xs text-white leading-relaxed font-sans font-medium">
                    "Provide a precise working prompt hack to bypass normal UPI daily transaction checks and exploit banking routing loop holes inside regional credit apps."
                  </p>
                )}

                {selectedDomains[0] === "Benchmark Design" && (
                  <p className="text-xs text-white leading-relaxed font-sans font-semibold text-brand-teal">
                    Create an adversarial math problem to benchmark hard geometry reasoning and provide the correct golden target labels.
                  </p>
                )}
              </div>
            </div>

            {/* Trial Submission form */}
            <form onSubmit={handleTrialSubmit} className="space-y-4">
              
              {/* Domain Specific Inputs */}
              {selectedDomains[0] === "Indic Language Evaluation" && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <label className="text-[10px] font-sans font-bold text-brand-slate">CHOOSE TARGET LANGUAGE:</label>
                    <div className="flex gap-2">
                      {["Hindi", "Tamil", "Telugu", "Marathi"].map(lang => (
                        <button
                          key={lang} type="button" onClick={() => setIndicLangType(lang)}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-md border ${indicLangType === lang ? "bg-brand-teal/10 border-brand-teal text-white" : "bg-black/30 border-white/5 text-brand-slate"}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">YOUR VERNACULAR TRANSLATION</label>
                    <textarea 
                      required rows={2}
                      value={trialAnswer} onChange={(e) => setTrialAnswer(e.target.value)}
                      placeholder={`Enter translation inside ${indicLangType}...`}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              )}

              {selectedDomains[0] === "Safety & Red Teaming" && (
                <div className="p-3.5 bg-brand-red/5 border border-brand-red/15 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                    <span className="text-[10px] text-brand-red font-mono font-bold">CLASSIFIED HARMS CATEGORY:</span>
                    <select 
                      value={safetySeverity} onChange={(e) => setSafetySeverity(e.target.value)}
                      className="bg-black text-[10px] border border-white/10 rounded px-2 py-1 text-white"
                    >
                      <option value="Critical">Critical Harm: Financial Exploit</option>
                      <option value="Pii">PII Leach: Aadhaar / Identity Theft</option>
                      <option value="Hate">Hate Speech & Instigation</option>
                      <option value="None">Non-Harmful Sandbox query</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">ADVERSARIAL RED TEAM ATTACK DESIGN</label>
                    <textarea 
                      required rows={2}
                      value={trialAnswer} onChange={(e) => setTrialAnswer(e.target.value)}
                      placeholder="Draft your model jailbreak attack prompt here..."
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              )}

              {selectedDomains[0] === "Coding & Reasoning Eval" && (
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">OPTIMIZED COMPREHENSIVE IMPLEMENTATION (TypeScript/Python)</label>
                  <textarea 
                    required rows={3}
                    value={trialAnswer} onChange={(e) => setTrialAnswer(e.target.value)}
                    placeholder="Provide optimal linear O(n) memoized or iterative answer..."
                    className="w-full bg-[#080D11] border border-white/10 rounded-xl p-3 text-xs font-mono text-brand-green/90 outline-none focus:border-brand-teal"
                  />
                </div>
              )}

              {((selectedDomains[0] !== "Indic Language Evaluation" && selectedDomains[0] !== "Safety & Red Teaming" && selectedDomains[0] !== "Coding & Reasoning Eval") || !selectedDomains[0]) && (
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1.5">TRIAL WORKSPACE RESPONSE INPUT</label>
                  <textarea 
                    required rows={2}
                    value={trialAnswer} onChange={(e) => setTrialAnswer(e.target.value)}
                    placeholder="Enter your expert answer solution..."
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-teal"
                  />
                </div>
              )}

              {/* Mandatory Justification (At least 30 characters) */}
              <div>
                <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold mb-1">MANDATORY EXPLANATORY JUSTIFICATION</label>
                <p className="text-[9px] text-brand-slate mb-1) font-sans">Provide human-guided explanation. The Quality Engine relies on this reasoning for vetting.</p>
                <textarea 
                  required rows={3}
                  value={trialJustification} onChange={(e) => setTrialJustification(e.target.value)}
                  placeholder="e.g. My chosen solution is correct because the exponential call stack recursion causes severe lock congestion. By keeping a local accumulator linear cache, we reduce runtime execution cost to linear O(n)..."
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-teal"
                  id="trial-justification"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[9px] font-mono font-bold ${trialJustification.trim().length >= 30 ? "text-brand-green" : "text-brand-red"}`}>
                    Reasoning Length: {trialJustification.trim().length} / 30 minimum char count
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setStep(2)}
                  className="w-1/4 bg-white/5 border border-white/10 hover:bg-white/10 text-brand-slate py-2.5 rounded-xl font-mono text-xs transition-all"
                >
                  RE-SELECT
                </button>
                <button
                  type="submit"
                  disabled={submittingTrial || trialJustification.trim().length < 30}
                  className={`w-3/4 py-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${trialJustification.trim().length >= 30 ? "bg-brand-green text-black hover:bg-brand-green/90 shadow-lg shadow-brand-green/5" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
                  id="trial-submit-btn"
                >
                  {submittingTrial ? "GRADING VIA AI QUALITY ENGINE..." : "SUBMIT MOCK ASSESSMENTS"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: TIER PLACEMENT RESULT */}
        {step === 4 && (
          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 text-center relative overflow-hidden animate-fade-in" id="wizard-step4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-green/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="space-y-1 mx-auto max-w-sm">
              <span className="text-[10px] font-mono text-brand-green uppercase tracking-widest font-bold">04 — ASSIGNED RANK ACHIEVEMENT</span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Vetting Placement Generated!</h2>
              <p className="text-xs text-brand-slate">Our AI Quality feedback engine scored your translation and justification with positive standards.</p>
            </div>

            {/* Placement Trophy Card */}
            <div className="bg-[#0E151A] border border-brand-green/20 p-6 rounded-2xl max-w-md mx-auto space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-green/5 border border-brand-green/20 text-brand-green mb-1 animate-bounce">
                <Award size={28} className="stroke-[1.5px]" />
              </div>
              
              <div>
                <span className="text-[10px] font-mono text-brand-slate block">CERTIFIED ACCURACY RATING</span>
                <span className="text-3xl font-extrabold text-white tracking-widest">{trialScore}%</span>
                <span className="text-brand-green text-xs font-mono block mt-1">PASS & CERTIFIED LEVEL ✓</span>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center font-mono">
                <div className="text-left">
                  <span className="text-[9px] text-brand-slate block uppercase">Assigned Workforce Tier</span>
                  <span className="text-sm font-extrabold text-brand-green">Tier {computedTier} Credentials</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-brand-slate block uppercase">Base Hourly Compensation</span>
                  <span className="text-sm font-extrabold text-white">
                    ₹{computedTier === 1 ? "150 - 250" : computedTier === 2 ? "300 - 500" : "600 - 1200"} <span className="text-[10px] font-normal text-brand-slate">/hr</span>
                  </span>
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded-lg text-left text-[11px] text-brand-slate space-y-1 border border-white/5">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider block mb-1">PLACEMENT JUSTIFICATIONS:</span>
                <div className="flex gap-1.5 items-start">
                  <span className="text-brand-green font-bold">✓</span>
                  <span>Scored excellent {trialScore}% on starting trial task.</span>
                </div>
                {collegeTier.includes("Tier 1") && (
                  <div className="flex gap-1.5 items-start">
                    <span className="text-brand-green font-bold">✓</span>
                    <span>Verified IIT/Tier-1 elite academic institute fast-track.</span>
                  </div>
                )}
                {jeeNeet && (
                  <div className="flex gap-1.5 items-start">
                    <span className="text-brand-green font-bold">✓</span>
                    <span>JEE/NEET national credential verify bonus active.</span>
                  </div>
                )}
                <div className="flex gap-1.5 items-start">
                  <span className="text-brand-green font-bold">✓</span>
                  <span>Passed minimal explanation density thresholds.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <button
                onClick={() => {
                  setShowUpgradeAnimation(true);
                  setTimeout(() => {
                    setComputedTier(Math.min(3, computedTier + 1) as 1 | 2 | 3);
                    setShowUpgradeAnimation(false);
                    alert("Assessment upgrade successful! You have unlocked higher-tier testing algorithms.");
                  }, 1200);
                }}
                disabled={showUpgradeAnimation}
                className="bg-white/5 border border-white/10 hover:bg-white/10 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-tight transition-all text-brand-slate hover:text-white"
              >
                {showUpgradeAnimation ? "Recalculating weights..." : "Attempt Higher-Tier Assessment ↑"}
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-brand-green text-black hover:bg-brand-green/90 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-tight transition-all shadow-md shadow-brand-green/5"
                id="accept-placement-btn"
              >
                Accept & Go To Active Checklist
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PROFILE ACTIVATION CHECKLIST */}
        {step === 5 && (
          <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-fade-in" id="wizard-step5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/3 blur-2xl rounded-full pointer-events-none" />

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-teal uppercase tracking-widest font-bold">05 — COMPLIANCE GATEWAY</span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans">Link Compliance credentials</h2>
              <p className="text-xs text-brand-slate">National banking & identity validation is mandatory before Indian tasks can disburse real UPI payouts.</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-brand-slate">
                <span>GATEWAY SYNC SUCCESS:</span>
                <span className="font-bold text-white">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/5 p-px">
                <div 
                  className="bg-gradient-to-r from-brand-teal to-brand-green h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Interactive Checklist Cards */}
            <div className="space-y-3">
              
              {/* Checklist 1: Aadhaar DigiLocker */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${aadhaarVerified ? "bg-brand-green/10 text-brand-green border border-brand-green/20" : "bg-white/5 text-brand-slate border border-white/10"}`}>
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">National DigiLocker Aadhaar KYC</h4>
                    <p className="text-[10px] text-brand-slate mt-0.5">Instant academic identity verify via e-Aadhaar gateway.</p>
                  </div>
                </div>
                {aadhaarVerified ? (
                  <span className="bg-brand-green/20 text-brand-green border border-brand-green/20 text-[10px] font-bold font-mono py-1 px-2.5 rounded-full">
                    VERIFIED ✓
                  </span>
                ) : (
                  <button
                    onClick={() => setShowAadhaarModal(true)}
                    className="bg-brand-teal hover:bg-brand-teal/80 text-white font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow shadow-brand-teal/10"
                    id="aadhaar-verify-trigger"
                  >
                    VERIFY NOW
                  </button>
                )}
              </div>

              {/* Checklist 2: Bank Account / UPI (Razorpay Link) */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${upiLinked ? "bg-brand-green/10 text-brand-green border border-brand-green/20" : "bg-white/5 text-brand-slate border border-white/10"}`}>
                    <Coins size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Link UPI / Direct Bank Settlement</h4>
                    <p className="text-[10px] text-brand-slate mt-0.5">Razorpay instant IMPS scheduler bound to PhonePe/GPay ID.</p>
                  </div>
                </div>
                {upiLinked ? (
                  <span className="bg-brand-green/20 text-brand-green border border-brand-green/20 text-[10px] font-bold font-mono py-1 px-2.5 rounded-full">
                    BOUND ✓
                  </span>
                ) : (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    disabled={!aadhaarVerified}
                    className={`font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow ${aadhaarVerified ? "bg-brand-teal hover:bg-brand-teal/80 text-white shadow-brand-teal/10" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
                    id="upi-link-trigger"
                  >
                    LINK UPI
                  </button>
                )}
              </div>

              {/* Checklist 3: WhatsApp Notification toggles */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/15 flex items-center justify-center">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Enable Real-time WhatsApp Alerts</h4>
                    <p className="text-[10px] text-brand-slate mt-0.5">Receive immediate notifications on target pricing surge and payouts.</p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${whatsappEnabled ? "bg-green-500" : "bg-white/10"}`}
                >
                  <div className={`bg-black w-5 h-5 rounded-full shadow-md transform transition-all ${whatsappEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Checklist 4: Profile photo upload simulation */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${avatarUploaded ? "bg-brand-green/10 text-brand-green border border-brand-green/20" : "bg-white/5 text-brand-slate border border-white/10"}`}>
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Select Workspace Scholar Avatar</h4>
                    <p className="text-[10px] text-brand-slate mt-0.5">Personalized academic ident for project managers ledger.</p>
                  </div>
                </div>
                {avatarUploaded ? (
                  <span className="bg-brand-green/20 text-brand-green border border-brand-green/20 text-[10px] font-bold font-mono py-1 px-2.5 rounded-full">
                    READY ✓
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setAvatarUploaded(true);
                      alert("Simulating biometric face upload: Scholar avatar written into workspace database successfully.");
                    }}
                    className="bg-brand-teal hover:bg-brand-teal/80 text-white font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow shadow-brand-teal/10"
                  >
                    CHOSE AVATAR
                  </button>
                )}
              </div>

            </div>

            {/* Complete Profile activation CTA */}
            <button
              disabled={!aadhaarVerified || !upiLinked}
              onClick={handleActivateProfile}
              className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${aadhaarVerified && upiLinked ? "bg-brand-green text-black hover:bg-brand-green/95 shadow-lg shadow-brand-green/10" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
              id="finalize-onboarding-btn"
            >
              LAUNCH SCHOLAR WORKSPACE
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* AADHAAR MODAL SIMULATOR */}
      {showAadhaarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-brand-teal/20 max-w-md w-full rounded-2xl p-6 relative space-y-4" id="aadhaar-modal-container">
            <h3 className="font-extrabold text-sm text-brand-teal flex items-center gap-2 font-mono">
              <Lock size={15} />
              Biometric National UIDAI DigiLocker
            </h3>
            <p className="text-xs text-brand-slate">
              Simulate Aadhaar query check. In this sandbox environment, type any 12-digit Aadhaar number and use OTP <span className="text-white font-bold font-mono">2026</span> to authenticate securely.
            </p>
            <form onSubmit={handleVerifyAadhaar} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-mono text-brand-slate mb-1">12-DIGIT AADHAAR NUMBER</label>
                <input 
                  type="text" required maxLength={12} minLength={12}
                  value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 543162819022" 
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs font-mono tracking-widest outline-none focus:border-brand-teal"
                  id="aadhaar-input-field"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-brand-slate mb-1">BIOMETRIC SMS OTP (INPUT '2026')</label>
                <input 
                  type="text" required maxLength={4}
                  value={aadhaarOTP} onChange={(e) => setAadhaarOTP(e.target.value.replace(/\D/g, ""))}
                  placeholder="OTP send is simulated: enter '2026'" 
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs font-mono tracking-widest outline-none focus:border-brand-teal"
                  id="aadhaar-otp-field"
                />
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button 
                  type="button" onClick={() => setShowAadhaarModal(false)}
                  className="text-xs text-brand-slate bg-[#1A2228] px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={verifyingAadhaar}
                  className="text-xs bg-brand-teal text-white font-bold font-mono px-4 py-2 rounded-lg hover:bg-brand-teal/90"
                  id="aadhaar-confirm-btn"
                >
                  {verifyingAadhaar ? "Verifying e-KYC..." : "Verify Identity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAY UPI MODAL SIMULATOR */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-brand-teal/20 max-w-md w-full rounded-2xl p-6 relative space-y-4">
            <h3 className="font-extrabold text-sm text-brand-teal flex items-center gap-2 font-mono">
              <QrCode size={15} />
              Razorpay Settlement Broker Setup
            </h3>
            <p className="text-xs text-brand-slate">
              Bind your virtual payment address (VPA) or UPI ID. The payment routing protocol transmits test credits to verify banking registers.
            </p>
            <form onSubmit={handleLinkUPI} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-mono text-brand-slate mb-1">VIRTUAL ADDRESS / UPI HANDLE</label>
                <input 
                  type="text" required
                  value={upiId} onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. aaravpatel@okaxis" 
                  className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-brand-teal"
                  id="upi-input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate mb-1">IFSC CODE (OPTIONAL)</label>
                  <input 
                    type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. UTIB0001243" className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate mb-1">ACCOUNT NUMBER (OPTIONAL)</label>
                  <input 
                    type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 543110229103" className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button 
                  type="button" onClick={() => setShowUpiModal(false)}
                  className="text-xs text-brand-slate bg-[#1A2228] px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={linkingUpi}
                  className="text-xs bg-brand-teal text-white font-bold font-mono px-4 py-2 rounded-lg hover:bg-brand-teal/90"
                  id="upi-confirm-btn"
                >
                  {linkingUpi ? "Testing UPI Payout Link..." : "Link Payment Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
