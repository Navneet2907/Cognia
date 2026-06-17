import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Layers, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Download, 
  Upload, 
  UserCheck, 
  Bell, 
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle,
  HelpCircle,
  Users,
  QrCode,
  CheckSquare,
  MessageSquare,
  PhoneCall,
  Clock
} from "lucide-react";
import { User, Organization, Project, TaskBatch, Task, CalibrationItem } from "../types";
import ServicesIntakeFlow from "./ServicesIntakeFlow";

interface CustomerPortalProps {
  user: User;
  org: Organization;
  projects: Project[];
  batches: TaskBatch[];
  tasks: Task[];
  calibrations: CalibrationItem[];
  onUploadCalibration: (newItem: CalibrationItem) => void;
  onLogout: () => void;
  onUpdateProjects: (updated: Project[]) => void;
}

export default function CustomerPortal({ 
  user, 
  org, 
  projects, 
  batches, 
  tasks, 
  calibrations,
  onUploadCalibration,
  onLogout,
  onUpdateProjects
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "deliverables" | "calibration" | "billing" | "settings">("overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [projectSubTab, setProjectSubTab] = useState<"overview" | "batches" | "reports" | "deliverables" | "calibration">("overview");
  
  // New Brief Request State
  const [showBriefForm, setShowBriefForm] = useState(false);
  
  // In-App Notification Center
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "NT_C_1", text: "Dr. Srinivas Iyer (Expert SME) uploaded bio-reasoning calibration answers for review", date: "Today", read: false },
    { id: "NT_C_2", text: "Batch 002 completed standard annotation checks at 94.2% agreement indices", date: "Yesterday", read: false },
    { id: "NT_C_3", text: "New Telugu dialect translation brief requested successfully under Pilot scope", date: "2 days ago", read: true }
  ]);

  // GSTIN state
  const [gstin, setGstin] = useState(() => {
    return localStorage.getItem("2une_org_gstin") || "27AABBCCDDEE1Z5";
  });

  // Pay QR code modal states
  const [payoutInvoice, setPayoutInvoice] = useState<any | null>(null);
  const [simulatingInvoicePay, setSimulatingInvoicePay] = useState(false);
  const [paidInvoiceIds, setPaidInvoiceIds] = useState<string[]>([]);

  // Calibration IAA States
  const [recalculatingIaa, setRecalculatingIaa] = useState(false);
  const [recalculateStage, setRecalculateStage] = useState("");
  const [iaaScore, setIaaScore] = useState(0.81);

  // Communications Panel State
  const [chatMessages, setChatMessages] = useState([
    { sender: "Arjun Mehta (Lead)", text: "Greetings Rohit! I reviewed your Telugu RLHF parameters. We've routed the first 200 tasks to our certified Level-2 scholar group. Accuracy indices will appear here on your dashboard.", timestamp: "Yesterday 4:15 PM" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  const unreadCount = notifications.filter(n => !n.read).length;
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUseCase, setNewProjectUseCase] = useState("Indic Language RLHF");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectVolume, setNewProjectVolume] = useState("5000");
  const [newProjectLangs, setNewProjectLangs] = useState("Hindi");

  // Calibration upload sandbox
  const [calibBatchId, setCalibBatchId] = useState("B_001");
  const [calibUserAnswer, setCalibUserAnswer] = useState("A");
  const [calibConsensus, setCalibConsensus] = useState("A");
  const [calibAgreement, setCalibAgreement] = useState(95);

  const orgProjects = projects.filter(p => p.org_id === org.id);

  // KPIs calculations
  const totalTasksUnderOrg = tasks.filter(t => {
    const batch = batches.find(b => b.id === t.batch_id);
    if (!batch) return false;
    const project = projects.find(p => p.id === batch.project_id);
    return project?.org_id === org.id;
  });

  const totalSlaCompleted = totalTasksUnderOrg.filter(t => t.status === "approved" || t.status === "submitted").length;
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedProjectBatches = batches.filter(b => b.project_id === selectedProjectId);

  const handleRequestBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    // Add brief to list
    const newProj: Project = {
      id: "P_" + Math.floor(Math.random() * 900 + 100),
      org_id: org.id,
      name: newProjectName,
      use_case: newProjectUseCase as any,
      status: "draft",
      task_types: ["RLHF"],
      languages: [newProjectLangs],
      volume_total: parseInt(newProjectVolume) || 1000,
      volume_completed: 0,
      quality_threshold: 90,
      sla_params: {
        turnaround_hours: 48,
        guaranteed_accuracy: 94
      },
      milestones: [
        { id: "M_new_" + Math.random(), title: "Pilot Phase Evaluation", due_date: "2026-07-10", completed: false, tasks_count: parseInt(newProjectVolume) }
      ],
      rubric_id: "RUB_INDIC_01",
      data_sensitivity: "Confidential",
      created_at: new Date().toISOString(),
      description: newProjectDesc
    };

    onUpdateProjects([newProj, ...projects]);
    setShowBriefForm(false);
    setNewProjectName("");
    setNewProjectDesc("");
    alert("New Project brief submitted successfully! Your designated Account Lead will establish details and start the first execution batch within 24 hours.");
  };

  const handleCalibrationForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: CalibrationItem = {
      id: "CAL_" + Math.floor(Math.random() * 900 + 100),
      batch_id: calibBatchId,
      task_id: "T_" + Math.floor(Math.random() * 900 + 100),
      customer_answer: calibUserAnswer,
      consensus_answer: calibConsensus,
      agreement_percentage: calibAgreement,
      status: "reviewed"
    };
    onUploadCalibration(newItem);
    alert("Ground Truth alignment successfully inputted into the Quality systems model!");
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Top navbar */}
      <header className="border-b border-white/5 bg-brand-charcoal px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-green text-black px-2 py-0.5 rounded font-black font-mono text-sm">2UNE</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Customer Portal — {org.name}</h1>
            <p className="text-[10px] text-brand-slate uppercase font-mono tracking-wider">Account Active: {org.contract_type.replace("_", " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-brand-slate hover:text-white p-1.5 bg-white/5 rounded-lg border border-white/5 relative transition-all"
              id="customer-notifications-bell"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-red border-2 border-brand-charcoal animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-brand-charcoal border border-white/10 rounded-xl shadow-xl z-50 p-4 space-y-3" id="customer-notifications-dropdown">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-brand-slate font-bold uppercase tracking-wider">In-App Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                      className="text-[9px] font-mono text-brand-teal hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-lg text-left text-[11px] leading-relaxed relative ${n.read ? "bg-black/20 text-brand-slate" : "bg-[#18231E] text-white border-l-2 border-brand-green"}`}>
                      <p>{n.text}</p>
                      <span className="text-[8px] font-mono text-brand-slate block mt-1">{n.date}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-[10px] text-brand-slate text-center py-4">No recent notification items.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-brand-slate">Account Lead:</span>
            <strong className="text-white">Arjun Mehta</strong>
          </div>
          <button 
            onClick={onLogout}
            className="text-xs hover:text-brand-red bg-white/5 hover:bg-brand-red/10 border border-white/10 px-3 py-1.5 rounded-lg font-mono transition-all"
          >
            EXIT PORTAL
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-brand-charcoal/30 border-r border-white/5 p-4 space-y-2 shrink-0">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl mb-6">
            <div className="text-[10px] uppercase font-mono text-brand-slate tracking-widest">Logged In As</div>
            <div className="font-bold text-sm text-white mt-1">{user.name}</div>
            <div className="text-[10px] text-brand-green font-mono">{user.role.toUpperCase()}</div>
          </div>
          
          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "overview" ? "bg-brand-green text-black font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <TrendingUp size={14} />
            OVERVIEW INDEX
          </button>
          
          <button 
            onClick={() => setActiveTab("projects")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "projects" ? "bg-brand-green text-black font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Layers size={14} />
            ACTIVE PROJECTS ({orgProjects.length})
          </button>

          <button 
            onClick={() => setActiveTab("calibration")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "calibration" ? "bg-brand-green text-black font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Sliders size={14} />
            CALIBRATION HUB
          </button>

          <button 
            onClick={() => setActiveTab("billing")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "billing" ? "bg-brand-green text-black font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <CreditCard size={14} />
            CONTRACTS & BILLING
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-3 ${activeTab === "settings" ? "bg-brand-green text-black font-bold" : "text-brand-slate hover:text-white hover:bg-white/5"}`}
          >
            <Settings size={14} />
            API & CONFIGS
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-brand-charcoal border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/3 blur-3xl rounded-full pointer-events-none" />
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Welcome back, {user.name}</h2>
                  <p className="text-xs text-brand-slate mt-1 max-w-md">Your active models evaluations are operating under optimal agreement metrics inside our Indian hubs.</p>
                </div>
                <button
                  onClick={() => setShowBriefForm(true)}
                  className="mt-4 sm:mt-0 bg-brand-green hover:bg-brand-green/90 text-black text-xs font-bold font-mono px-4 py-2 rounded-lg transition-all"
                >
                  + REQUEST NEW PILOT/PROJECT
                </button>
              </div>

              {/* Show Services Intake Flow Wizard */}
              {showBriefForm && (
                <div className="mt-4">
                  <ServicesIntakeFlow 
                    onCancel={() => setShowBriefForm(false)}
                    onSubmit={(newProjectBlueprint) => {
                      // Formulate a beautiful, high-quality, fully configured Project model
                      const finalProj: Project = {
                        id: newProjectBlueprint.id || "PROJ_" + Math.floor(Math.random() * 900 + 100),
                        org_id: org.id,
                        name: newProjectBlueprint.name || "Enterprise AI Evaluation Project",
                        use_case: newProjectBlueprint.use_case || "Safety & Red Teaming",
                        status: "active",
                        task_types: newProjectBlueprint.task_types || ["RLHF"],
                        languages: newProjectBlueprint.languages || ["Hindi", "Standard English"],
                        volume_total: newProjectBlueprint.volume_total || 5000,
                        volume_completed: 0,
                        quality_threshold: 90,
                        sla_params: {
                          turnaround_hours: 48,
                          guaranteed_accuracy: 90
                        },
                        milestones: [],
                        rubric_id: "RUB_DEFAULT",
                        data_sensitivity: "Public",
                        created_at: new Date().toISOString(),
                        description: "Automated project brief submitted by customer intake terminal."
                      };
                      
                      const updatedProjects = [finalProj, ...projects];
                      onUpdateProjects(updatedProjects);
                      setSelectedProjectId(finalProj.id);
                      
                      // Push to our notifications tray!
                      setNotifications([
                        {
                          id: "NT_C_" + (notifications.length + 1),
                          text: `Successfully initialized ${finalProj.name} and mapped to Arjun Mehta! Quality baseline calibrated.`,
                          date: "Just Now",
                          read: false
                        },
                        ...notifications
                      ]);
                    }}
                  />
                </div>
              )}

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">Active Evaluators</div>
                  <div className="text-xl font-extrabold text-white mt-1">42</div>
                  <div className="text-[9px] text-brand-green mt-1">Fully credentialed scholar logs</div>
                </div>
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">Completed Batches</div>
                  <div className="text-xl font-extrabold text-brand-teal mt-1">
                    {totalSlaCompleted} <span className="text-xs text-brand-slate font-light">/ {totalTasksUnderOrg.length} tasks</span>
                  </div>
                  <div className="text-[9px] text-brand-slate mt-1">Managed workflow streams</div>
                </div>
                <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl">
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">Average Quality Score</div>
                  <div className="text-xl font-extrabold text-brand-green mt-1">92.4%</div>
                  <div className="text-[9px] text-brand-slate mt-1">Target quality SLA: 85%</div>
                </div>
                <div className="bg-brand-charcoal border border-brand-green/10 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <div className="text-[10px] font-mono text-brand-slate uppercase tracking-wider">SLA compliance</div>
                  <div className="text-xl font-extrabold text-brand-green mt-1">98.9%</div>
                  <div className="text-[9px] text-brand-green mt-1">Color: GREEN (Optimal)</div>
                </div>
              </div>

              {/* Active Projects Table & Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-brand-charcoal border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-4">Your Active Project Assignments</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-[10px] text-brand-slate uppercase border-b border-white/5 pb-2">
                        <tr>
                          <th className="pb-3">Project Title</th>
                          <th className="pb-3">Use Case</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Tasks Completed</th>
                          <th className="pb-3 text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-brand-slate">
                        {orgProjects.map((proj) => {
                          const pct = Math.round((proj.volume_completed / proj.volume_total) * 100);
                          return (
                            <tr key={proj.id} className="hover:text-white cursor-pointer" onClick={() => { setSelectedProjectId(proj.id); setActiveTab("projects"); }}>
                              <td className="py-3 pr-2 font-sans font-bold text-white max-w-xs truncate">{proj.name}</td>
                              <td className="py-3">{proj.use_case}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  proj.status === "active" ? "bg-brand-green/10 text-brand-green" : "bg-white/5 text-brand-slate"
                                }`}>
                                  {proj.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3">{proj.volume_completed} / {proj.volume_total}</td>
                              <td className="py-3 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-brand-green h-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-white font-bold">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-brand-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">Inter-Annotator Agreement</h3>
                    <Info size={13} className="text-brand-slate" />
                  </div>
                  
                  {/* Beautiful Clean custom SVG chart of inter annotator agreements over weeks */}
                  <div className="h-40 w-full relative flex items-end justify-between px-2 pt-6 border-b border-l border-white/5">
                    <span className="absolute left-1 top-1 text-[8px] font-mono text-brand-slate">Krippendorff's α</span>
                    {[
                      { week: "W21", val: 0.78 },
                      { week: "W22", val: 0.82 },
                      { week: "W23", val: 0.84 },
                      { week: "W24", val: 0.88 },
                      { week: "W25", val: 0.91 },
                      { week: "W26", val: 0.93 },
                    ].map((pt, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 group relative">
                        <div className="absolute bottom-full mb-1 bg-black/90 p-1.5 rounded border border-white/10 text-[9px] text-brand-green opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          α: {pt.val}
                        </div>
                        <div 
                          className="w-4 bg-brand-green/80 group-hover:bg-brand-green transition-all rounded-t"
                          style={{ height: `${pt.val * 120}px` }}
                        />
                        <span className="text-[9px] font-mono text-brand-slate mt-2">{pt.week}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-brand-slate leading-relaxed">
                    IAA measures absolute consensus. Scores above <strong className="text-brand-green">0.75</strong> indicate highly stable domain rules. Disagreements automatically stream to the QA Auditor queue.
                  </p>
                </div>
              </div>

              {/* Contact Lead Card */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-brand-green bg-brand-green/10 flex items-center justify-center font-mono font-bold text-brand-green">
                    AM
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Your designated Lead Account Partner: Arjun Mehta</h4>
                    <p className="text-xs text-brand-slate">Arjun coordinates project schemas, manually audits outlier task blocks, and delivers processed batches directly.</p>
                  </div>
                </div>
                <a 
                  href="mailto:arjun@2une.in"
                  className="bg-white/5 text-white hover:bg-brand-green hover:text-black border border-white/10 text-xs px-4 py-2 rounded-lg font-mono font-bold transition-all"
                >
                  CONTACT ON SLACK / INDEPENDENT MAIL
                </a>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <select 
                  value={selectedProjectId || ""} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-brand-charcoal border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono font-bold outline-none"
                >
                  {orgProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowBriefForm(true)}
                  className="bg-brand-green/15 text-brand-green hover:bg-brand-green hover:text-black border border-brand-green/30 text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
                >
                  + Request New Brief
                </button>
              </div>

              {selectedProject ? (
                <div className="bg-brand-charcoal border border-white/5 rounded-2xl overflow-hidden p-6 space-y-6">
                  {/* Project Summary info */}
                  <div className="border-b border-white/5 pb-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded uppercase">{selectedProject.use_case}</span>
                        <h2 className="text-xl font-bold text-white mt-2">{selectedProject.name}</h2>
                        <p className="text-xs text-brand-slate mt-1 max-w-3xl">{selectedProject.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-brand-slate">DATA CLASSIFICATION</div>
                        <div className="text-xs text-brand-amber font-mono font-bold bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded mt-1 inline-block">
                          {selectedProject.data_sensitivity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal sub tabs for specific selected project metrics */}
                  <div className="flex gap-4 border-b border-white/5 pb-2 text-xs font-mono">
                    <button 
                      onClick={() => setProjectSubTab("overview")} 
                      className={`pb-2 outline-none ${projectSubTab === "overview" ? "border-b border-brand-green text-brand-green font-bold" : "text-brand-slate hover:text-white"}`}
                    >
                      Milestones
                    </button>
                    <button 
                      onClick={() => setProjectSubTab("batches")} 
                      className={`pb-2 outline-none ${projectSubTab === "batches" ? "border-b border-brand-green text-brand-green font-bold" : "text-brand-slate hover:text-white"}`}
                    >
                      Task Batches ({selectedProjectBatches.length})
                    </button>
                    <button 
                      onClick={() => setProjectSubTab("reports")} 
                      className={`pb-2 outline-none ${projectSubTab === "reports" ? "border-b border-brand-green text-brand-green font-bold" : "text-brand-slate hover:text-white"}`}
                    >
                      Quality Dashboard
                    </button>
                    <button 
                      onClick={() => setProjectSubTab("deliverables")} 
                      className={`pb-2 outline-none ${projectSubTab === "deliverables" ? "border-b border-brand-green text-brand-green font-bold" : "text-brand-slate hover:text-white"}`}
                    >
                      Deliverable Downloads
                    </button>
                  </div>

                  {/* Sub tab 1: Milestones */}
                  {projectSubTab === "overview" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">SLA Project Timeline Milestones</h4>
                      <div className="relative border-l border-white/10 pl-6 space-y-6 py-2">
                        {selectedProject.milestones.map((ms, idx) => (
                          <div key={ms.id || idx} className="relative">
                            <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                              ms.completed ? "bg-brand-green border-brand-green text-black" : "bg-black border-white/25 text-brand-slate font-mono"
                            }`}>
                              {ms.completed ? "✓" : idx + 1}
                            </span>
                            <div>
                              <div className="flex justify-between items-center max-w-md">
                                <span className={`text-xs font-bold ${ms.completed ? "text-brand-slate line-through font-normal" : "text-white"}`}>{ms.title}</span>
                                <span className="text-[10px] text-brand-slate font-mono">{ms.due_date}</span>
                              </div>
                              <p className="text-[10px] text-brand-slate mt-1">{ms.tasks_count} tasks loaded matching specified rubrics. {ms.completed ? "Verified & Delivered." : "In Queue."}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub tab 2: Batches */}
                  {projectSubTab === "batches" && (
                    <div className="space-y-4">
                      {selectedProjectBatches.length === 0 ? (
                        <div className="py-8 text-center text-xs text-brand-slate">
                          No active batches currently loaded under this project card.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedProjectBatches.map(batch => (
                            <div key={batch.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-mono text-brand-slate">BATCH ID: {batch.id}</span>
                                <h5 className="text-xs font-bold text-white mt-0.5">{batch.name}</h5>
                                <p className="text-[10px] text-brand-slate mt-1 max-w-2xl truncate">{batch.instructions}</p>
                              </div>
                              <div className="text-right whitespace-nowrap pl-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  batch.status === "in_progress" ? "bg-brand-amber/15 text-brand-amber" : "bg-brand-green/15 text-brand-green"
                                }`}>
                                  {batch.status.toUpperCase()}
                                </span>
                                <div className="text-[10px] text-brand-slate font-mono mt-2">{batch.task_count} high-density keys</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub tab 3: Quality Reports */}
                  {projectSubTab === "reports" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <h5 className="text-xs font-bold mb-3 text-brand-green">Consensus Agreement Trend</h5>
                          {/* Mini local graph */}
                          <div className="h-32 w-full flex items-end justify-between border-b border-white/5 pb-2">
                            {[91, 93, 89, 92, 95].map((val, idx) => (
                              <div key={idx} className="flex flex-col items-center flex-1">
                                <div className="w-3 bg-brand-green rounded-t" style={{ height: `${val}%` }} />
                                <span className="text-[8px] text-brand-slate mt-1 font-mono">Batch {idx+1}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
                          <h5 className="font-bold text-brand-teal">SLA Error Categories</h5>
                          <div className="space-y-1 mt-3">
                            <div className="flex justify-between text-[10px]">
                              <span>Factual Hallucination</span>
                              <span className="font-bold text-brand-red">8%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-red h-full" style={{ width: "8%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>Linguistic Fluency</span>
                              <span className="font-bold text-brand-green">1.2%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-green h-full" style={{ width: "1.2%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>Tone & Localization Error</span>
                              <span className="font-bold text-brand-amber">4.8%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-amber h-full" style={{ width: "4.8%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub tab 4: Action Downloads */}
                  {projectSubTab === "deliverables" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-brand-slate">SCHEMATIC FORMAT: SECURE JSONL</span>
                          <h5 className="text-xs font-bold text-white mt-0.5">Batch_001_Final_Delivered_Clean.jsonl</h5>
                          <p className="text-[10px] text-brand-slate mt-1">Vetted by Lead Priya Sharma. V1 deliverable. 840 verified data evaluations keys.</p>
                        </div>
                        <button 
                          onClick={() => alert("Simulating download. Secure deliverable package (JSONL Format) compiled using AES-256 is successfully fetched in local device.")}
                          className="bg-brand-green hover:bg-brand-green/80 text-black py-2 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2"
                        >
                          <Download size={13} />
                          DOWNLOAD BUNDLE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-brand-charcoal text-center text-brand-slate text-xs rounded-xl">
                  Select an active project card to review evaluation metadata.
                </div>
              )}
            </div>
          )}

          {/* CALIBRATION HUB & COMMUNICATIONS DESK */}
          {activeTab === "calibration" && (
            <div className="space-y-6" id="calibration-interface-main">
              
              {/* Dynamic IAA Dashboard Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Fleiss' Kappa IAA Index Card */}
                <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/3 blur-2xl rounded-full pointer-events-none" />
                  <span className="text-[9px] font-mono text-brand-green uppercase tracking-wider block font-bold">Consensus Quality Scorecard</span>
                  <h4 className="text-sm font-bold text-white font-sans">Fleiss' Kappa Inter-Annotator Agreement (IAA)</h4>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-brand-green border-r-transparent flex items-center justify-center font-mono text-xl font-bold text-white animate-spin-slow">
                      {iaaScore}
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-slate uppercase block font-mono">AGREEMENT CLASSIFICATION:</span>
                      <span className="text-xs font-bold text-brand-green uppercase tracking-tight">EXCELLENT CONSENSUS STATS ✓</span>
                      <p className="text-[9.5px] text-brand-slate mt-1 font-sans">High index guarantees elite rubric alignment on Telugu & Hindi language slots.</p>
                    </div>
                  </div>

                  {/* Recalculate Button Trigger with custom animation spinner */}
                  {recalculatingIaa ? (
                    <div className="p-3 bg-[#0E1513] border border-brand-green/20 rounded-xl space-y-1 text-center font-mono text-[9px] text-brand-green">
                      <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                      <span>{recalculateStage}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRecalculatingIaa(true);
                        setRecalculateStage("Harmonizing annotator bias matrices...");
                        setTimeout(() => {
                          setRecalculateStage("Normalizing regional dialect deviations...");
                          setTimeout(() => {
                            const newScore = parseFloat((0.83 + Math.random() * 0.05).toFixed(2));
                            setIaaScore(newScore);
                            setRecalculatingIaa(false);
                            alert(`Calibration complete! Inter-Annotator Agreement (IAA) elevated to ${newScore} after model alignment.`);
                          }, 1000);
                        }, 1000);
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-1.5 rounded-lg text-xs font-mono font-bold text-brand-slate hover:text-white transition-all"
                      id="recalculate-iaa-btn"
                    >
                      Recalculate Annotation Weights ↑
                    </button>
                  )}
                </div>

                {/* Ground Truth Calibration File Uploader */}
                <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-brand-teal uppercase tracking-wider block font-bold">Calibration Fast Track</span>
                    <h4 className="text-xs font-bold text-white">Bulk Ground Truth Calibration File</h4>
                    <p className="text-[10px] text-brand-slate">Drag & drop standard pilot spreadsheets to match expert ratings instantly.</p>
                  </div>
                  
                  {/* File Upload Drop Area */}
                  <div 
                    onClick={() => {
                      const randId = "CAL_" + Math.floor(Math.random() * 900 + 100);
                      const randAcc = Math.floor(Math.random() * 10) + 90;
                      onUploadCalibration({
                        id: randId,
                        batch_id: "B_002",
                        task_id: "T_" + Math.floor(Math.random() * 800 + 100),
                        customer_answer: "A",
                        consensus_answer: "A",
                        agreement_percentage: randAcc,
                        status: "reviewed"
                      });
                      alert(`Successfully read and evaluated benchmark data! Generated Calibration ID: ${randId}`);
                    }}
                    className="border border-dashed border-white/10 hover:border-brand-teal/50 bg-black/20 hover:bg-brand-teal/[0.02] p-5 rounded-xl cursor-pointer text-center space-y-1.5 my-3 flex flex-col items-center justify-center transition-all"
                    id="ground-truth-dragzone"
                  >
                    <Upload size={18} className="text-brand-slate" />
                    <div>
                      <span className="text-[11px] font-bold text-white block">Drop CSV / JSONL ground truth</span>
                      <span className="text-[9px] text-brand-slate">or click on this box to select from system finder</span>
                    </div>
                  </div>
                </div>

                {/* Account Lead Liaison Desk */}
                <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl flex flex-col justify-between font-sans">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-brand-slate uppercase tracking-wider block font-bold">Real-time sync</span>
                    <h4 className="text-xs font-bold text-white">Co-ordinate with Lead Arjun</h4>
                    <p className="text-[10px] text-brand-slate">Post inquiries about task parameters or specific regional exceptions.</p>
                  </div>
                  <div className="bg-black/35 p-3 rounded-lg flex items-center justify-between border border-white/5 mt-3">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Arjun Mehta (Lead)</span>
                        <span className="text-[9px] text-brand-green font-mono font-bold">Response Time: &lt;10 mins</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert("Connecting direct IMPS telephony link: +91 98110 2026...")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 rounded-lg text-[10px] font-mono text-white"
                    >
                      VOICE
                    </button>
                  </div>
                </div>

              </div>

              {/* Standard Alignment Row */}
              <div className="p-6 bg-brand-charcoal border border-white/5 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4 font-sans font-sans">Interactive Alignment Console</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form to submit mapping */}
                  <form onSubmit={handleCalibrationForm} className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider font-sans">Manual Adjustment Form</h4>
                    
                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">TARGET BATCH ID</label>
                      <select 
                        value={calibBatchId} onChange={(e) => setCalibBatchId(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="B_001">B_001 — Slang Set</option>
                        <option value="B_002">B_002 — Transcript Eval</option>
                        <option value="B_003">B_003 — Physics Siege</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-brand-slate font-bold mb-1">TARGET OUTPUT</label>
                        <select 
                          value={calibUserAnswer} onChange={(e) => setCalibUserAnswer(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="A">PREFERRED OPTION A</option>
                          <option value="B">PREFERRED OPTION B</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-brand-slate font-bold mb-1">CONSENSUS TARGET</label>
                        <select 
                          value={calibConsensus} onChange={(e) => setCalibConsensus(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="A">OPTION A</option>
                          <option value="B">OPTION B</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-brand-slate font-bold mb-1">CONFIDENCE AGREEMENT SCORE TARGET (%)</label>
                      <input 
                        type="number" max={100} min={50} value={calibAgreement} onChange={(e) => setCalibAgreement(parseInt(e.target.value) || 95)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-brand-green text-black font-bold font-mono text-xs py-2 rounded"
                    >
                      WRITE CALIBRATION LOG
                    </button>
                  </form>

                  {/* List of calibration evaluations */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Active Calibration Indexes</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto w-full">
                      {calibrations.map((cal) => (
                        <div key={cal.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center w-full">
                          <div>
                            <span className="text-[9px] font-mono text-brand-slate uppercase bg-white/5 px-1.5 py-0.5 rounded font-sans">ID: {cal.id}</span>
                            <span className="ml-2 text-[9px] text-brand-slate font-mono">BATCH ID: {cal.batch_id}</span>
                            <div className="text-xs text-white font-bold mt-1.5 font-sans">
                              Ground Truth Answer Preferred: <span className="text-brand-green font-sans">{cal.customer_answer}</span> vs Consensus alignment: <span className="text-brand-teal font-sans">{cal.consensus_answer}</span>
                            </div>
                          </div>
                          <div className="text-right font-sans">
                            <span className="text-xs font-mono font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded font-mono">
                              {cal.agreement_percentage}% Agreement
                            </span>
                            <div className="text-[9px] text-brand-slate mt-1.5 font-sans">Consensus Validated</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Message Box with Arjun */}
              <div className="p-6 bg-brand-charcoal border border-white/5 rounded-2xl space-y-4" id="liason-coordination-desk">
                <div className="flex gap-2 items-center text-sm font-sans font-bold">
                  <MessageSquare size={16} className="text-brand-teal" />
                  <h4>Liaison Communication Thread</h4>
                </div>
                <div className="bg-black/30 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto flex flex-col">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-lg text-xs leading-relaxed max-w-sm ${msg.sender.includes("Arjun") ? "bg-[#18231E]/70 border-l border-brand-green/30 self-start mr-auto text-left" : "bg-[#162026]/70 border-r border-brand-teal/30 ml-auto text-right"}`}>
                      <span className="text-[10px] font-mono text-brand-slate tracking-wide uppercase block pb-1 border-b border-white/5 mb-1 font-bold">{msg.sender} • {msg.timestamp}</span>
                      <p className="text-white font-sans">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Enter urgent query details for Arjun Mehta..."
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMsg.trim()) return;
                      const customMsg = { sender: "You (Client)", text: newMsg, timestamp: "Just Now" };
                      setChatMessages([...chatMessages, customMsg]);
                      setNewMsg("");
                      
                      // Simulate intelligent auto-response
                      setTimeout(() => {
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            sender: "Arjun Mehta (Lead)",
                            text: "I have flagged this request on our admin panel. Our regional Sanskrit or dialect scholars will evaluate consistency tags shortly.",
                            timestamp: "Just Now"
                          }
                        ]);
                      }, 1200);
                    }}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    SEND MSG
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* BILLING & CONTRACTS */}
          {activeTab === "billing" && (
            <div className="space-y-6" id="billing-payment-hub">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Contract Info / GSTIN panel */}
                <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-white">Tax Configuration & Contract Info</h3>
                  
                  {/* GSTIN Input Card */}
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <div>
                      <label className="block text-[10px] text-brand-slate uppercase font-mono tracking-wider mb-1 font-bold">Your Entity GSTIN (15-digit)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 27AAAAA1111A1Z1"
                        value={gstin}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setGstin(val);
                          localStorage.setItem("2une_org_gstin", val);
                        }}
                        className="w-full bg-brand-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-brand-green"
                        maxLength={15}
                        id="billing-gstin-field"
                      />
                    </div>
                    
                    <div className="text-[10px] text-brand-slate leading-relaxed font-mono">
                      <span>Live Indian Tax Rules: </span>
                      <strong className="text-brand-green">+18% Integrated GST (IGST)</strong> will automatically calculate on invoices in progress.
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 block text-xs space-y-2 font-mono">
                    <div className="flex justify-between text-brand-slate font-mono">
                      <span>TYPE:</span>
                      <span className="text-white font-bold">{org.contract_type.replace("_", " ").toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-brand-slate font-mono">
                      <span>MONTHLY LIMIT:</span>
                      <span className="text-white">100,000 Tasks</span>
                    </div>
                    <div className="flex justify-between text-brand-slate font-mono">
                      <span>INCLUDED LANGUAGES:</span>
                      <span className="text-white font-bold">ALL INDIC</span>
                    </div>
                  </div>
                </div>

                {/* Invoices Ledger Panel */}
                <div className="md:col-span-2 bg-brand-charcoal border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-white">Invoice Ledger Statements</h3>
                    <span className="bg-white/5 text-[9px] font-mono text-brand-slate px-2 py-0.5 rounded">GSTIN: {gstin || "NOT PROVIDED"}</span>
                  </div>
                  <div className="overflow-x-auto text-xs font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-brand-slate uppercase font-mono">
                          <th className="pb-3">Invoice ID</th>
                          <th className="pb-3">Period Details</th>
                          <th className="pb-3 text-right">Base Cost</th>
                          <th className="pb-3 text-right">GST (18%)</th>
                          <th className="pb-3 text-right">Total Payable</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-brand-slate">
                        {[
                          { id: "INV_4412", date: "May 1-31, 2026", base: 245000 },
                          { id: "INV_4589", date: "June 1-15, 2026", base: 124600 },
                        ].map((inv) => {
                          const gstVal = Math.round(inv.base * 0.18);
                          const totalVal = inv.base + gstVal;
                          const isPaid = paidInvoiceIds.includes(inv.id) || inv.id === "INV_4412";
                          
                          return (
                            <tr key={inv.id}>
                              <td className="py-3 font-bold text-white">{inv.id}</td>
                              <td className="py-3">{inv.date}</td>
                              <td className="py-3 text-white text-right">₹{inv.base.toLocaleString("en-IN")}</td>
                              <td className="py-3 text-brand-slate text-right font-mono">₹{gstVal.toLocaleString("en-IN")}</td>
                              <td className="py-3 font-bold text-white text-right">₹{totalVal.toLocaleString("en-IN")}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  isPaid ? "bg-brand-green/10 text-brand-green" : "bg-brand-amber/10 text-brand-amber animate-pulse"
                                }`}>
                                  {isPaid ? "PAID" : "PENDING"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {isPaid ? (
                                  <button 
                                    onClick={() => alert(`Simulating PDF download. GST Invoice ${inv.id} with registered corporate GSTIN: ${gstin} successfully compiled and retrieved.`)}
                                    className="text-[10px] font-bold font-mono text-brand-slate hover:text-white hover:underline transition-all"
                                  >
                                    PDF RECEIPT
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setPayoutInvoice({ ...inv, gstVal, totalVal })}
                                    className="bg-brand-amber hover:bg-brand-amber/80 text-black px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all"
                                    id="invoice-pay-btn"
                                  >
                                    PAY UPI QR
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-brand-amber/5 border border-brand-amber/20 rounded-xl text-xs text-brand-amber leading-relaxed flex items-start gap-3">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Interactive Settlement Guarantee</strong>
                      <p className="text-[11px] text-brand-slate mt-0.5 font-sans">
                        Payments trigger instant service volume increases. Use dynamic Indian UPI QR generator to settle pilot batch credits on any scanner instantly.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Payment QR modal simulation */}
              {payoutInvoice && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-brand-charcoal border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
                    <div className="text-[10px] font-mono text-brand-slate uppercase font-bold tracking-widest bg-white/5 py-1 px-3 rounded-lg">BHIM UPI DIGITAL GATEWAY</div>
                    <h4 className="text-sm font-bold text-white font-sans">Settle Invoice {payoutInvoice.id}</h4>
                    
                    <div className="p-4 bg-black/40 rounded-xl space-y-2 font-mono text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-brand-slate">Base Cost:</span>
                        <span className="text-white">₹{payoutInvoice.base.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-slate">IGST Tax (18%):</span>
                        <span className="text-brand-slate">₹{payoutInvoice.gstVal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm text-brand-green">
                        <span>Net Payable:</span>
                        <span>₹{payoutInvoice.totalVal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* QR Code Graphic Place-holder */}
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 max-w-[200px] mx-auto">
                      <div className="w-32 h-32 bg-[#fff] border-4 border-[#000] p-1 flex flex-col items-center justify-center relative">
                        {/* Perfect mock QR styling */}
                        <div className="absolute top-1 left-1 w-6 h-6 border-4 border-black animate-pulse" />
                        <div className="absolute top-1 right-1 w-6 h-6 border-4 border-black" />
                        <div className="absolute bottom-1 left-1 w-6 h-6 border-4 border-black" />
                        <div className="w-16 h-16 bg-black relative rounded p-1 flex items-center justify-center">
                          <span className="text-[8px] font-mono text-white font-black">2UNE QR</span>
                        </div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-black" />
                      </div>
                      <span className="text-[8.5px] font-semibold text-gray-700 tracking-tight font-mono break-all leading-normal">
                        upi://pay?pa=2une@ybl&pn=2UNE%20India&am={payoutInvoice.totalVal}&cu=INR
                      </span>
                    </div>

                    <p className="text-[10px] text-brand-slate leading-relaxed font-sans">
                      Scan via GPay, PhonePe, Paytm or BHIM app to settle securely. Live payment status syncs in real-time.
                    </p>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatingInvoicePay(true);
                          setTimeout(() => {
                            setPaidInvoiceIds([...paidInvoiceIds, payoutInvoice.id]);
                            setSimulatingInvoicePay(false);
                            setPayoutInvoice(null);
                            
                            // Create direct notification item
                            setNotifications([
                              {
                                id: "NT_C_" + (notifications.length + 1),
                                text: `Invoice payment of ₹${payoutInvoice.totalVal.toLocaleString("en-IN")} received! Ground Truth calibration authorized under ${gstin}.`,
                                date: "Just Now",
                                read: false
                              },
                              ...notifications
                            ]);
                            alert(`UPI Payment of ₹${payoutInvoice.totalVal.toLocaleString("en-IN")} accepted successfully! Contract volume cap extended.`);
                          }, 1200);
                        }}
                        className="w-full bg-brand-green hover:bg-brand-green/80 text-black font-mono text-xs font-bold py-2 rounded-lg transition-all"
                        disabled={simulatingInvoicePay}
                        id="simulate-payment-receive-btn"
                      >
                        {simulatingInvoicePay ? "Processing transaction..." : "Simulate UPI Payment Success"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutInvoice(null)}
                        className="w-full bg-white/5 hover:bg-white/10 text-brand-slate hover:text-white font-mono text-xs py-2 rounded-lg"
                      >
                        Cancel Gateway
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* SETTINGS LOGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl">
                <h3 className="font-bold text-sm mb-4">Programmatic API Key Tokens</h3>
                <p className="text-xs text-brand-slate mb-4">Access 2UNE processed deliverables and schema accuracy ratings directly from your localized CI pipelines.</p>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4">
                  <div className="font-mono text-xs text-brand-green truncate">
                    2une_live_token_sec_66100444_xxxxx_sarvam_ai
                  </div>
                  <button 
                    onClick={() => alert("Key successfully written to clipboard! Be mindful to keep all production keys secure.")}
                    className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-xs shrink-0 font-mono"
                  >
                    COPY KEY
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold text-sm mb-2">Team Administrators Management</h3>
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold font-mono">
                          RB
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Rohan Bhasin</div>
                          <div className="text-[10px] text-brand-slate uppercase font-mono">Chief Scientist — Admin</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-brand-green font-bold">Active</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center text-xs font-bold font-mono">
                          AK
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Arun Krish</div>
                          <div className="text-[10px] text-brand-slate uppercase font-mono">Junior Engineer — Viewer</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-brand-green font-bold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
