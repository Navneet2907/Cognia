import React, { useState } from "react";
import { 
  Building2, 
  ChevronRight, 
  Users, 
  Clock, 
  Sparkles, 
  DollarSign, 
  PhoneCall, 
  ArrowRight, 
  MessageSquare, 
  Layers, 
  Check, 
  Cpu,
  CheckCircle
} from "lucide-react";
import { Project } from "../types";

interface ServicesIntakeFlowProps {
  onCancel: () => void;
  onSubmit: (newProject: Partial<Project>) => void;
}

export default function ServicesIntakeFlow({
  onCancel,
  onSubmit
}: ServicesIntakeFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Project Type selection
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const projectTypes = [
    { id: "Indic Lang RLHF", label: "Indic Language RLHF", desc: "Localize, translate, and align model outputs across 22+ regional Indian dialects." },
    { id: "Model Eval & Benchmarking", label: "Model Evaluation & Benchmarking", desc: "Rigorous adversarial validation of reasoning, mathematics, and complex domain accuracy." },
    { id: "Voice Agent Quality", label: "Voice Agent Quality Assessment", desc: "Acoustic evaluation of pronunciation, accent registers, and turn-taking response latency." },
    { id: "Safety Red Teaming", label: "Safety & Red Teaming", desc: "Jailbreak testing against UPI exploits, Aadhar leaks, financial frauds, and bias injection." },
    { id: "Custom Not Sure", label: "Custom / Not Sure", desc: "Let our executive lead design a bespoke evaluation rubric tailored specifically to your pipeline." }
  ];

  // Step 2: Scope & Inputs
  const [volume, setVolume] = useState<number>(5000);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["Hindi"]);
  const [turnaround, setTurnaround] = useState<"standard" | "express" | "ongoing">("standard");
  const [pilotFirst, setPilotFirst] = useState<boolean>(true);

  const popularLanguages = ["Hindi", "Tamil", "Telugu", "Marathi", "Bengali", "Kannada", "Gujarati", "Malayalam"];

  const handleToggleLang = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter(l => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  // Helper calculation for Step 3 (Instant Quote)
  const calculateQuoteAmount = () => {
    let baseRatePerTask = 12; // INR
    if (selectedType === "Coding Eval" || selectedType === "Safety Red Teaming") {
      baseRatePerTask = 18;
    }
    
    let rate = baseRatePerTask;
    if (turnaround === "express") rate *= 1.35; // 35% express speed markup
    if (pilotFirst) rate *= 1.1; // 10% pilot premium

    const totalCost = volume * rate;
    return Math.floor(totalCost);
  };

  const getEstimatedTimeline = () => {
    let days = Math.ceil(volume / 1000);
    if (turnaround === "express") days = Math.ceil(days * 0.4);
    return Math.max(2, days);
  };

  const handleStep3Confirm = () => {
    // Complete and create project blueprint
    const amt = calculateQuoteAmount();
    const days = getEstimatedTimeline();
    
    // Save to DB via callbacks
    const protoProj: any = {
      id: "PROJ_" + Math.floor(Math.random() * 900 + 100),
      org_id: "ORG_AUTO",
      name: selectedType === "Custom Not Sure" ? "Bespoke Enterprise AI Validation" : `${selectedType} - Vernacular Dialects V1`,
      use_case: (selectedType || "Indic Language RLHF") as any,
      status: "active",
      task_types: ["RLHF"],
      languages: ["Hindi", "Telugu"],
      volume_completed: 0,
      volume_total: pilotFirst ? 200 : volume,
      quality_threshold: 90,
      sla_params: {
        turnaround_hours: 48,
        guaranteed_accuracy: 90
      },
      milestones: [],
      rubric_id: "RUB_DEFAULT",
      data_sensitivity: "Public",
      created_at: new Date().toISOString(),
      description: "Automated intake request submitted by client onboarding wizard."
    };

    onSubmit(protoProj);
    setStep(4);
  };

  return (
    <div className="bg-brand-charcoal border border-brand-green/30 rounded-2xl p-6 relative overflow-hidden animate-fade-in" id="services-intake-container">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/3 blur-3xl rounded-full pointer-events-none" />
      
      {/* Top Breadcrumb Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
        <h3 className="font-extrabold text-sm text-brand-green flex items-center gap-2">
          <Building2 size={16} />
          Scoped Client Services Intake Portal
        </h3>
        <div className="flex items-center gap-1 font-mono text-[9px] text-brand-slate uppercase bg-white/5 px-2 py-1 rounded">
          <span>INTAKE STEP {step} OF 4</span>
        </div>
      </div>

      {/* STEP 1: PROJECT TYPE SELECTOR */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Select AI Model Evaluation Category</h4>
            <p className="text-xs text-brand-slate">Choose your target evaluation vector. These map directly to certified scholar pools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectTypes.slice(0, 4).map((type) => {
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id} type="button" onClick={() => setSelectedType(type.id)}
                  className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] flex flex-col justify-between h-32 ${active ? "bg-brand-green/5 border-brand-green ring-1 ring-brand-green" : "bg-black/40 border-white/5 hover:border-white/10"}`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-white font-sans">{type.label}</h5>
                    <p className="text-[10px] text-brand-slate mt-1.5 leading-relaxed">{type.desc}</p>
                  </div>
                  {active && <span className="text-[9px] text-brand-green font-mono uppercase tracking-wider font-bold">SELECTED CLUSTER</span>}
                </button>
              );
            })}
          </div>

          {/* Custom Not Sure Card */}
          <button
            type="button" onClick={() => setSelectedType("Custom Not Sure")}
            className={`w-full text-left p-4 rounded-xl border transition-all mt-3 flex items-center justify-between ${selectedType === "Custom Not Sure" ? "bg-brand-green/5 border-brand-green" : "bg-black/40 border-white/5 hover:border-white/10"}`}
          >
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles size={13} className="text-brand-green" />
                Custom Evaluation / Not Sure
              </h5>
              <p className="text-[10.5px] text-brand-slate">Initiate Calendly matching to schedule a custom platform architecture briefing.</p>
            </div>
            <span className="text-[10px] font-mono text-brand-slate border border-white/10 px-2 py-0.5 rounded">BESPOKE</span>
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button 
              type="button" onClick={onCancel}
              className="text-xs bg-white/5 text-brand-slate px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button" disabled={!selectedType}
              onClick={() => {
                if (selectedType === "Custom Not Sure") {
                  setStep(3); // Route to scheduling quote preview directly
                } else {
                  setStep(2);
                }
              }}
              className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-all ${selectedType ? "bg-brand-green text-black hover:bg-brand-green/90" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
              id="intake-step1-next"
            >
              Configure Scope
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCOPE & INPUTS */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Scale and Timings Parameterization</h4>
            <p className="text-xs text-brand-slate">Drag workload density slider and configure target regional dialect channels.</p>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2 p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-brand-slate">TARGET TASK VOLUME:</span>
              <span className="text-brand-green font-bold text-sm tracking-wider">{volume.toLocaleString()} Evaluations</span>
            </div>
            <input 
              type="range" min={500} max={50000} step={500}
              value={volume} onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-brand-green bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-brand-slate">
              <span>500 (Minimum benchmark)</span>
              <span>50,000 (Full-scale production)</span>
            </div>
          </div>

          {/* Languages Multi-select chips */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold">Regional Target Vernaculars</label>
            <div className="flex flex-wrap gap-2">
              {popularLanguages.map(lang => {
                const picked = selectedLangs.includes(lang);
                return (
                  <button
                    key={lang} type="button" onClick={() => handleToggleLang(lang)}
                    className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all ${picked ? "bg-brand-green/10 border-brand-green text-white font-bold" : "bg-black/40 border-white/5 text-brand-slate"}`}
                  >
                    {lang} {picked ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed & Pilot Toggle Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider font-bold">Dispatch Priority SLA</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "standard", label: "Standard", desc: "5-7 business days" },
                  { id: "express", label: "Express", desc: "48-hr SLA (+35%)" },
                  { id: "ongoing", label: "Monthly", desc: "Continuous pipe" }
                ].map(op => (
                  <button
                    key={op.id} type="button" onClick={() => setTurnaround(op.id as any)}
                    className={`text-center p-2 rounded-lg border flex flex-col justify-center ${turnaround === op.id ? "border-brand-green bg-brand-green/3 text-brand-green font-bold" : "border-white/5 bg-black/20 text-brand-slate"}`}
                  >
                    <span className="text-[10px] block">{op.label}</span>
                    <span className="text-[8px] text-brand-slate mt-0.5">{op.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-brand-green tracking-wide">Enterprise Safeguard</span>
                <h5 className="text-xs font-bold text-white">Initiate with 200 task Pilot first?</h5>
                <p className="text-[9px] text-brand-slate">Fast-tracks alignment of scoring rubrics before triggering bulk pipelines.</p>
              </div>
              <button 
                type="button"
                onClick={() => setPilotFirst(!pilotFirst)}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${pilotFirst ? "bg-brand-green" : "bg-white/10"}`}
              >
                <div className={`bg-black w-5 h-5 rounded-full shadow-md transform transition-all ${pilotFirst ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5 justify-end">
            <button 
              type="button" onClick={() => setStep(1)}
              className="text-xs bg-white/5 text-brand-slate px-4 py-2 rounded-lg"
            >
              Back
            </button>
            <button
              type="button" disabled={selectedLangs.length === 0}
              onClick={() => setStep(3)}
              className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-all ${selectedLangs.length > 0 ? "bg-brand-green text-black hover:bg-brand-green/90" : "bg-white/5 text-brand-slate cursor-not-allowed"}`}
              id="intake-step2-next"
            >
              View Quotation Preview
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INSTANT QUOTE PREVIEW */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Compliance Cost Scope Estimate</h4>
            <p className="text-xs text-brand-slate">Review algorithmic pricing models, SLA speed tags, and expert credential tiers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Quote details */}
            <div className="md:col-span-2 bg-[#0E1519] border border-brand-green/20 p-5 rounded-xl space-y-4">
              <span className="text-[9px] font-mono text-brand-green uppercase tracking-wider block font-bold">PLATFORM COMMERCIAL SPECIFICATION</span>
              
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 font-mono">
                <div>
                  <span className="text-[9px] text-brand-slate block uppercase">Estimated Investment</span>
                  <span className="text-lg font-bold text-white">₹{calculateQuoteAmount().toLocaleString()} <span className="text-[10px] font-normal text-brand-slate">INR</span></span>
                </div>
                <div>
                  <span className="text-[9px] text-brand-slate block uppercase">Delivery Timelines SLA</span>
                  <span className="text-lg font-bold text-white">{getEstimatedTimeline()} business days</span>
                </div>
              </div>

              {/* Quality Guarantee parameters */}
              <div className="space-y-3">
                <span className="text-[9px] text-brand-slate font-bold uppercase tracking-wider block">UNCOMPROMISING DATA SLA STANDARDS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-brand-slate">
                  <div className="flex gap-2 items-center">
                    <span className="text-brand-green">✓</span>
                    <span>Fleiss Kappa IAA Target: <strong className="text-white">&gt;0.85</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-brand-green">✓</span>
                    <span>Assigned Workforce: <strong className="text-white">Senior T2 Evaluators</strong></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-brand-green">✓</span>
                    <span>Double Blind Peer Verification</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-brand-green">✓</span>
                    <span>Auto-Audited QA sampling loop</span>
                  </div>
                </div>
              </div>

              {pilotFirst && (
                <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-lg text-[10.5px] text-brand-green font-mono">
                  💡 PILOT ENABLED: Commencing with a 200 task safety evaluation (₹25,000 standard retainer) to calibrate scholar agreement indices.
                </div>
              )}
            </div>

            {/* Quick Calendly Link Box */}
            <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-brand-slate block">STRATEGY BREIFING</span>
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu size={12} className="text-brand-teal" />
                  Bespoke Rubrics Consultation Included
                </h5>
                <p className="text-[10px] text-brand-slate leading-relaxed">Let our platform architect translate your company evaluation guidelines into concrete scoring instructions.</p>
              </div>
              <button
                type="button"
                onClick={() => alert("Simulating Calendly widget launch: Scheduled direct sync session with Arjun Mehta (2UNE Platform Architect) for tomorrow 11:30 AM IST.")}
                className="w-full bg-[#1A252E] hover:bg-[#25333F] border border-white/10 py-2 rounded-lg text-[10px] font-mono transition-all text-white flex items-center justify-center gap-2 mt-4"
              >
                <MessageSquare size={12} />
                BOOK WORKSHOP SYNC
              </button>
            </div>

          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5 justify-end">
            <button 
              type="button" onClick={() => setStep(selectedType === "Custom Not Sure" ? 1 : 2)}
              className="text-xs bg-white/5 text-brand-slate px-4 py-2 rounded-lg"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleStep3Confirm}
              className="text-xs bg-brand-green text-black font-extrabold font-mono px-5 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-brand-green/5"
              id="intake-confirm-btn"
            >
              Confirm and Start Blueprint
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ASSIGNMENT & SUCCESS */}
      {step === 4 && (
        <div className="space-y-6 text-center py-6 animate-fade-in" id="services-intake-success">
          <div className="inline-flex w-12 h-12 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 items-center justify-center mb-1">
            <CheckCircle size={24} className="stroke-[1.5px]" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-extrabold text-white">Project Blueprint Submitted Successfully!</h4>
            <p className="text-xs text-brand-slate">National accounts leads have locked in your commercial allocations. Rubric definitions are starting immediately.</p>
          </div>

          {/* Assigned Account Lead Account Card */}
          <div className="bg-[#0E1519] border border-white/10 p-5 rounded-2xl max-w-sm mx-auto flex items-center gap-4 text-left">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" 
              alt="Arjun"
              className="w-12 h-12 rounded-full border border-white/20 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-brand-green uppercase tracking-widest block font-bold">Assigned Account Lead</span>
              <h5 className="text-xs font-bold text-white font-sans">Arjun Mehta</h5>
              <p className="text-[10px] text-brand-slate font-mono">Operations Principal & Director of Workforce Systems</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert("Simulating secure LinkedIn redirect: Messaging Arjun Mehta's executive liaison...")}
                  className="bg-white/5 border border-white/10 p-1.5 rounded hover:bg-white/10 font-mono text-[9px]"
                >
                  LINKEDIN
                </button>
                <button
                  type="button"
                  onClick={() => alert("Simulating instant WhatsApp sandbox thread initialization: '+91 91120 422026' matches Arjun...")}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 p-1.5 rounded hover:bg-green-500/20 font-mono text-[9px]"
                >
                  WHATSAPP
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl text-[10.5px] text-brand-slate font-mono max-w-md mx-auto border border-white/5 leading-relaxed">
            📢 GUARANTEE: Arjun Mehta will contact your executive representative within <strong className="text-white">4 business hours</strong> to finalize the annotation guidelines.
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-center gap-3">
            <button
              onClick={onCancel}
              className="bg-brand-green text-black font-extrabold font-mono text-xs py-2.5 px-6 rounded-lg hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/5"
              id="intake-close-btn"
            >
              Track Blueprint Progress
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
