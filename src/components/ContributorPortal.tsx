import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  Layers, 
  TrendingUp, 
  Play, 
  HelpCircle, 
  Activity, 
  GraduationCap, 
  Compass, 
  Sliders, 
  CheckCircle, 
  FileEdit, 
  Award, 
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Code2,
  Bookmark,
  Filter,
  Clock,
  Bug,
  Info,
  Search,
  Share2,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Loader2
} from "lucide-react";
import { User, Contributor, Task, TaskBatch, Certification, TaskResponse, Payment, Project } from "../types";
import OnboardingWizard from "./OnboardingWizard";

interface ContributorPortalProps {
  user: User;
  contributor: Contributor;
  tasks: Task[];
  batches: TaskBatch[];
  certifications: Certification[];
  onCompleteTask: (taskId: string, response: TaskResponse, payout: number) => void;
  onLogout: () => void;
  onUpdateEarnings: (newBalance: number, amountAdded: number) => void;
  allContributors: Contributor[];
  allUsers: User[];
  onUpdateContributor: (updated: Contributor) => void;
  onUpdateDB: (fieldsToUpdate: Partial<{
    users: User[];
    contributors: Contributor[];
    projects: Project[];
    batches: TaskBatch[];
    tasks: Task[];
    payments: Payment[];
  }>) => void;
}

export default function ContributorPortal({
  user,
  contributor,
  tasks,
  batches,
  certifications,
  onCompleteTask,
  onLogout,
  onUpdateEarnings,
  allContributors,
  allUsers,
  onUpdateContributor,
  onUpdateDB
}: ContributorPortalProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "earnings" | "profile" | "certifications" | "leaderboard">("tasks");
  const [activeExecTaskId, setActiveExecTaskId] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<"tasks" | "earnings">("tasks");
  
  // Custom Filters
  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const [languageFilter, setLanguageFilter] = useState<string>("ALL");
  const [payoutFilter, setPayoutFilter] = useState<string>("ALL");
  const [bookmarkedTaskIds, setBookmarkedTaskIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Technical issue states
  const [showBugModal, setShowBugModal] = useState<boolean>(false);
  const [bugText, setBugText] = useState<string>("");
  const [bugCategory, setBugCategory] = useState<string>("Slow response / laggy preview container");

  // Live ticker ticker list
  const [recentPayoutsTicker, setRecentPayoutsTicker] = useState<string[]>([
    "Task T_108 successfully reviewed — ₹45 credited just now!",
    "Batch Marathi Dialect_A calibrated at 94% agreement SLA.",
    "Student Sneha S. (Delhi) achieved Level-3 Sanskrit certificate."
  ]);

  // Timer simulation state
  const [timerSeconds, setTimerSeconds] = useState(1200);

  // Task execution fields state
  const [prefChoice, setPrefChoice] = useState<"A" | "B" | null>(null);
  const [accRating, setAccRating] = useState(4);
  const [helpRating, setHelpRating] = useState(4);
  const [safRating, setSafRating] = useState(5);
  const [toneRating, setToneRating] = useState(4);
  const [flRating, setFlRating] = useState(4);
  const [gramRating, setGramRating] = useState(4);
  const [cultRating, setCultRating] = useState(4);
  const [codeEfficiency, setCodeEfficiency] = useState(4);
  const [codeStyle, setCodeStyle] = useState(4);
  const [justificationText, setJustificationText] = useState("");
  const [reformulation, setReformulation] = useState("");
  const [isHarmful, setIsHarmful] = useState(false);
  const [harmCat, setHarmCat] = useState("None");

  // Audio mock player state
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Filter tasks matching contributor tier
  const matchedTasks = tasks.filter(t => {
    // If completed or assigned to someone else, do not show in open feed
    if (t.status !== "unassigned") return false;
    
    // Find batch to verify tier matched
    const batch = batches.find(b => b.id === t.batch_id);
    if (!batch) return false;
    
    // Check filter type
    if (taskFilter !== "ALL" && t.task_type !== taskFilter) return false;

    // Check language filter
    if (languageFilter !== "ALL") {
      const matchesLang = (batch.name && batch.name.toUpperCase().includes(languageFilter.toUpperCase())) ||
                          (t.content.prompt && t.content.prompt.toUpperCase().includes(languageFilter.toUpperCase()));
      if (!matchesLang) return false;
    }

    // Check payout filter
    if (payoutFilter !== "ALL") {
      const pay = t.payout_amount;
      if (payoutFilter === "HIGH" && pay < 70) return false;
      if (payoutFilter === "MID" && (pay < 35 || pay >= 70)) return false;
      if (payoutFilter === "LOW" && pay >= 35) return false;
    }

    // Check bookmarks exclusive filter
    if (showBookmarksOnly && !bookmarkedTaskIds.includes(t.id)) return false;

    // Must be <= contributor's current tier
    return batch.tier_required <= contributor.tier;
  });

  const completedTodayTasks = tasks.filter(t => t.assigned_contributor_id === contributor.id);

  // Start executing a task
  const handleStartTask = (taskId: string) => {
    setActiveExecTaskId(taskId);
    setTimerSeconds(1200); // 20 minutes countdown
    // Reset submission fields
    setPrefChoice(null);
    setAccRating(4);
    setHelpRating(4);
    setSafRating(5);
    setToneRating(4);
    setFlRating(4);
    setGramRating(4);
    setCultRating(4);
    setCodeEfficiency(4);
    setCodeStyle(4);
    setJustificationText("");
    setReformulation("");
    setIsHarmful(false);
    setHarmCat("None");
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (activeExecTaskId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExecTaskId]);

  const handleTaskSubmit = () => {
    if (justificationText.length < 30) {
      alert("Please provide a thorough justification of at least 30 characters. The Quality Engine score depends on your detailed, human-guided reasoning.");
      return;
    }

    if (!activeExecTaskId) return;
    const currentTask = tasks.find(t => t.id === activeExecTaskId);
    if (!currentTask) return;

    // Build Response matching types
    const taskResponse: TaskResponse = {
      preferred_response: prefChoice || undefined,
      accuracy_rating: accRating,
      helpfulness_rating: helpRating,
      safety_rating: safRating,
      tone_rating: toneRating,
      fluency_rating: flRating,
      cultural_appropriateness_rating: cultRating,
      grammar_rating: gramRating,
      code_efficiency_rating: codeEfficiency,
      code_style_rating: codeStyle,
      justification: justificationText,
      suggested_reformulation: reformulation || undefined,
      flag_harmful: isHarmful,
      harm_category: harmCat !== "None" ? harmCat : undefined
    };

    onCompleteTask(activeExecTaskId, taskResponse, currentTask.payout_amount);
    setActiveExecTaskId(null);
    onUpdateEarnings(contributor.earnings_balance + currentTask.payout_amount, currentTask.payout_amount);
    alert(`Task ${currentTask.id} successfully queued for QA audit. ₹${currentTask.payout_amount} has been provisionally written to your PENDING earnings balance!`);
  };

  const selectedExecTask = tasks.find(t => t.id === activeExecTaskId);

  // Helper for formatting countdown timer
  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  if (contributor.onboarded === false) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 md:p-6" id="onboarding-flow-container">
        <OnboardingWizard 
          user={user}
          contributor={contributor}
          onLogout={onLogout}
          onComplete={(wizardData) => {
            // Update contributor node in local and central DB state
            const updated: Contributor = {
              ...contributor,
              ...wizardData,
              onboarded: true
            };
            onUpdateContributor(updated);
            
            // Create a custom notification context
            setRecentPayoutsTicker((prev) => [
              `Onboarding complete! Vetted as Tier ${updated.tier} Contributor.`,
              ...prev
            ]);
            
            alert(`Premium Onboarding Complete! Welcome to 2UNE workspace. Tier ${updated.tier} fast-track approved.`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-brand-charcoal px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-teal text-white px-2 py-0.5 rounded font-black font-mono text-sm">2UNE</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Contributor Workspace — {user.name}</h1>
            <p className="text-[10px] text-brand-slate uppercase font-mono tracking-wider">Tier {contributor.tier} Vetted • {contributor.college}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-3 py-1 rounded-lg text-xs flex items-center gap-3">
            <span className="text-brand-slate font-mono uppercase tracking-wider text-[10px]">CURRENT BALANCE:</span>
            <span className="text-brand-green font-bold text-sm">₹{contributor.earnings_balance}</span>
            <button 
              onClick={() => {
                if (contributor.earnings_balance < 1000) {
                  alert("Minimum threshold for weekly payouts is ₹1,000. Balance checks clear every Friday.");
                } else {
                  alert(`Payout request successfully triggered for ₹${contributor.earnings_balance} to linked UPI reference (${contributor.bank_details.upi_id}). Status: Processing`);
                  onUpdateEarnings(0, 0);
                }
              }}
              className="bg-brand-green hover:bg-brand-green/80 text-black px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all"
            >
              WITHDRAW (UPI)
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="text-xs hover:text-brand-red bg-white/5 hover:bg-brand-red/10 border border-white/10 px-3 py-1.5 rounded-lg font-mono transition-all"
          >
            EXIT WORKSPACE
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-brand-charcoal/30 border-r border-white/5 p-4 space-y-2 shrink-0">
          <button 
            onClick={() => { setActiveTab("tasks"); setActiveExecTaskId(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "tasks" ? "bg-brand-teal text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Compass size={14} />
            AVAILABLE TASK FEED
          </button>

          <button 
            onClick={() => { setActiveTab("earnings"); setActiveExecTaskId(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "earnings" ? "bg-brand-teal text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Coins size={14} />
            EARNINGS & LEDGER
          </button>

          <button 
            onClick={() => { setActiveTab("profile"); setActiveExecTaskId(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "profile" ? "bg-brand-teal text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <GraduationCap size={14} />
            PROFILE & CREDENTIALS
          </button>

          <button 
            onClick={() => { setActiveTab("certifications"); setActiveExecTaskId(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "certifications" ? "bg-brand-teal text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Award size={14} />
            CERTIFICATIONS ({certifications.length})
          </button>

          <button 
            onClick={() => { setActiveTab("leaderboard"); setActiveExecTaskId(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "leaderboard" ? "bg-brand-teal text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Activity size={14} />
            STATE LEADERBOARD
          </button>
        </aside>

        {/* Content panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* TASK IN PROGRESS INTERFACE - TAKES OVER THE SCREEN OVERRIDE IF ACTIVE */}
          {activeExecTaskId && selectedExecTask ? (
            <div className="bg-brand-charcoal border border-white/5 rounded-2xl overflow-hidden p-6 space-y-6">
              {/* Task Header bar - countdown & info */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono bg-brand-teal text-white px-2 py-0.5 rounded font-bold">{selectedExecTask.task_type}</span>
                  <span className="text-xs text-brand-slate font-mono">TASK ID: <strong className="text-white">{selectedExecTask.id}</strong></span>
                  <button
                    type="button"
                    onClick={() => setShowBugModal(true)}
                    className="flex items-center gap-1.5 text-[10px] font-mono bg-brand-red/10 hover:bg-brand-red/20 text-brand-red border border-brand-red/20 ml-2 px-2 py-0.5 rounded transition-all"
                    id="flag-technical-bug-btn"
                  >
                    <Bug size={10} />
                    FLAG TECHNICAL BUG
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2 bg-brand-red/10 text-brand-red border border-brand-red/20 px-3 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                    <span>TIME LEFT: <strong className="font-bold">{formatTime(timerSeconds)}</strong></span>
                  </div>
                  <div className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-lg">
                    EST. PAYOUT: <strong className="font-bold">₹{selectedExecTask.payout_amount}</strong>
                  </div>
                </div>
              </div>

              {/* Task Core instructions */}
              <div className="p-4 bg-white/[0.01] border-l-2 border-brand-teal rounded-r text-xs text-brand-slate leading-relaxed">
                <strong>Annotation Instructions:</strong> Choose preferred response (or slide ratings) optimizing for accurate Indian context. Give a detailed, clear justification explaining why the decision was made.
              </div>

              {/* Dynamic Workspace based on task_type */}
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider mb-2 font-bold">PROMPT PROVIDED TO THE AI MODEL</label>
                  <blockquote className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm italic font-sans leading-relaxed">
                    {selectedExecTask.content.prompt}
                  </blockquote>
                </div>

                {/* TASK WORKSPACE TYPE 1: RLHF & Preference side-by-side */}
                {selectedExecTask.task_type === "RLHF" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Response A */}
                      <button 
                        type="button"
                        onClick={() => setPrefChoice("A")}
                        className={`text-left p-5 rounded-2xl border transition-all text-sm leading-relaxed flex flex-col justify-between ${
                          prefChoice === "A" 
                            ? "bg-brand-green/5 border-brand-green text-white ring-1 ring-brand-green" 
                            : "bg-black/30 border-white/5 hover:border-white/10 text-brand-slate"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI GENERATION RESPONSE A</span>
                            {prefChoice === "A" && <span className="text-[10px] bg-brand-green text-black font-bold px-2 py-0.5 rounded font-mono">PREFERRED</span>}
                          </div>
                          <p className="font-sans whitespace-pre-wrap">{selectedExecTask.content.response_a}</p>
                        </div>
                      </button>

                      {/* Response B */}
                      <button 
                        type="button"
                        onClick={() => setPrefChoice("B")}
                        className={`text-left p-5 rounded-2xl border transition-all text-sm leading-relaxed flex flex-col justify-between ${
                          prefChoice === "B" 
                            ? "bg-brand-green/5 border-brand-green text-white ring-1 ring-brand-green" 
                            : "bg-black/30 border-white/5 hover:border-white/10 text-brand-slate"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI GENERATION RESPONSE B</span>
                            {prefChoice === "B" && <span className="text-[10px] bg-brand-green text-black font-bold px-2 py-0.5 rounded font-mono">PREFERRED</span>}
                          </div>
                          <p className="font-sans whitespace-pre-wrap">{selectedExecTask.content.response_b}</p>
                        </div>
                      </button>
                    </div>

                    {/* Preference rating rubrics */}
                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-teal">Linguistic Dimension Rubrics</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <label className="flex justify-between mb-1">
                            <span>Factual Accuracy Rating: ({accRating}/5)</span>
                          </label>
                          <input type="range" min={1} max={5} value={accRating} onChange={(e) => setAccRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green rounded-lg" />
                        </div>
                        <div>
                          <label className="flex justify-between mb-1">
                            <span>Helpfulness Alignment: ({helpRating}/5)</span>
                          </label>
                          <input type="range" min={1} max={5} value={helpRating} onChange={(e) => setHelpRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green rounded-lg" />
                        </div>
                        <div>
                          <label className="flex justify-between mb-1">
                            <span>Local Conversational Tone: ({toneRating}/5)</span>
                          </label>
                          <input type="range" min={1} max={5} value={toneRating} onChange={(e) => setToneRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green rounded-lg" />
                        </div>
                        <div>
                          <label className="flex justify-between mb-1">
                            <span>Safeguard compliance: ({safRating}/5)</span>
                          </label>
                          <input type="range" min={1} max={5} value={safRating} onChange={(e) => setSafRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TASK WORKSPACE TYPE 2: Indic Language Evaluation */}
                {selectedExecTask.task_type === "Indic_Language_Eval" && (
                  <div className="space-y-4">
                    <div className="p-5 bg-black/30 border border-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white uppercase font-mono">INDIC RESPONSE PROVIDED</span>
                      </div>
                      <p className="text-sm font-sans whitespace-pre-wrap">{selectedExecTask.content.response_a}</p>
                    </div>

                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4 text-xs font-mono">
                      <h4 className="text-xs font-mono font-bold uppercase text-brand-teal">Linguistic Profiling Sliders</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1">Marathi Fluency ({flRating}/5)</label>
                          <input type="range" min={1} max={5} value={flRating} onChange={(e) => setFlRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-teal rounded-lg" />
                        </div>
                        <div>
                          <label className="block mb-1">Colloquial grammar ({gramRating}/5)</label>
                          <input type="range" min={1} max={5} value={gramRating} onChange={(e) => setGramRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-teal rounded-lg" />
                        </div>
                        <div>
                          <label className="block mb-1">Agrarian terminology check ({cultRating}/5)</label>
                          <input type="range" min={1} max={5} value={cultRating} onChange={(e) => setCultRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-teal rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TASK WORKSPACE TYPE 3: Voice Agent Call evaluation */}
                {selectedExecTask.task_type === "Voice_Agent_Eval" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setAudioPlaying(!audioPlaying)}
                          className="w-12 h-12 rounded-full bg-brand-green text-black hover:bg-brand-green/80 flex items-center justify-center transition-all shrink-0"
                        >
                          {audioPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                        </button>
                        <div>
                          <h5 className="text-xs font-bold text-white">Superfast_Groceries_Call_Rahul.wav</h5>
                          <p className="text-[10px] text-brand-slate font-mono">PCM Mono 8kHz • 22 seconds duration</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-brand-green animate-pulse">{audioPlaying ? "STREAMING PLAYBACK..." : "PAUSED"}</span>
                    </div>

                    <div className="p-5 bg-black/30 border border-white/5 rounded-xl">
                      <h4 className="text-xs font-bold text-brand-slate uppercase font-mono mb-2">DIALOGUE TRANSCRIPT LOG</h4>
                      <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-brand-slate">
                        {selectedExecTask.content.transcript}
                      </p>
                    </div>

                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4 text-xs font-mono">
                      <h4 className="font-bold text-brand-teal uppercase">Call naturalness slider ratings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1">Acoustic Pronunciation ({flRating}/5)</label>
                          <input type="range" min={1} max={5} value={flRating} onChange={(e) => setFlRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green" />
                        </div>
                        <div>
                          <label className="block mb-1">Turn-Taking Latency Recognition ({accRating}/5)</label>
                          <input type="range" min={1} max={5} value={accRating} onChange={(e) => setAccRating(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-green" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TASK WORKSPACE TYPE 4: Coding benchmark verification */}
                {selectedExecTask.task_type === "Coding_Eval" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/60 border border-white/5 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                      <div className="flex justify-between border-b border-white/5 pb-2 mb-2 text-[10px] text-brand-slate">
                        <span>PYTHON GENERATED SOURCE CODE</span>
                        <span>Complexity target: R = 10^12</span>
                      </div>
                      <pre className="text-brand-green">{selectedExecTask.content.code_snippet}</pre>
                    </div>

                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4 text-xs font-mono">
                      <h4 className="font-bold text-brand-teal uppercase flex items-center gap-2">
                        <Code2 size={14} />
                        Algorithm Sandboxed Quality metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1">Code Performance Efficiency ({codeEfficiency}/5)</label>
                          <input type="range" min={1} max={5} value={codeEfficiency} onChange={(e) => setCodeEfficiency(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-teal" />
                        </div>
                        <div>
                          <label className="block mb-1">Structural Styling & Readability ({codeStyle}/5)</label>
                          <input type="range" min={1} max={5} value={codeStyle} onChange={(e) => setCodeStyle(parseInt(e.target.value))} className="w-full h-1 bg-white/10 accent-brand-teal" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TASK WORKSPACE TYPE 5: Safety Red Teaming */}
                {selectedExecTask.task_type === "Safety_Red_Team" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-brand-red/5 border border-brand-red/20 rounded-xl space-y-2">
                      <span className="text-[10px] text-brand-red font-mono font-bold flex items-center gap-2">
                        <AlertTriangle size={12} strokeWidth={2.5} />
                        HARMFUL CONTENT POLICING PROTOCOL
                      </span>
                      <p className="text-xs text-brand-slate">
                        Audit this adversarial prompt strictly against Indian financial & payment laws. Leakage is a critical SLA compromise.
                      </p>
                    </div>

                    <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-3 text-xs font-mono mb-4">
                        <span>Is this prompt an illicit bypass leak attempt?</span>
                        <button 
                          onClick={() => setIsHarmful(!isHarmful)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            isHarmful ? "bg-brand-red text-white" : "bg-white/5 text-brand-slate hover:text-white"
                          }`}
                        >
                          {isHarmful ? "YES (FLAGGED)" : "NO (BENIGN)"}
                        </button>
                      </div>

                      {isHarmful && (
                        <div>
                          <label className="block text-[10px] text-brand-slate font-bold font-mono mb-1">HARMS CLASSIFICAION TARGET</label>
                          <select 
                            value={harmCat} onChange={(e) => setHarmCat(e.target.value)}
                            className="bg-black border border-white/10 rounded text-xs text-white p-2 w-full max-w-sm"
                          >
                            <option value="None">None</option>
                            <option value="UPI Fraud bypass">UPI Gateway Exploits / Fraud bypass</option>
                            <option value="Aadhaar Privacy leak">Aadhaar Intercept / KYC Digital ID Leak</option>
                            <option value="Hate speech">Insults / Social Hate speech</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantitative Human Justification Block */}
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider mb-2 font-bold">
                    SPECIFIC HUMAN-COMPUTE REASONING JUSTIFICATION (MIN 30 CHARACTERS)
                  </label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Provide extremely robust reasoning behind your ratings. State exact edge-cases, factual slips, or localized dialect errors found..."
                    value={justificationText}
                    onChange={(e) => setJustificationText(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-brand-teal rounded-lg p-3 text-xs outline-none transition-colors"
                  />
                  <div className="text-[10px] text-brand-slate mt-1 text-right">
                    Characters count: <strong className={justificationText.length >= 30 ? "text-brand-green" : "text-brand-red"}>{justificationText.length}</strong> / 30 minimum
                  </div>
                </div>

                {/* Suggest Reformulation (Optional, helpful for Indic translations) */}
                <div>
                  <label className="block text-[10px] font-mono text-brand-slate uppercase tracking-wider mb-2">
                    SUGGESTED OPTIMAL REFORMULATION / CORRECTION (OPTIONAL)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Provide a corrected version if the AI's content was grammatically or contextually flawed..."
                    value={reformulation}
                    onChange={(e) => setReformulation(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-brand-teal rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                  />
                </div>

                {/* Bottom navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <button 
                    onClick={() => { setActiveExecTaskId(null); setAudioPlaying(false); }}
                    className="text-xs bg-white/5 text-brand-slate hover:text-white px-4 py-2 rounded-lg font-mono"
                  >
                    Cancel / Skip Task
                  </button>
                  <button 
                    onClick={handleTaskSubmit}
                    className="bg-brand-green text-black font-mono font-bold text-xs py-2.5 px-6 rounded-lg hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/5"
                  >
                    SUBMIT TO QA AUDITOR
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* TASKS VIEW */}
              {activeTab === "tasks" && (
                <div className="space-y-6">
                  {/* Streak Tracker & Complete info */}
                  <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-teal/5 blur-3xl rounded-full pointer-events-none" />
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Active Scholar Feed</h2>
                      <p className="text-xs text-brand-slate mt-1">Available workspace blocks matched to your certified Tier {contributor.tier} credentials. Rushing reduces rolling accuracy.</p>
                    </div>

                    <div className="flex gap-4 font-mono">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                        <div className="text-[10px] text-brand-slate">COMPLETED TODAY</div>
                        <div className="text-xl font-bold text-brand-teal mt-0.5">{completedTodayTasks.length}</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                        <div className="text-[10px] text-brand-slate">ROLLING ACCURACY</div>
                        <div className="text-xl font-bold text-brand-green mt-0.5">{contributor.accuracy_score}%</div>
                      </div>
                    </div>
                  </div>
                        {/* REAL-TIME METRICS & LIVE TICKER RIBBON */}
                  <div className="bg-black/35 border border-brand-green/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-brand-green" id="rolling-credit-payouts-ribbon">
                    <div className="flex gap-2.5 items-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
                      <strong className="text-white uppercase font-bold tracking-widest text-[10px] font-sans">Real-time Dispatch Stream:</strong>
                    </div>
                    <div className="flex-1 w-full overflow-hidden relative h-5 flex items-center">
                      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-black to-transparent pointer-events-none" />
                      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-black to-transparent pointer-events-none" />
                      <div className="whitespace-nowrap text-[10px] text-brand-green/85 pl-4 animate-pulse">
                        {recentPayoutsTicker.join("   •   ")}
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] text-white/50 bg-white/5 px-2.5 py-0.5 rounded font-sans">
                      UPI GATEWAY ACTIVE: <strong className="text-brand-green font-bold text-[10px] font-mono">LIVE ✓</strong>
                    </div>
                  </div>

                  {/* Task category filters */}
                  <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl space-y-4" id="vetted-workspace-filtercards">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Filter className="text-brand-teal" size={14} />
                        <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">Multi-Criteria Workspace Filters</span>
                      </div>
                      
                      {/* Bookmark toggle */}
                      <button
                        type="button"
                        onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                          showBookmarksOnly 
                            ? "bg-brand-teal/20 text-brand-teal border-brand-teal" 
                            : "bg-white/5 text-brand-slate border-white/5 hover:text-white"
                        }`}
                        id="bookmark-tasks-filter-toggle"
                      >
                        <Bookmark size={12} className={showBookmarksOnly ? "fill-brand-teal text-brand-teal" : ""} />
                        <span>BOOKMARKED ({bookmarkedTaskIds.length})</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filter 1: Task Type */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-brand-slate uppercase font-bold">Linguistic Dimension</label>
                        <select
                          value={taskFilter}
                          onChange={(e) => setTaskFilter(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-teal"
                        >
                          <option value="ALL">ALL DIMENSIONS</option>
                          <option value="RLHF">RLHF Preference Mapping</option>
                          <option value="Indic_Language_Eval">Indic Language Translation</option>
                          <option value="Voice_Agent_Eval">Voice Conversation Audio</option>
                          <option value="Coding_Eval">Logic & Reasoning Snippets</option>
                          <option value="Safety_Red_Team">Harm Enforcement Red-Team</option>
                        </select>
                      </div>

                      {/* Filter 2: Language Dialect */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-brand-slate uppercase font-bold">Language Domain</label>
                        <select
                          value={languageFilter}
                          onChange={(e) => setLanguageFilter(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-teal"
                        >
                          <option value="ALL">ALL LANGUAGES</option>
                          <option value="SANSKRIT">Sanskrit / Classical</option>
                          <option value="TELUGU">Telugu / Andhra Dialect</option>
                          <option value="MARATHI">Marathi / Bombay Slang</option>
                          <option value="HINDI">Hindi / Standard Devanagari</option>
                          <option value="KANNADA">Kannada / Southern Slang</option>
                        </select>
                      </div>

                      {/* Filter 3: Reward Bracket */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-brand-slate uppercase font-bold">Reward Payout Level</label>
                        <select
                          value={payoutFilter}
                          onChange={(e) => setPayoutFilter(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-teal"
                        >
                          <option value="ALL">ALL PAYOUTS</option>
                          <option value="HIGH">HIGH REWARD (&gt;₹70 / task)</option>
                          <option value="MID">MID REWARD (₹35 - ₹70)</option>
                          <option value="LOW">LOW REWARD (&lt;₹35)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vetted matched task cards */}
                  {matchedTasks.length === 0 ? (
                    <div className="bg-brand-charcoal border border-white/5 p-12 rounded-xl text-center">
                      <Compass className="text-brand-slate mx-auto mb-3" size={32} />
                      <h4 className="font-bold text-sm">No matched tasks available right now</h4>
                      <p className="text-xs text-brand-slate mt-1 max-w-sm mx-auto">
                        All clear! You've claimed of the available tasks matching your credential set. New batches upload dynamically from account leads every couple hours.
                      </p>
                      <button 
                        onClick={() => setActiveTab("certifications")}
                        className="mt-4 bg-brand-teal/20 text-brand-teal hover:bg-brand-teal hover:text-white text-xs px-4 py-2 rounded-lg font-mono font-bold transition-all"
                      >
                        Explore Certifications to Unlock Tier 2/3 Tasks
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchedTasks.map((t) => {
                        const payout = t.payout_amount;
                        const specBatch = batches.find(b => b.id === t.batch_id);
                        const isBooked = bookmarkedTaskIds.includes(t.id);
                        return (
                          <div key={t.id} className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-brand-teal/30 transition-all">
                            <div>
                              <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] font-mono bg-white/5 text-brand-slate px-2 py-0.5 rounded uppercase">{t.task_type}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isBooked) {
                                        setBookmarkedTaskIds(bookmarkedTaskIds.filter(id => id !== t.id));
                                      } else {
                                        setBookmarkedTaskIds([...bookmarkedTaskIds, t.id]);
                                      }
                                    }}
                                    className="text-brand-slate hover:text-brand-teal p-1 rounded hover:bg-white/5 transition-all"
                                    id={`bookmark-toggle-${t.id}`}
                                  >
                                    <Bookmark size={11} className={isBooked ? "fill-brand-teal text-brand-teal" : ""} />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-brand-green font-mono">₹{payout}</span>
                              </div>
                              <h4 className="font-bold text-sm text-white mt-3 truncate">{t.content.prompt}</h4>
                              <p className="text-[10px] text-brand-slate mt-1 leading-relaxed">
                                Batch: <strong className="text-brand-slate font-mono">{specBatch?.name}</strong> • Time SLA: 45 minutes
                              </p>
                            </div>
                            <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                              <span className="text-[9px] font-mono text-brand-slate">3 slots remaining</span>
                              <button 
                                onClick={() => handleStartTask(t.id)}
                                className="bg-brand-teal hover:bg-brand-teal/90 text-white font-mono text-xs font-bold py-1.5 px-4 rounded-lg transition-all"
                              >
                                START TASK
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* EARNINGS TAB */}
              {activeTab === "earnings" && (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 space-y-6">
                  <h3 className="font-bold text-sm">UPI India Earnings Statement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl block text-xs space-y-1 font-mono">
                      <div className="text-brand-slate">EARNED ALL TIME:</div>
                      <div className="text-xl font-bold text-white">₹{contributor.total_earned}</div>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl block text-xs space-y-1 font-mono">
                      <div className="text-brand-slate">LINKED REGISTERED UPI REFERENCE:</div>
                      <div className="text-sm font-bold text-brand-teal mt-1">{contributor.bank_details.upi_id || "None set"}</div>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl block text-xs space-y-1 font-mono">
                      <div className="text-brand-slate">SLA PENALTY ACCRUALS:</div>
                      <div className="text-sm font-bold text-brand-success mt-1">₹0.00 (Perfect compliance)</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold text-brand-slate tracking-wider uppercase mb-4">Payout Transaction Logs</h4>
                    <div className="overflow-x-auto text-xs font-mono">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] text-brand-slate uppercase">
                            <th className="pb-3">Transfer Reference</th>
                            <th className="pb-3">Amount (INR)</th>
                            <th className="pb-3">Period details</th>
                            <th className="pb-3">Linked Accounts</th>
                            <th className="pb-3 text-right">Settlement Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-brand-slate">
                          {[
                            { ref: "TXN_774921", val: "₹14,200", per: "June 1-7, 2026", acc: contributor.bank_details.upi_id, stat: "PAID" },
                            { ref: "TXN_881245", val: "₹8,120", per: "June 8-14, 2026", acc: contributor.bank_details.upi_id, stat: "PAID" },
                          ].map((t) => (
                            <tr key={t.ref}>
                              <td className="py-3 font-bold text-white">{t.ref}</td>
                              <td className="py-3 font-bold text-brand-green">{t.val}</td>
                              <td className="py-3">{t.per}</td>
                              <td className="py-3">{t.acc}</td>
                              <td className="py-3 text-right">
                                <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded text-[9px] font-bold">
                                  {t.stat}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 space-y-6">
                  <h3 className="font-bold text-sm">Vetted Scholar Profile</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-teal bg-brand-teal/10 flex items-center justify-center text-xl font-bold font-mono">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{user.name}</h4>
                      <p className="text-xs text-brand-slate font-mono">{contributor.college} • {contributor.degree}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded uppercase font-mono font-bold">Tier {contributor.tier} Vetted</span>
                        <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded uppercase font-mono font-bold">KYC Vetted</span>
                      </div>
                    </div>
                  </div>

                  {/* REPUTATION PANEL with Recharts Completion Chart */}
                  {(() => {
                    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const getPast7Days = () => {
                      const list = [];
                      for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dayName = daysOfWeek[d.getDay()];
                        const dateNum = d.getDate();
                        const baseCompletions = [8, 14, 11, 15, 9, 13, 0][6 - i];
                        const completedCount = baseCompletions + (i === 0 ? completedTodayTasks.length : 0);
                        
                        const baseEarnings = [360, 630, 495, 675, 405, 585, 0][6 - i];
                        const todayPayoutSum = completedTodayTasks.reduce((sum, t) => sum + (t.payout_amount || 45), 0);
                        const earningsCount = baseEarnings + (i === 0 ? todayPayoutSum : 0);

                        list.push({
                          label: `${dayName} ${dateNum}`,
                          tasks: completedCount,
                          earnings: earningsCount,
                        });
                      }
                      return list;
                    };
                    const chartData = getPast7Days();

                    return (
                      <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4" id="reputation-panel-card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold font-mono tracking-wider text-brand-teal uppercase">SCHOLAR REPUTATION & TREND INDEX</h4>
                            <p className="text-[11px] text-brand-slate mt-0.5">7-day rolling performance telemetry comparing active throughput with task yields.</p>
                          </div>
                          <div className="flex gap-4 font-mono text-center shrink-0">
                            <div className="bg-brand-charcoal/40 px-3 py-1.5 rounded border border-white/5">
                              <div className="text-[9px] text-brand-slate uppercase font-bold">Consistency Index</div>
                              <div className="text-xs font-bold text-brand-teal mt-0.5 font-mono">94.8%</div>
                            </div>
                            <div className="bg-brand-charcoal/40 px-3 py-1.5 rounded border border-white/5">
                              <div className="text-[9px] text-brand-slate uppercase font-bold">SLA Compliance</div>
                              <div className="text-xs font-bold text-brand-green mt-0.5 font-mono">100%</div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Toggle Button Above Chart */}
                        <div className="flex justify-between items-center bg-black/25 p-1 rounded-xl border border-white/5" id="reputation-metric-toggle-wrapper">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-brand-slate pl-2.5">
                            Select Metric:
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setTrendMetric("tasks")}
                              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all font-bold cursor-pointer ${
                                trendMetric === "tasks"
                                  ? "bg-brand-teal text-white shadow-sm shadow-brand-teal/20"
                                  : "text-brand-slate hover:text-white hover:bg-white/5"
                              }`}
                              id="btn-toggle-tasks"
                            >
                              Tasks Completed
                            </button>
                            <button
                              onClick={() => setTrendMetric("earnings")}
                              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all font-bold cursor-pointer ${
                                trendMetric === "earnings"
                                  ? "bg-brand-teal text-white shadow-sm shadow-brand-teal/20"
                                  : "text-brand-slate hover:text-white hover:bg-white/5"
                              }`}
                              id="btn-toggle-earnings"
                            >
                              Earnings Generated (₹)
                            </button>
                          </div>
                        </div>

                        {/* Chart Container */}
                        <div className="h-44 w-full bg-black/20 border border-white/5 rounded-xl p-2 animate-fadeIn" id="reputation-history-chart">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                              <XAxis 
                                dataKey="label" 
                                stroke="#475569" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#475569" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                allowDecimals={false}
                                tickFormatter={(val) => trendMetric === "earnings" ? `₹${val}` : val}
                              />
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl font-mono text-[11px] text-brand-slate space-y-1.5 min-w-[160px]">
                                        <div className="text-white font-bold border-b border-white/5 pb-1 mb-1 text-xs flex justify-between">
                                          <span>DATE:</span>
                                          <span className="text-brand-teal">{data.label}</span>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                          <span>Tasks Completed:</span>
                                          <span className="text-white font-bold">{data.tasks}</span>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                          <span>Earnings Yield:</span>
                                          <span className="text-brand-green font-bold">₹{data.earnings}</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey={trendMetric} 
                                name={trendMetric === "tasks" ? "Tasks Completed" : "Earnings Generated"}
                                stroke="#14b8a6" 
                                strokeWidth={2.5}
                                activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 1.5 }}
                                dot={{ r: 3, stroke: '#14b8a6', strokeWidth: 1.5, fill: '#18181b' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Dynamic Peak Activity Feedback */}
                        {(() => {
                          const peakDay = chartData.reduce((max, d) => d[trendMetric] > max[trendMetric] ? d : max, chartData[0] || { label: 'N/A', tasks: 0, earnings: 0 });
                          const isTasks = trendMetric === "tasks";
                          return (
                            <div className="flex items-center gap-2 text-[11px] font-mono bg-brand-teal/5 border border-brand-teal/10 rounded-lg px-3.5 py-2 text-brand-slate" id="peak-activity-summary">
                              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse shrink-0" />
                              <span>
                                {isTasks ? (
                                  <>
                                    Peak performance recorded on <strong className="text-white font-bold">{peakDay.label}</strong> with <strong className="text-brand-teal font-bold">{peakDay.tasks} tasks</strong> completed. Keep up the stellar cadence!
                                  </>
                                ) : (
                                  <>
                                    Peak earnings recorded on <strong className="text-white font-bold">{peakDay.label}</strong> with a high score of <strong className="text-brand-teal font-bold">₹{peakDay.earnings}</strong>. Your precise evaluation accuracy directly drives premium yields!
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}

                  {/* Skill radar progress bars */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5 text-xs font-mono">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="text-brand-slate">GENERAL REASONING</div>
                      <div className="text-lg font-bold text-white">{contributor.skill_scores.reasoning}%</div>
                      <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-brand-green h-full" style={{ width: `${contributor.skill_scores.reasoning}%` }} /></div>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="text-brand-slate">DOMAIN ASSESSMENT</div>
                      <div className="text-lg font-bold text-white">{contributor.skill_scores.domain}%</div>
                      <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-brand-green h-full" style={{ width: `${contributor.skill_scores.domain}%` }} /></div>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="text-brand-slate">REGIONAL LINGUISTICS</div>
                      <div className="text-lg font-bold text-white">{contributor.skill_scores.language}%</div>
                      <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-brand-green h-full" style={{ width: `${contributor.skill_scores.language}%` }} /></div>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="text-brand-slate">CODE VERIFICATION</div>
                      <div className="text-lg font-bold text-white">{contributor.skill_scores.coding}%</div>
                      <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-brand-green h-full" style={{ width: `${contributor.skill_scores.coding}%` }} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS TAB */}
              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-sm mb-2">Your Professional Certifications</h3>
                    <p className="text-xs text-brand-slate">Pass vetted proctored assessments to unlock advanced red-teaming, scientific proofs, or medicine evaluation scopes.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {/* Certified */}
                      {certifications.map(cert => (
                        <div key={cert.id} className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                              <Award size={20} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{cert.type}</h4>
                              <p className="text-[10px] text-brand-slate font-mono">Issued {cert.issued_at} • Expires {cert.expiry_at}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-brand-green font-bold">VETTED</span>
                        </div>
                      ))}

                      {/* Locked */}
                      {[
                        { name: "2UNE Safety & Cyber Security Red-Teamer", req: "Requires minimum 20 hours execution and pass Red Team Assessment" },
                        { name: "2UNE Senior Biomedical Consultant Auditor", req: "Requires PhD degree validation or manual credentials check" },
                      ].map((lk, idx) => (
                        <div key={idx} className="p-4 bg-black/30 border border-white/5 opacity-50 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-slate">
                              <AlertTriangle size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{lk.name}</h4>
                              <p className="text-[10px] text-brand-slate mt-0.5">{lk.req}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-brand-slate font-bold">LOCKED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LEADERBOARD TAB */}
              {activeTab === "leaderboard" && (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-sm mb-4">Academic Leaderboard (Weekly)</h3>
                  
                  <div className="overflow-x-auto text-xs font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-brand-slate uppercase">
                          <th className="pb-3">Rank No</th>
                          <th className="pb-3">Vetted Contributor Reference</th>
                          <th className="pb-3 font-sans">College / University</th>
                          <th className="pb-3 text-right">Rolling Accuracy</th>
                          <th className="pb-3 text-right">Weekly Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allContributors.map((col, idx) => {
                          const specificUser = allUsers.find(u => u.id === col.user_id);
                          const isSelf = col.id === contributor.id;
                          return (
                            <tr key={col.id} className={isSelf ? "bg-brand-teal/5 text-white" : "text-brand-slate"}>
                              <td className="py-3 font-bold">{idx + 1} {isSelf && " (You)"}</td>
                              <td className="py-3 font-bold">
                                {isSelf ? specificUser?.name : `Contributor #CS${col.id.replace("CO_", "")}`}
                              </td>
                              <td className="py-3 font-sans">{col.college}</td>
                              <td className="py-3 text-right text-brand-green font-bold">{col.accuracy_score}%</td>
                              <td className="py-3 text-right font-bold text-brand-green">₹{(col.total_earned / 10).toFixed(0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Flag Technical bug modal overlay */}
      {showBugModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left relative font-sans">
            <button
              onClick={() => setShowBugModal(false)}
              className="absolute top-4 right-4 text-brand-slate hover:text-white"
            >
              ✕
            </button>
            
            <div className="flex gap-2 items-center text-brand-red">
              <Bug size={18} />
              <h3 className="font-bold text-sm text-white font-sans">Report System Issue / Bug</h3>
            </div>
            
            <p className="text-[11px] text-brand-slate leading-relaxed">
              Flagging a verified system malfunction immediately and securely pauses your active SLA timer. Our Leads review logs instantly.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[9px] text-brand-slate uppercase font-bold mb-1 font-mono">Issue Categorization</label>
                <select
                  value={bugCategory}
                  onChange={(e) => setBugCategory(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Slow response / laggy preview container">Slow response / laggy preview container</option>
                  <option value="Indic Unicode Glyphs broken in prompts">Indic Unicode Glyphs broken in prompts</option>
                  <option value="Audio player failed to synthesize loop">Audio player failed to synthesize loop</option>
                  <option value="Submit button disabled on valid inputs">Submit button disabled on valid inputs</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-brand-slate uppercase font-bold mb-1 font-mono">Detailed Log Description</label>
                <textarea
                  rows={3}
                  value={bugText}
                  onChange={(e) => setBugText(e.target.value)}
                  placeholder="Verify issue parameters (e.g. Sanskrit letters cut off half-line, model canvas failed to mount)..."
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-red font-sans"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!bugText.trim()) {
                    alert("Please write a small description of the glitch to verify against container syslog.");
                    return;
                  }
                  alert(`Logs reported! Bug Ref ID: BUG_IND_${Math.floor(Math.random() * 900 + 100)}. SLA countdown paused successfully.`);
                  setShowBugModal(false);
                  setBugText("");
                }}
                className="flex-1 bg-brand-red text-white py-2 rounded-lg font-mono text-xs font-bold transition-all"
              >
                SUBMIT SYS-LOG
              </button>
              <button
                type="button"
                onClick={() => setShowBugModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-brand-slate hover:text-white py-2 rounded-lg font-mono text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
