import React, { useState } from "react";
import { 
  Terminal, 
  Users, 
  Layers, 
  Activity, 
  ShieldCheck, 
  CreditCard, 
  Sliders, 
  CheckCircle, 
  XCircle, 
  Trash2,
  AlertTriangle,
  Info,
  Calendar,
  Layers2,
  Award,
  GraduationCap,
  Globe,
  BookOpen,
  Clock,
  X,
  Check,
  Sparkles,
  Download,
  Upload,
  ShieldAlert,
  UserCheck,
  Coins
} from "lucide-react";
import { 
  User, 
  Organization, 
  Contributor, 
  Project, 
  TaskBatch, 
  Task, 
  Payment, 
  AuditLog,
  TaskResponse
} from "../types";

interface OperationsPortalProps {
  user: User;
  customers: User[];
  orgs: Organization[];
  contributors: Contributor[];
  projects: Project[];
  batches: TaskBatch[];
  tasks: Task[];
  payments: Payment[];
  auditLogs: AuditLog[];
  onVerifyContributor: (contributorId: string, status: "verified" | "failed") => void;
  onDeleteContributors: (contributorIds: string[]) => void;
  onImportContributors?: (newCohorts: {
    name: string;
    email: string;
    college: string;
    degree: string;
    year_of_study: string;
    domains: string[];
    languages: string[];
    tier?: 1 | 2 | 3;
    verification_status?: "not_started" | "pending" | "verified" | "failed";
  }[]) => void;
  onQAOverride: (taskId: string, choice: "A" | "B", notes: string) => void;
  onApprovePayment: (paymentId: string) => void;
  onCreateTaskBatch: (newBatch: TaskBatch, newTasks: Task[]) => void;
  onLogout: () => void;
}

export default function OperationsPortal({
  user,
  customers,
  orgs,
  contributors,
  projects,
  batches,
  tasks,
  payments,
  auditLogs,
  onVerifyContributor,
  onDeleteContributors,
  onImportContributors,
  onQAOverride,
  onApprovePayment,
  onCreateTaskBatch,
  onLogout
}: OperationsPortalProps) {
  const [activeTab, setActiveTab] = useState<"command" | "customers" | "projects" | "workforce" | "qc" | "payments">("command");
  const [selectedQAId, setSelectedQAId] = useState<string | null>(null);
  const [qaNotesText, setQaNotesText] = useState("");
  const [selectedContributorId, setSelectedContributorId] = useState<string | null>(null);
  const [workforceSubTab, setWorkforceSubTab] = useState<"queue" | "directory">("queue");
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [showImportCohort, setShowImportCohort] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Bulk verification action
  const handleBulkVerify = () => {
    // Find which of the selected ids are actually pending
    const pendingSelected = selectedBulkIds.filter(id => {
      const c = contributors.find(item => item.id === id);
      return c && (c.verification_status === "pending" || c.kyc_status === "pending");
    });

    if (pendingSelected.length === 0) {
      alert("No pending profiles are currently selected for verification.");
      return;
    }

    pendingSelected.forEach(id => {
      onVerifyContributor(id, "verified");
    });

    alert(`Successfully bulk-verified ${pendingSelected.length} profiles!`);
    setSelectedBulkIds([]);
  };

  // Bulk delete action
  const handleBulkDelete = () => {
    if (selectedBulkIds.length === 0) {
      alert("No contributor profiles selected for deletion.");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to permanently delete these ${selectedBulkIds.length} test contributor record(s)? This cannot be undone.`);
    if (!confirmDelete) return;

    onDeleteContributors(selectedBulkIds);
    alert(`Successfully deleted ${selectedBulkIds.length} contributor profile(s).`);
    setSelectedBulkIds([]);
  };

  // Export contributors to CSV for reporting
  const handleExportCSV = () => {
    if (contributors.length === 0) {
      alert("No contributor records available to export.");
      return;
    }

    const headers = [
      "Contributor ID",
      "Name",
      "Email",
      "College/University",
      "Degree",
      "Year of Study",
      "Specialist Domains",
      "Linguistic Repertoire",
      "Tier Level",
      "Accuracy Score (%)",
      "Completion Rate (%)",
      "IAA Index",
      "Escrow Wallet Balance (INR)",
      "Total Lifetime Payout (INR)",
      "Vetted Status"
    ];

    const rows = contributors.map(c => {
      const specUser = customers.find(u => u.id === c.user_id) || { name: "Guest Scholar", email: "guest@g.ac.in" };
      return [
        c.id,
        specUser.name,
        specUser.email,
        c.college,
        c.degree,
        c.year_of_study,
        c.domains.join("; "),
        c.languages.join("; "),
        `Tier ${c.tier}`,
        c.accuracy_score,
        c.completion_rate,
        c.iaa_score.toFixed(2),
        c.earnings_balance,
        c.total_earned,
        c.verification_status || c.kyc_status || "pending"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(value => {
          const strVal = String(value).replace(/"/g, '""');
          return strVal.includes(",") || strVal.includes(";") || strVal.includes("\n") || strVal.includes(" ") ? `"${strVal}"` : strVal;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `2une_vetted_scholars_${new Date().toISOString().substring(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV Cohort template
  const handleDownloadTemplate = () => {
    const csvContent = "Name,Email,College/University,Degree,Year of Study,Specialist Domains,Linguistic Repertoire,Tier\n" +
      "Devendra Sharma,devendra.s@iitd.ac.in,IIT Delhi,M.Tech,1st Year,Coding & Reasoning Eval;Safety & Red Teaming,English;Hindi,2\n" +
      "Priya Patel,priya.patel@gujaratuni.org,Gujarat University,B.Sc,3rd Year,Indic Language RLHF;Safety & Red Teaming,English;Gujarati;Hindi,1";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "two_tune_cohort_onboarding_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to parse double quotes or standard commas in CSV
  const parseCSVTextForOnboarding = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      throw new Error("CSV file requires a header row and at least one data row.");
    }

    // Capture headers
    const rawHeaders = lines[0].split(",");
    const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/["'\r\n]/g, ""));

    const items: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to parse CSV columns supporting double quotes
      const values: string[] = [];
      let currentVal = "";
      let inQuotes = false;

      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

      if (values.length === 0 || (values.length === 1 && values[0] === "")) {
        continue;
      }

      // Map values based on closely related headers
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });

      // Map to standard user and contributor fields
      const mappedName = rowObj["name"] || rowObj["scholar name"] || rowObj["fullname"] || values[0] || "";
      const mappedEmail = rowObj["email"] || rowObj["email address"] || rowObj["scholar email"] || values[1] || "";
      const mappedCollege = rowObj["college/university"] || rowObj["college"] || rowObj["university"] || rowObj["affiliation"] || values[2] || "";
      const mappedDegree = rowObj["degree"] || values[3] || "B.Tech";
      const mappedYear = rowObj["year of study"] || rowObj["year_of_study"] || rowObj["year"] || values[4] || "3rd Year";
      
      const rawDomains = rowObj["specialist domains"] || rowObj["domains"] || rowObj["specialty"] || values[5] || "";
      const mappedDomains = rawDomains ? rawDomains.split(";").map((d: string) => d.trim()).filter(Boolean) : [];

      const rawLangs = rowObj["linguistic repertoire"] || rowObj["languages"] || rowObj["languages spoken"] || values[6] || "";
      const mappedLanguages = rawLangs ? rawLangs.split(";").map((l: string) => l.trim()).filter(Boolean) : [];

      const rawTier = rowObj["tier"] || values[7] || "1";
      const mappedTier = parseInt(rawTier, 10);
      const finalTier = (mappedTier === 1 || mappedTier === 2 || mappedTier === 3) ? (mappedTier as 1 | 2 | 3) : 1;

      if (!mappedName || !mappedEmail) {
        throw new Error(`Row ${i} is missing Name or Email. These are mandatory fields.`);
      }

      items.push({
        name: mappedName,
        email: mappedEmail,
        college: mappedCollege,
        degree: mappedDegree,
        year_of_study: mappedYear,
        domains: mappedDomains.length > 0 ? mappedDomains : ["General Reasoning"],
        languages: mappedLanguages.length > 0 ? mappedLanguages : ["English"],
        tier: finalTier,
        verification_status: "pending" as const
      });
    }

    return items;
  };

  const handleFileReader = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setImportError("Invalid file type. Please upload a .csv document.");
      setImportPreview([]);
      return;
    }

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSVTextForOnboarding(text);
        if (parsed.length === 0) {
          throw new Error("The uploaded CSV has zero valid data rows under the headers.");
        }
        setImportPreview(parsed);
      } catch (err: any) {
        setImportError(err?.message || "Faulty CSV syntax or missing required values.");
        setImportPreview([]);
      }
    };
    reader.onerror = () => {
      setImportError("Error reading the selected CSV file.");
    };
    reader.readAsText(file);
  };

  // Automatic verification qualification logic & handler
  const getEligibleAutoVerifyContributors = () => {
    return contributors.filter(c => {
      const isUnverified = c.verification_status !== "verified" || c.kyc_status !== "verified";
      const highAccuracy = c.accuracy_score > 90;
      const completedCount = tasks.filter(t => t.assigned_contributor_id === c.id && ["submitted", "in_qa", "approved"].includes(t.status)).length;
      return isUnverified && highAccuracy && completedCount > 5;
    });
  };

  const eligibleAutoVerifyCount = getEligibleAutoVerifyContributors().length;

  const handleBulkAutoVerify = () => {
    const list = getEligibleAutoVerifyContributors();
    if (list.length === 0) {
      alert("No pending/unverified scholars currently meet the threshold: Accuracy > 90% and more than 5 completed tasks.");
      return;
    }

    const confirmVerify = window.confirm(
      `Found ${list.length} candidate(s) who meet the auto-verification rules (Accuracy > 90%, tasks > 5). Would you like to automatically verify all of them now?`
    );
    if (!confirmVerify) return;

    list.forEach(c => {
      onVerifyContributor(c.id, "verified");
    });

    alert(`Successfully bulk auto-verified ${list.length} scholar profiles!`);
  };

  // Create Batch Form States
  const [batchProjId, setBatchProjId] = useState(projects[0]?.id || "P_001");
  const [batchName, setBatchName] = useState("");
  const [batchTier, setBatchTier] = useState<1 | 2 | 3>(1);
  const [batchInstructions, setBatchInstructions] = useState("");
  const [mockPrompt, setMockPrompt] = useState("");
  const [mockResponseA, setMockResponseA] = useState("");
  const [mockResponseB, setMockResponseB] = useState("");

  // Filter tasks in QA or submitted but not yet completely approved
  const tasksInQA = tasks.filter(t => t.status === "in_qa" || t.status === "submitted");
  const pendingContributors = contributors.filter(c => c.verification_status === "pending" || c.kyc_status === "pending");

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !mockPrompt) return;

    const newBatchId = "B_" + Math.floor(Math.random() * 900 + 100);
    const newBatch: TaskBatch = {
      id: newBatchId,
      project_id: batchProjId,
      name: batchName,
      status: "in_progress",
      task_count: 1,
      tier_required: batchTier,
      instructions: batchInstructions,
      rubric_id: "RUB_INDIC_01",
      created_at: new Date().toISOString()
    };

    const isRLHF = projects.find(p => p.id === batchProjId)?.task_types.includes("RLHF") || true;

    const nestedTasks: Task[] = [
      {
        id: "T_" + Math.floor(Math.random() * 900 + 100),
        batch_id: newBatchId,
        status: "unassigned",
        task_type: isRLHF ? "RLHF" : "Indic_Language_Eval",
        content: {
          prompt: mockPrompt,
          response_a: mockResponseA || "AI Generation Option A sample text",
          response_b: mockResponseB || "AI Generation Option B sample text"
        },
        payout_amount: batchTier === 3 ? 500 : batchTier === 2 ? 250 : 120
      }
    ];

    onCreateTaskBatch(newBatch, nestedTasks);
    setBatchName("");
    setBatchInstructions("");
    setMockPrompt("");
    setMockResponseA("");
    setMockResponseB("");
    alert(`Task Batch ${newBatchId} successfully deployed across Indian scholar feeds matching requirements!`);
  };

  const handleAuditorReviewSubmit = (choice: "A" | "B") => {
    if (!selectedQAId) return;
    onQAOverride(selectedQAId, choice, qaNotesText || "Audited and verified by senior QC analyst.");
    setSelectedQAId(null);
    setQaNotesText("");
    alert(`Task audit successfully submitted. Contributor's pending balance has cleared to active wallet.`);
  };

  const selectedQAItem = tasks.find(t => t.id === selectedQAId);
  const qaSumbittedContributor = selectedQAItem ? contributors.find(c => c.id === selectedQAItem.assigned_contributor_id) : null;
  const qaContributorUser = qaSumbittedContributor ? customers.find(u => u.id === qaSumbittedContributor.user_id) : null;

  const activeContributor = contributors.find(c => c.id === selectedContributorId);
  const activeContributorUser = activeContributor 
    ? (customers.find(u => u.id === activeContributor.user_id) || { name: "Guest Scholar", email: "guest@g.ac.in" })
    : null;

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-brand-charcoal px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-amber text-white px-2 py-0.5 rounded font-black font-mono text-sm">2UNE</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Operations Console</h1>
            <p className="text-[10px] text-brand-slate uppercase font-mono tracking-wider">Access Scope: Platform Admin Partner — {user.name}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="text-xs hover:text-brand-red bg-white/5 hover:bg-brand-red/10 border border-white/10 px-3 py-1.5 rounded-lg font-mono transition-all"
        >
          LOG OUT ADMIN PORTAL
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-brand-charcoal/30 border-r border-white/5 p-4 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab("command")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "command" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Activity size={14} />
            COMMAND CENTER
          </button>
          
          <button 
            onClick={() => setActiveTab("customers")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "customers" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Users size={14} />
            CUSTOMER MGT
          </button>

          <button 
            onClick={() => setActiveTab("projects")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "projects" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Layers size={14} />
            BATCH PIPELINE CONFIG
          </button>

          <button 
            onClick={() => setActiveTab("workforce")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "workforce" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <ShieldCheck size={14} />
            WORKSPACE KYC VERIFICATIONS ({pendingContributors.length})
          </button>

          <button 
            onClick={() => setActiveTab("qc")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "qc" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Sliders size={14} />
            QA AUDITOR QUEUE ({tasksInQA.length})
          </button>

          <button 
            onClick={() => setActiveTab("payments")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "payments" ? "bg-brand-amber text-white font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <CreditCard size={14} />
            PAYMENT SETTLEMENTS
          </button>
        </aside>

        {/* Content Dashboard */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* HIGH-LEVEL SUMMARY DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Metric 1: Total Pending KYC */}
            <div className="bg-brand-charcoal border border-brand-amber/20 hover:border-brand-amber/40 transition-all p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(245,158,11,0.02)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/5 rounded-full blur-3xl group-hover:bg-brand-amber/10 transition-all"></div>
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-mono font-bold text-brand-slate uppercase tracking-wider block">Total Pending KYC</span>
                <div className="text-3xl font-black font-sans tracking-tight text-brand-amber">{pendingContributors.length}</div>
                <span className="text-[10px] font-mono text-brand-slate block">Awaiting credential review</span>
              </div>
              <div className="p-3 bg-brand-amber/10 text-brand-amber rounded-xl relative z-10">
                <ShieldAlert size={20} />
              </div>
            </div>

            {/* Metric 2: Active Contributors Count */}
            <div className="bg-brand-charcoal border border-white/5 hover:border-brand-green/35 transition-all p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(52,211,153,0.01)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl group-hover:bg-brand-green/10 transition-all"></div>
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-mono font-bold text-brand-slate uppercase tracking-wider block">Active Contributors Count</span>
                <div className="text-3xl font-black font-sans tracking-tight text-brand-green">
                  {contributors.filter(c => c.verification_status === "verified").length}
                </div>
                <span className="text-[10px] font-mono text-brand-slate block">Fully vetted & certified scholars</span>
              </div>
              <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl relative z-10">
                <UserCheck size={20} />
              </div>
            </div>

            {/* Metric 3: Monthly Earnings Dispatched */}
            <div className="bg-brand-charcoal border border-white/5 hover:border-brand-teal/35 transition-all p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(20,184,166,0.01)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl group-hover:bg-brand-teal/10 transition-all"></div>
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-mono font-bold text-brand-slate uppercase tracking-wider block">Monthly Earnings Dispatched</span>
                <div className="text-3xl font-black font-sans tracking-tight text-white">
                  ₹{payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] font-mono text-brand-slate block">Released to scholar bank/UPI nodes</span>
              </div>
              <div className="p-3 bg-white/5 text-brand-slate group-hover:text-white rounded-xl relative z-10 transition-all">
                <Coins size={20} />
              </div>
            </div>
          </div>

          {/* COMMAND CENTER */}
          {activeTab === "command" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">SYSTEM ACTIVE JOBS</div>
                  <div className="text-xl font-extrabold text-white mt-1">11</div>
                </div>
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">TOTAL INGESTED TASKS</div>
                  <div className="text-xl font-extrabold text-brand-green mt-1">{tasks.length}</div>
                </div>
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">SCHOLARS ENGAGED (TOTAL)</div>
                  <div className="text-xl font-extrabold text-white mt-1">{contributors.length}</div>
                </div>
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">AVG ACCURACY RATING</div>
                  <div className="text-xl font-extrabold text-brand-green mt-1">94.8%</div>
                </div>
              </div>

              {/* Alert Logs Terminal */}
              <div className="bg-black/80 border border-brand-amber/20 p-5 rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-brand-amber text-xs font-mono font-bold">
                    <Terminal size={14} />
                    SYSTEM WORKSPACE AUDIT LOGS — CLOUD ACTIVE
                  </div>
                  <span className="text-[10px] text-brand-slate font-mono">UTC MONITORING ACTIVE</span>
                </div>

                <div className="space-y-2 font-mono text-xs text-brand-slate">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <span className="text-brand-amber text-[10px]">{log.timestamp}</span>
                      <span className="text-brand-green">[{log.role}]</span>
                      <span className="text-white">{log.action}</span>
                      <span className="ml-auto text-brand-slate text-[10px]">{log.ip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Charts or lists overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-4">Active Enterprises Alignment</h3>
                  <div className="space-y-3">
                    {orgs.map(org => {
                      const specProjectsCount = projects.filter(p => p.org_id === org.id).length;
                      return (
                        <div key={org.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-bold text-white">{org.name}</h4>
                            <p className="text-[10px] text-brand-slate mt-0.5">{org.industry}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-white font-bold">{org.contract_type.replace("_", " ")}</span>
                            <div className="text-[10px] text-brand-slate mt-1">{specProjectsCount} project rosters</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-4">QA Auditor Flag Alerts</h3>
                  <div className="space-y-3">
                    {tasksInQA.length === 0 ? (
                      <div className="py-8 text-center text-brand-slate text-xs">
                        All clear. Zero outlier low agreement task blocks detected.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasksInQA.map(t => (
                          <div key={t.id} className="p-3 bg-brand-red/5 border border-brand-red/10 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <span className="text-[9px] font-mono text-brand-red font-bold">REASON: CONSENSUS DIALECT DEVIATION</span>
                              <h4 className="font-bold text-white mt-1 truncate max-w-xs">{t.content.prompt}</h4>
                            </div>
                            <button 
                              onClick={() => { setSelectedQAId(t.id); setActiveTab("qc"); }}
                              className="bg-brand-red text-white py-1 px-2.5 rounded text-[10px] font-bold"
                            >
                              AUDIT
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER MANAGEMENT */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-sm mb-4">Active Customer Accounts</h3>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-brand-slate uppercase">
                        <th className="pb-3">Company Name</th>
                        <th className="pb-3">Industry Area</th>
                        <th className="pb-3">Lead PM Account</th>
                        <th className="pb-3">Contract Type</th>
                        <th className="pb-3 text-right">Operational Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-brand-slate">
                      {orgs.map((org) => (
                        <tr key={org.id}>
                          <td className="py-3 font-bold text-white">{org.name}</td>
                          <td className="py-3">{org.industry}</td>
                          <td className="py-3 text-brand-green font-bold">Arjun Mehta</td>
                          <td className="py-3 uppercase">{org.contract_type.replace("_", " ")}</td>
                          <td className="py-3 text-right">
                            <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded text-[9px] font-bold">
                              {org.status.toUpperCase()}
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

          {/* PROJECTS & BATCH MANAGER */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              {/* Form to submit project batch */}
              <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-brand-amber flex items-center gap-2">
                  <Layers2 size={16} />
                  Initiate New Regional Task Batch
                </h3>
                <p className="text-xs text-brand-slate mt-1">Configure the layout variables, choose matching academic tier constraints, and write custom evaluation instructions.</p>

                <form onSubmit={handleCreateBatchSubmit} className="mt-6 space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">TARGET PROJECT ROSTER</label>
                      <select 
                        value={batchProjId} onChange={(e) => setBatchProjId(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">BATCH REFERENCE NAME</label>
                      <input 
                        type="text" required placeholder="e.g. Bengali Audio Dialect Batch v1"
                        value={batchName} onChange={(e) => setBatchName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">SCHOLAR TIER CONSTRAINT</label>
                      <select 
                        value={batchTier} onChange={(e) => setBatchTier(parseInt(e.target.value) as any)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                      >
                        <option value={1}>Tier 1 (Undergrad general reasoning)</option>
                        <option value={2}>Tier 2 (CS Coder reasoning)</option>
                        <option value={3}>Tier 3 (Ph.D. red team auditors)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-brand-slate font-bold mb-1">SPECIFIC TASK INSTRUCTIONS FOR CONTRIBUTOR</label>
                    <input 
                      type="text" required placeholder="Outline evaluation rubrics, specific linguistic slang exceptions etc."
                      value={batchInstructions} onChange={(e) => setBatchInstructions(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-brand-amber font-mono font-bold tracking-wider">Ingest Task Model Payload</h4>
                    
                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">EVALUATION PROMPT</label>
                      <input 
                        type="text" required placeholder="e.g. Translate PM Kisan scheme directly to Marathi"
                        value={mockPrompt} onChange={(e) => setMockPrompt(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-brand-slate font-bold mb-1">AI MODEL RESPONSE OPTION A</label>
                        <textarea 
                          rows={3} placeholder="Model's generated text option A..."
                          value={mockResponseA} onChange={(e) => setMockResponseA(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-brand-slate font-bold mb-1">AI MODEL RESPONSE OPTION B (OPTIONAL)</label>
                        <textarea 
                          rows={3} placeholder="Model's generated text option B..."
                          value={mockResponseB} onChange={(e) => setMockResponseB(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-brand-amber text-white font-bold font-mono text-xs py-3 px-6 rounded-lg hover:bg-brand-amber/80 transition-all flex items-center gap-2"
                  >
                    DEPLOY TASK BATCH TO PIPELINE
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* WORKFORCE MANAGER */}
          {activeTab === "workforce" && (
            <div className="space-y-6">
              {/* Sub tabs for workforce */}
              <div className="flex border-b border-white/5 justify-between items-center pr-2 flex-wrap gap-2">
                <div className="flex">
                  <button 
                    onClick={() => setWorkforceSubTab("queue")}
                    className={`px-4 py-3 text-xs font-mono border-b-2 transition-all flex items-center gap-2 ${workforceSubTab === "queue" ? "border-brand-amber text-brand-amber font-bold" : "border-transparent text-brand-slate hover:text-white"}`}
                  >
                    <ShieldCheck size={13} />
                    KYC PENDING QUEUE ({pendingContributors.length})
                  </button>
                  <button 
                    onClick={() => setWorkforceSubTab("directory")}
                    className={`px-4 py-3 text-xs font-mono border-b-2 transition-all flex items-center gap-2 ${workforceSubTab === "directory" ? "border-brand-amber text-brand-amber font-bold" : "border-transparent text-brand-slate hover:text-white"}`}
                  >
                    <Users size={13} />
                    ACTIVE SCHOLAR DIRECTORY ({contributors.length})
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => setShowImportCohort(!showImportCohort)}
                    className={`border px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showImportCohort
                        ? "bg-brand-amber text-black border-brand-amber"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    <Upload size={13} />
                    IMPORT COHORT (CSV)
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="bg-brand-amber/10 border border-brand-amber/20 hover:bg-brand-amber hover:text-black text-brand-amber px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    EXPORT CSV REPORT
                  </button>
                </div>
              </div>

              {/* COHORT CSV UPLOAD DRAG-AND-DROP PANEL */}
              {showImportCohort && (
                <div className="bg-brand-charcoal border border-brand-amber/30 rounded-2xl p-6 space-y-4 shadow-[0_4px_30px_rgba(245,158,11,0.03)] animate-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Upload size={16} className="text-brand-amber" />
                        Onboard New Scholar Cohort via CSV
                      </h3>
                      <p className="text-[11px] text-brand-slate mt-0.5">
                        Bulk create fully configured scholar nodes and contributor user accounts.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-white/5 border border-white/10 hover:border-brand-amber/30 text-[10px] font-mono hover:text-brand-amber font-normal px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      Download .CSV Template
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  {importPreview.length === 0 ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setCsvDragOver(true);
                      }}
                      onDragLeave={() => setCsvDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setCsvDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileReader(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
                        csvDragOver
                          ? "border-brand-amber bg-brand-amber/[0.03] shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                          : "border-white/10 hover:border-brand-amber/30 bg-white/[0.01]"
                      }`}
                    >
                      <input
                        type="file"
                        id="csv-file-onboarding"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileReader(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="csv-file-onboarding" className="cursor-pointer block space-y-3">
                        <div className="mx-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-slate group-hover:text-brand-amber transition-colors">
                          <Upload size={18} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">
                            Drag & drop your cohort CSV file here, or <span className="text-brand-amber hover:underline">browse files</span>
                          </p>
                          <p className="text-[10px] text-brand-slate">
                            Supports .csv with headers: Name, Email, College/University, Degree, Year of Study, Specialist Domains, Linguistic Repertoire, Tier
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : null}

                  {importError && (
                    <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs rounded-xl flex items-start gap-2.5">
                      <div className="mt-0.5">⚠️</div>
                      <div>
                        <div className="font-bold">Parsing Error Detected</div>
                        <p className="text-[11px] text-brand-red/80 mt-0.5">{importError}</p>
                      </div>
                    </div>
                  )}

                  {/* Previewing Parsed Rows */}
                  {importPreview.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-xs font-mono font-bold text-brand-green">
                          ✓ Successfully parsed {importPreview.length} scholar records
                        </span>
                        <button
                          onClick={() => {
                            setImportPreview([]);
                            setImportError(null);
                          }}
                          className="text-[10px] font-mono text-brand-slate hover:text-white underline cursor-pointer"
                        >
                          Clear & Reset
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-white/5 rounded-xl max-h-64 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01] font-mono text-brand-slate text-[9px] uppercase tracking-wider">
                              <th className="p-2.5">Scholar Name</th>
                              <th className="p-2.5">Email ADDRESS</th>
                              <th className="p-2.5">Affiliation</th>
                              <th className="p-2.5">Domains</th>
                              <th className="p-2.5 font-center">Tier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {importPreview.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] text-white">
                                <td className="p-2.5 font-bold">{item.name}</td>
                                <td className="p-2.5 text-brand-slate font-mono">{item.email}</td>
                                <td className="p-2.5 text-brand-slate">
                                  {item.college} ({item.degree} • {item.year_of_study})
                                </td>
                                <td className="p-2.5 text-brand-amber">
                                  {item.domains.join(", ")}
                                </td>
                                <td className="p-2.5 font-bold">
                                  <span className="bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-1.5 py-0.5 rounded font-mono text-[9px]">
                                    Tier {item.tier}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => {
                            setImportPreview([]);
                            setImportError(null);
                          }}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onImportContributors) {
                              onImportContributors(importPreview);
                              alert(`Successfully onboarded cohort of ${importPreview.length} scholars! Accounts have been generated with 'pending' KYC status.`);
                              setImportPreview([]);
                              setImportError(null);
                              setShowImportCohort(false);
                            } else {
                              alert("Import callback is not configured.");
                            }
                          }}
                          className="bg-brand-green text-black hover:bg-brand-green/85 font-mono text-xs font-black px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-pointer"
                        >
                          <Check size={14} className="stroke-[3px]" />
                          CONFIRM ONBOARDING ({importPreview.length})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {workforceSubTab === "queue" && (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-bold text-sm text-white">Academic KYC Verifications Queue</h3>
                      <p className="text-[11px] text-brand-slate mt-0.5">Clear outstanding KYC dossiers manually or via automations.</p>
                    </div>
                    <button
                      onClick={handleBulkAutoVerify}
                      className="bg-brand-amber/10 border border-brand-amber/35 text-brand-amber hover:bg-brand-amber hover:text-black font-mono text-[11px] font-black px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.02)] cursor-pointer"
                      title="Auto-approves scholars with Accuracy > 90% and > 5 completed tasks"
                    >
                      <Sparkles size={13} className="animate-pulse" />
                      BULK AUTO-VERIFY ({eligibleAutoVerifyCount} QUALIFIED)
                    </button>
                  </div>
                  
                  {pendingContributors.length === 0 ? (
                    <div className="py-12 text-center text-xs text-brand-slate block">
                      <CheckCircle className="text-brand-green mx-auto mb-2 font-bold" />
                      No pending verifications currently. Let's register a new student application from the home wizard to test!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Bulk Select & Verify Action Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-4 gap-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            id="bulk-select-all-queue"
                            checked={pendingContributors.length > 0 && pendingContributors.every(c => selectedBulkIds.includes(c.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const pendingIds = pendingContributors.map(c => c.id);
                                setSelectedBulkIds(prev => Array.from(new Set([...prev, ...pendingIds])));
                              } else {
                                const pendingIds = pendingContributors.map(c => c.id);
                                setSelectedBulkIds(prev => prev.filter(id => !pendingIds.includes(id)));
                              }
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-brand-black text-brand-amber focus:ring-1 focus:ring-brand-amber/30 cursor-pointer"
                          />
                          <label htmlFor="bulk-select-all-queue" className="text-xs font-mono text-brand-slate cursor-pointer select-none font-bold">
                            SELECT ALL PENDING ({pendingContributors.length})
                          </label>
                        </div>
                        
                        {selectedBulkIds.some(id => pendingContributors.some(c => c.id === id)) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button 
                              onClick={handleBulkVerify}
                              className="bg-brand-green text-black hover:bg-brand-green/85 font-mono text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-pointer"
                            >
                              <Check size={14} className="stroke-[3px]" />
                              BULK VERIFY SELECTED ({selectedBulkIds.filter(id => pendingContributors.some(c => c.id === id)).length})
                            </button>
                            <button 
                              onClick={handleBulkDelete}
                              className="bg-brand-red/15 border border-brand-red/25 text-brand-red hover:bg-brand-red hover:text-white font-mono text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                            >
                              <Trash2 size={14} />
                              DELETE SELECTED ({selectedBulkIds.filter(id => pendingContributors.some(c => c.id === id)).length})
                            </button>
                          </div>
                        )}
                      </div>

                      {pendingContributors.map((contrib) => {
                        const specUser = customers.find(u => u.id === contrib.user_id) || { name: "Guest Candidate", email: "guest@g.ac.in" };
                        const isChecked = selectedBulkIds.includes(contrib.id);
                        return (
                          <div 
                            key={contrib.id} 
                            onClick={() => setSelectedContributorId(contrib.id)}
                            className={`p-5 bg-white/[0.02] hover:bg-white/[0.05] border rounded-xl flex flex-col md:flex-row justify-between gap-4 cursor-pointer transition-all duration-200 ${
                              isChecked ? "border-brand-amber/40 bg-brand-amber/[0.02]" : "border-white/5 hover:border-brand-amber/30"
                            }`}
                          >
                            <div className="flex gap-4 items-start">
                              <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setSelectedBulkIds(prev => 
                                      e.target.checked 
                                        ? [...prev, contrib.id] 
                                        : prev.filter(id => id !== contrib.id)
                                    );
                                  }}
                                  className="w-4 h-4 rounded border-white/10 bg-brand-black text-brand-amber focus:ring-1 focus:ring-brand-amber/30 cursor-pointer"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono bg-white/5 text-brand-slate px-2 py-0.5 rounded border border-white/10">CONTRIBUTOR ID: {contrib.id}</span>
                                  <span className="text-[9px] font-mono bg-brand-amber/15 text-brand-amber px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">INSPECT Row Click</span>
                                </div>
                                <div className="text-sm font-bold text-white transition-all">{specUser.name} — {contrib.college}</div>
                                <div className="text-xs text-brand-slate">{contrib.degree} • Study domain: {contrib.domains.join(", ")}</div>
                                <div className="text-[11px] text-brand-amber font-mono font-bold bg-brand-amber/5 border border-brand-amber/15 p-2 rounded max-w-sm">
                                  DEMO IDENTITY KEY: Aadhaar Linked Card, UPI set
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center justify-end">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerifyContributor(contrib.id, "failed");
                                }}
                                className="bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-3 py-1.5 rounded text-xs font-mono font-bold transition-all animate-none"
                              >
                                DECLINE
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerifyContributor(contrib.id, "verified");
                                  alert("Student Aadhaar credentials verified successfully! Vetted access issued.");
                                }}
                                className="bg-brand-green/20 border border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-black px-4 py-1.5 rounded text-xs font-mono font-bold transition-all"
                              >
                                APPROVE VERIFICATION
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {workforceSubTab === "directory" && (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-sm">Vetted Scholar Network</h3>
                      <p className="text-[11px] text-brand-slate">Directory of academic talent actively handling preference RLHF tuning and model evaluations.</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {selectedBulkIds.some(id => contributors.some(c => c.id === id && (c.verification_status === "pending" || c.kyc_status === "pending"))) && (
                        <button 
                          onClick={handleBulkVerify}
                          className="bg-brand-green text-black hover:bg-brand-green/85 font-mono text-xs font-black px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.15)] cursor-pointer"
                        >
                          <Check size={13} className="stroke-[3px]" />
                          BULK VERIFY PENDING ({selectedBulkIds.filter(id => {
                            const c = contributors.find(item => item.id === id);
                            return c && (c.verification_status === "pending" || c.kyc_status === "pending");
                          }).length})
                        </button>
                      )}
                      
                      {selectedBulkIds.length > 0 && (
                        <button 
                          onClick={handleBulkDelete}
                          className="bg-brand-red/15 border border-brand-red/25 text-brand-red hover:bg-brand-red hover:text-white font-mono text-xs font-black px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                        >
                          <Trash2 size={13} />
                          DELETE SELECTED ({selectedBulkIds.length})
                        </button>
                      )}

                      <span className="text-[11px] font-mono text-brand-slate bg-white/5 px-2.5 py-1 rounded">Total Roster: {contributors.length} Experts</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-mono text-brand-slate uppercase tracking-wider">
                          <th className="pb-3 px-4 w-10">
                            <input 
                              type="checkbox"
                              checked={contributors.length > 0 && contributors.every(c => selectedBulkIds.includes(c.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBulkIds(contributors.map(c => c.id));
                                } else {
                                  setSelectedBulkIds([]);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-white/10 bg-brand-black text-brand-amber focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                          </th>
                          <th className="pb-3 px-4">Scholar Name</th>
                          <th className="pb-3 px-4">Academic Affiliation</th>
                          <th className="pb-3 px-4">Specialist Domains</th>
                          <th className="pb-3 px-4 text-center">Tier Level</th>
                          <th className="pb-3 px-4 text-center">Quality Score</th>
                          <th className="pb-3 px-4 text-right">IAA Index</th>
                          <th className="pb-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {contributors.map((contrib) => {
                          const specUser = customers.find(u => u.id === contrib.user_id) || { name: "Guest Candidate", email: "guest@g.ac.in" };
                          const isPending = contrib.verification_status === "pending" || contrib.kyc_status === "pending";
                          const isChecked = selectedBulkIds.includes(contrib.id);
                          return (
                            <tr 
                              key={contrib.id}
                              onClick={() => setSelectedContributorId(contrib.id)}
                              className={`hover:bg-white/[0.02] cursor-pointer group transition-all ${
                                isChecked ? "bg-brand-amber/[0.02]" : ""
                              }`}
                            >
                              <td className="py-4 px-4 w-10" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setSelectedBulkIds(prev => 
                                      e.target.checked 
                                        ? [...prev, contrib.id] 
                                        : prev.filter(id => id !== contrib.id)
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded border-white/10 bg-brand-black text-brand-amber focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-bold text-white group-hover:text-brand-amber transition-all flex items-center gap-1.5">
                                  {specUser.name}
                                  {isPending && (
                                    <span className="text-[8px] bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase animate-pulse">KYC PENDING</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-brand-slate font-mono mt-0.5">{specUser.email}</div>
                              </td>
                              <td className="py-4 px-4 text-brand-slate border-l-0">
                                <div className="text-white text-xs">{contrib.college}</div>
                                <div className="text-[10px] mt-0.5">{contrib.degree}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {contrib.domains.slice(0, 2).map((dom, idx) => (
                                    <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] text-brand-slate">
                                      {dom}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  contrib.tier === 3 ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/15" :
                                  contrib.tier === 2 ? "bg-brand-amber/10 text-brand-amber border border-brand-amber/15" :
                                  "bg-white/10 text-brand-slate border border-white/5"
                                }`}>
                                  TIER {contrib.tier}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center font-mono text-brand-green font-bold">
                                {contrib.accuracy_score}%
                              </td>
                              <td className="py-4 px-4 text-right font-mono text-white">
                                {contrib.iaa_score.toFixed(2)}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContributorId(contrib.id);
                                  }}
                                  className="text-[10px] font-mono bg-white/5 hover:bg-brand-amber/10 text-brand-slate hover:text-brand-amber border border-white/10 hover:border-brand-amber/30 px-3 py-1.5 rounded transition-all"
                                >
                                  INSPECT PROFILE
                                </button>
                              </td>
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

          {/* QA AUDITOR REVIEW QUEUE */}
          {activeTab === "qc" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Outliner task ticket column */}
                <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm">Target Outlier Flag list ({tasksInQA.length})</h3>
                  <div className="space-y-2">
                    {tasksInQA.length === 0 ? (
                      <div className="py-8 text-center text-xs text-brand-slate">
                        Consensus rating stable. Zero tickets in queue!
                      </div>
                    ) : (
                      tasksInQA.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setSelectedQAId(t.id); setQaNotesText(""); }}
                          className={`w-full text-left p-3 rounded-xl border block transition-all ${
                            selectedQAId === t.id 
                              ? "bg-brand-amber/10 border-brand-amber text-white" 
                              : "bg-black/20 border-white/5 hover:border-white/10 text-brand-slate"
                          }`}
                        >
                          <div className="flex justify-between text-[9px] font-mono mb-1">
                            <span>ID: {t.id}</span>
                            <span className="text-brand-red font-bold">QA FLAG</span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{t.content.prompt}</div>
                          <div className="text-[9px] text-brand-slate mt-1 uppercase">Batch: {t.batch_id} • Payout: ₹{t.payout_amount}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Main comparison dashboard work column */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedQAItem ? (
                    <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-5">
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-brand-slate">CONCURRENCY CONFLICT AUDIT</span>
                          <h3 className="text-base font-bold text-white mt-1">Reviewing Ticket {selectedQAItem.id}</h3>
                        </div>
                        <span className="text-xs font-mono text-brand-green font-bold">
                          Assigned: {qaContributorUser?.name || "Anonymous Scholar"} ({qaSumbittedContributor?.college})
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-brand-slate font-bold font-mono uppercase">PROMPT PROCESSED</span>
                        <blockquote className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs italic text-brand-slate">
                          {selectedQAItem.content.prompt}
                        </blockquote>
                      </div>

                      {/* Display side-by-side prompt choices if RLHF */}
                      {selectedQAItem.task_type === "RLHF" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                            <span className="text-[9px] font-mono text-brand-slate uppercase block mb-2">GENERATION OPTION A</span>
                            <p className="text-brand-slate whitespace-pre-wrap">{selectedQAItem.content.response_a}</p>
                          </div>
                          <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                            <span className="text-[9px] font-mono text-brand-slate uppercase block mb-2">GENERATION OPTION B</span>
                            <p className="text-brand-slate whitespace-pre-wrap">{selectedQAItem.content.response_b}</p>
                          </div>
                        </div>
                      )}

                      {/* Contributor's response ratings and qualitative justifications */}
                      <div className="p-4 bg-white/[0.02] border-l-2 border-brand-amber rounded-r space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-brand-amber font-bold">SCHOLAR RATING COMPILATION:</span>
                          {selectedQAItem.response?.preferred_response && (
                            <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded">
                              Preferred Choice: {selectedQAItem.response.preferred_response}
                            </span>
                          )}
                        </div>

                        {selectedQAItem.response?.justification ? (
                          <p className="text-xs text-white leading-relaxed font-sans mt-2 italic bg-black/20 p-3 rounded-lg border border-white/5">
                            "{selectedQAItem.response.justification}"
                          </p>
                        ) : (
                          <p className="text-xs text-brand-slate italic mt-2">Justification not provided.</p>
                        )}
                      </div>

                      {/* Override controller */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div>
                          <label className="block text-[10px] text-brand-slate font-bold font-mono tracking-wider mb-2">
                            QA OVERRIDE NOTES / INSTRUCTIONS FOR OUTCOMING DELIVERABLE (REQUIRED)
                          </label>
                          <textarea 
                            rows={3}
                            placeholder="State technical basis for QA approval/override. Example: Verified factual correct indices after physical textbook inspection..."
                            value={qaNotesText}
                            onChange={(e) => setQaNotesText(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs outline-none focus:border-brand-amber"
                          />
                        </div>

                        <div className="flex justify-end gap-3 font-mono">
                          <button 
                            onClick={() => handleAuditorReviewSubmit("A")}
                            className="bg-brand-green text-black font-bold text-xs px-4 py-2 rounded-lg"
                          >
                            OVERRIDE & APPROVE OPTION A
                          </button>
                          <button 
                            onClick={() => handleAuditorReviewSubmit("B")}
                            className="bg-brand-teal text-white font-bold text-xs px-4 py-2 rounded-lg"
                          >
                            OVERRIDE & APPROVE OPTION B
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 bg-brand-charcoal border border-white/5 text-center text-brand-slate text-xs rounded-2xl block">
                      Select a consensus flag ticket from the left sidebar columns to audit response indices.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* PAYMENT SETTLEMENTS */}
          {activeTab === "payments" && (
            <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-sm">Weekly Indian Payout Settlements</h3>
              <p className="text-xs text-brand-slate">Bulk check and sign off weekly Indian Scholar Rupees (INR) deposits transferred seamlessly via bank transfer.</p>

              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-brand-slate uppercase">
                      <th className="pb-3">Reference ID</th>
                      <th className="pb-3 text-sans">Vetted Scholar Name</th>
                      <th className="pb-3">Transfer Amount (INR)</th>
                      <th className="pb-3">Verification ID</th>
                      <th className="pb-3 text-right">Action status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-brand-slate">
                    {payments.map((pay) => {
                      const specContrib = contributors.find(c => c.id === pay.contributor_id);
                      const specUserObj = specContrib ? customers.find(u => u.id === specContrib.user_id) : null;
                      return (
                        <tr key={pay.id}>
                          <td className="py-3 font-bold text-white">{pay.id}</td>
                          <td className="py-3 font-sans text-white">{specUserObj?.name || "Anonymous Scholar"}</td>
                          <td className="py-3 font-bold text-brand-green">₹{pay.amount}</td>
                          <td className="py-3 font-mono">{specContrib?.bank_details.upi_id || "Direct Transfer code"}</td>
                          <td className="py-3 text-right">
                            {pay.status === "processing" || pay.status === "pending" ? (
                              <button 
                                onClick={() => {
                                  onApprovePayment(pay.id);
                                  alert(`Transfer reference ${pay.id} for ₹${pay.amount} cleared to processing gateway.`);
                                }}
                                className="bg-brand-green text-black px-4 py-1 rounded text-[10px] font-bold font-mono uppercase"
                              >
                                APPROVE TRANSFER
                              </button>
                            ) : (
                              <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                {pay.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL COMPONENT FOR INDIVIDUAL CONTRIBUTOR DETAILS */}
      {selectedContributorId && activeContributor && activeContributorUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedContributorId(null)}
        >
          <div 
            className="bg-[#0f0f0f] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#121212] border-b border-white/5 p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-brand-amber/15 border border-brand-amber/30 p-2.5 rounded-xl text-brand-amber">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    {activeContributorUser.name}
                    <span className="text-[9px] font-mono bg-white/5 text-brand-slate px-2 py-0.5 rounded border border-white/10">ID: {activeContributor.id}</span>
                  </h3>
                  <p className="text-[10px] text-brand-slate font-mono uppercase tracking-wider">{activeContributorUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedContributorId(null)}
                className="text-brand-slate hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Verification Status & Tier Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-brand-slate uppercase block tracking-wider">Academic Placement</span>
                    <span className={`text-xs font-bold font-mono tracking-wide mt-1 inline-block ${
                      activeContributor.tier === 3 ? "text-brand-teal" :
                      activeContributor.tier === 2 ? "text-brand-amber" :
                      "text-white"
                    }`}>
                      TIER {activeContributor.tier} — {
                        activeContributor.tier === 3 ? "Ph.D. Red Teaming Expert" :
                        activeContributor.tier === 2 ? "CS & Coder Reasoning Scholar" :
                        "Undergrad Reasoning Specialist"
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-brand-slate uppercase block tracking-wider">KYC Status</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold mt-1 uppercase ${
                      activeContributor.verification_status === "verified" ? "text-brand-green" :
                      activeContributor.verification_status === "failed" ? "text-brand-red" :
                      "text-brand-amber"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeContributor.verification_status === "verified" ? "bg-brand-green" :
                        activeContributor.verification_status === "failed" ? "bg-brand-red" :
                        "bg-brand-amber animate-pulse"
                      }`} />
                      {activeContributor.verification_status}
                    </span>
                  </div>
                  {/* If pending, let admins approve directly inside modal */}
                  {(activeContributor.verification_status === "pending" || activeContributor.kyc_status === "pending") && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          onVerifyContributor(activeContributor.id, "failed");
                          setSelectedContributorId(null);
                          alert("Applicant declined.");
                        }}
                        className="bg-brand-red/15 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/20 px-2 py-1 rounded text-[10px] font-mono font-bold transition-all"
                      >
                        DECLINE
                      </button>
                      <button 
                        onClick={() => {
                          onVerifyContributor(activeContributor.id, "verified");
                          setSelectedContributorId(null);
                          alert("Student Aadhaar credentials verified successfully!");
                        }}
                        className="bg-brand-green/20 hover:bg-brand-green text-brand-green hover:text-black border border-brand-green/30 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all"
                      >
                        APPROVE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* College & Specializations Block */}
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold font-mono text-brand-amber tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <BookOpen size={13} />
                  Academic Credentials & Domain Roster
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-brand-slate text-[10px] uppercase font-mono block">INSTITUTION</span>
                    <p className="font-bold text-white text-sm mt-0.5">{activeContributor.college}</p>
                    <span className="text-brand-slate text-[10px] uppercase font-mono block mt-3">PROGRAM OF STUDY</span>
                    <p className="font-medium text-white/90 mt-0.5">{activeContributor.degree} ({activeContributor.year_of_study})</p>
                  </div>
                  <div>
                    <span className="text-brand-slate text-[10px] uppercase font-mono block">VETTED EXCELLENCE SPECIALISMS</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeContributor.domains.map((dom, idx) => (
                        <span key={idx} className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 text-[#a78bfa] px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {dom}
                        </span>
                      ))}
                    </div>
                    <span className="text-brand-slate text-[10px] uppercase font-mono block mt-3">LINGUISTIC REPERTOIRE</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeContributor.languages.map((lang, idx) => (
                        <span key={idx} className="bg-brand-green/5 border border-brand-green/15 text-brand-green px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Scores Section (Displays full academic and skill score data) */}
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold font-mono text-brand-amber tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Award size={13} />
                  Vetted Skill Assessment Matrix (0-100 Gauge)
                </h4>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* Reasoning Skill Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-medium">Cognitive Reasoning</span>
                      <span className="text-[#a78bfa] font-bold">{activeContributor.skill_scores.reasoning}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a78bfa] rounded-full" style={{ width: `${activeContributor.skill_scores.reasoning}%` }} />
                    </div>
                  </div>

                  {/* Language/Linguistic Capability */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-medium">Regional Dialect Fluency</span>
                      <span className="text-brand-green font-bold">{activeContributor.skill_scores.language}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: `${activeContributor.skill_scores.language}%` }} />
                    </div>
                  </div>

                  {/* Domain Expertise Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-medium">Subject Domain Specialism</span>
                      <span className="text-[#6366f1] font-bold">{activeContributor.skill_scores.domain}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6366f1] rounded-full" style={{ width: `${activeContributor.skill_scores.domain}%` }} />
                    </div>
                  </div>

                  {/* Coding rigor Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-medium">Algorithmic Coding Rigor</span>
                      <span className="text-[#fb7185] font-bold">{activeContributor.skill_scores.coding}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#fb7185] rounded-full" style={{ width: `${activeContributor.skill_scores.coding}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Output & Agreement Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-brand-slate uppercase block">Consensus Accuracy</span>
                  <span className="text-lg font-bold text-brand-green mt-1 block font-mono">{activeContributor.accuracy_score}%</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-brand-slate uppercase block">Completion Rate</span>
                  <span className="text-lg font-bold text-white mt-1 block font-mono">{activeContributor.completion_rate}%</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-brand-slate uppercase block">IAA Agreement Ratio</span>
                  <span className="text-lg font-bold text-brand-teal mt-1 block font-mono">{activeContributor.iaa_score.toFixed(2)}</span>
                </div>
              </div>

              {/* Banking and UPI Disbursement Profile */}
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold font-mono text-brand-slate tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <CreditCard size={13} />
                  Unified Payments Interface (UPI) & Wallet
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-brand-slate text-[9px] uppercase">Registered ID String</span>
                    <p className="font-bold text-white mt-0.5">{activeContributor.bank_details.upi_id || "unlinked"}</p>
                  </div>
                  <div>
                    <span className="text-brand-slate text-[9px] uppercase">Account holder</span>
                    <p className="text-white mt-0.5 truncate">{activeContributor.bank_details.holder_name || activeContributorUser.name}</p>
                  </div>
                  <div>
                    <span className="text-brand-slate text-[9px] uppercase">Active commitment</span>
                    <p className="text-brand-green font-bold mt-0.5">{activeContributor.availability_hours} hours / week</p>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center text-xs border-t border-white/5 font-mono">
                  <div>
                    <span className="text-brand-slate text-[9px] block">TOTAL LIFETIME PAYOUT COMPLETED</span>
                    <span className="text-brand-green font-bold text-sm">₹{activeContributor.total_earned.toLocaleString("en-IN")} INR</span>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-slate text-[9px] block">CURRENT ESCROW WALLET BALANCE</span>
                    <span className="text-[#6366f1] font-bold text-sm">₹{activeContributor.earnings_balance.toLocaleString("en-IN")} INR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-[#121212] border-t border-white/5 p-4 flex justify-between items-center shrink-0 font-mono text-xs">
              <span className="text-[10px] text-brand-slate flex items-center gap-1 uppercase">
                <Clock size={11} />
                Digital Audit Vetted — 2UNE Roster Network
              </span>
              <button 
                onClick={() => setSelectedContributorId(null)}
                className="bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 px-4 py-2 rounded-xl transition-all"
              >
                DISMISS CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
