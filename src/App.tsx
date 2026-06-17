import React, { useState, useEffect } from "react";
import { 
  getPlatformDB, 
  savePlatformDB, 
  resetPlatformDB 
} from "./data";
import { 
  User, 
  Organization, 
  Contributor, 
  Project, 
  TaskBatch, 
  Task, 
  Payment, 
  CalibrationItem, 
  AuditLog, 
  Certification,
  TaskResponse
} from "./types";
import AuthCover from "./components/AuthCover";
import CustomerPortal from "./components/CustomerPortal";
import ContributorPortal from "./components/ContributorPortal";
import OperationsPortal from "./components/OperationsPortal";
import AIChatbot from "./components/AIChatbot";
import { RefreshCw, ShieldAlert } from "lucide-react";

export default function App() {
  const [db, setDb] = useState<{
    users: User[];
    orgs: Organization[];
    contributors: Contributor[];
    projects: Project[];
    batches: TaskBatch[];
    tasks: Task[];
    payments: Payment[];
    calibrations: CalibrationItem[];
    certifications: Certification[];
    auditLogs: AuditLog[];
  } | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [activeCustomerOrgId, setActiveCustomerOrgId] = useState<string | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    const freshDb = getPlatformDB();
    setDb(freshDb);
  }, []);

  if (!db) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex flex-col justify-center items-center font-mono space-y-4">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-brand-green tracking-widest animate-pulse">BOOTSTRAPPING 2UNE DATA LAYERS...</span>
      </div>
    );
  }

  const handleLogin = (user: User, customOrgId?: string) => {
    setLoggedInUser(user);
    if (customOrgId) {
      setActiveCustomerOrgId(customOrgId);
    } else if (user.role === "customer_admin" || user.role === "customer_viewer") {
      // Find matching org
      const userOrg = db.orgs.find(o => o.account_lead_id === "U_O001" || o.id === "O_001");
      setActiveCustomerOrgId(userOrg?.id || "O_001");
    }
    
    // Log audit log
    const newLog: AuditLog = {
      id: "LOG_SESS_" + Math.floor(Math.random() * 9000 + 1000),
      user_id: user.id,
      user_name: user.name,
      role: user.role,
      action: `Logged into 2UNE Platform Portal: Session Initialized.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z",
      ip: "103.112." + Math.floor(Math.random() * 200) + "." + Math.floor(Math.random() * 250)
    };
    
    const updatedLogs = [newLog, ...db.auditLogs];
    const newDbState = { ...db, auditLogs: updatedLogs };
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleLogout = () => {
    if (loggedInUser) {
      const newLog: AuditLog = {
        id: "LOG_SESS_" + Math.floor(Math.random() * 9000 + 1000),
        user_id: loggedInUser.id,
        user_name: loggedInUser.name,
        role: loggedInUser.role,
        action: `Logged out of 2UNE Platform. Session completed.`,
        timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z",
        ip: "127.0.0.1"
      };
      
      const updatedLogs = [newLog, ...db.auditLogs];
      const newDbState = { ...db, auditLogs: updatedLogs };
      setDb(newDbState);
      savePlatformDB(newDbState);
    }
    setLoggedInUser(null);
    setActiveCustomerOrgId(null);
  };

  // --- BUSINESS LOGIC FLOW ACTIONS ---

  // FLOW 1: Customer pilot brief requested
  const handleRequestPilot = (pilotData: {
    orgName: string;
    email: string;
    useCase: string;
    languages: string[];
    volume: string;
  }) => {
    // 1. Create a mock Organization
    const newOrgId = "O_" + Math.floor(Math.random() * 900 + 100);
    const newOrg: Organization = {
      id: newOrgId,
      name: pilotData.orgName,
      industry: "Automated Pilot " + pilotData.useCase,
      tier: "pilot",
      account_lead_id: "U_O001", // assigned Arjun Mehta
      contract_type: "pilot",
      status: "pending",
      created_at: new Date().toISOString()
    };

    // 2. Create customer Admin user
    const newCustUserId = "U_" + Math.floor(Math.random() * 9000 + 1000);
    const newCustUser: User = {
      id: newCustUserId,
      role: "customer_admin",
      email: pilotData.email,
      name: pilotData.orgName + " Rep",
      status: "pending",
      created_at: new Date().toISOString()
    };

    // 3. Create initial Project Blueprint
    const newProj: Project = {
      id: "P_PILOT_" + Math.floor(Math.random() * 900 + 100),
      org_id: newOrgId,
      name: `Managed Pilot for ${pilotData.orgName}`,
      use_case: pilotData.useCase as any,
      status: "draft",
      task_types: [pilotData.useCase.includes("Voice") ? "Voice_Agent_Eval" : "RLHF"],
      languages: pilotData.languages,
      volume_total: 1000,
      volume_completed: 0,
      quality_threshold: 88,
      sla_params: {
        turnaround_hours: 48,
        guaranteed_accuracy: 94
      },
      milestones: [
        { id: "M_PL_" + Math.random(), title: "Baseline Calibration Phase", due_date: "2026-07-15", completed: false, tasks_count: 500 }
      ],
      rubric_id: "RUB_INDIC_01",
      data_sensitivity: "Confidential",
      created_at: new Date().toISOString(),
      description: `Managed Pilot evaluation task for ${pilotData.orgName}. Custom tailored linguistics and reasoning assessments.`
    };

    // Log the Operations audit trial
    const newAuditLog: AuditLog = {
      id: "LOG_AUD_" + Math.floor(Math.random() * 90000 + 10000),
      user_name: "System Gateway",
      user_id: "SYS_GTW",
      role: "guest",
      action: `New Pilot requested by: ${pilotData.orgName} (${pilotData.email}). Automatic Blueprint established.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z",
      ip: "103.88.22.44"
    };

    const newDbState = {
      ...db,
      orgs: [newOrg, ...db.orgs],
      users: [newCustUser, ...db.users],
      projects: [newProj, ...db.projects],
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 2: Contributor Joins
  const handleJoinContributor = (contribData: {
    name: string;
    email: string;
    mobile: string;
    college: string;
    degree: string;
    languages: string[];
    domains: string[];
  }) => {
    // Create new user record first
    const newUserId = "U_CO_" + Math.floor(Math.random() * 9000 + 1000);
    const newUser: User = {
      id: newUserId,
      role: "contributor",
      email: contribData.email,
      name: contribData.name,
      status: "active",
      created_at: new Date().toISOString()
    };

    // Create Contributor Profile
    const newContribId = "CO_" + Math.floor(Math.random() * 900 + 100);
    const newContrib: Contributor = {
      id: newContribId,
      user_id: newUserId,
      tier: 1, // Start on Tier 1
      college: contribData.college,
      degree: contribData.degree,
      year_of_study: "1st Year",
      skill_scores: {
        reasoning: 50,
        domain: 50,
        language: 50,
        coding: 50
      },
      accuracy_score: 50,
      completion_rate: 0,
      iaa_score: 0.0,
      verification_status: "not_started", 
      kyc_status: "not_started",
      languages: contribData.languages,
      domains: contribData.domains,
      availability_hours: 10,
      bank_details: {
        upi_id: "",
        account_number: "",
        ifsc_code: "",
        holder_name: ""
      },
      earnings_balance: 0,
      total_earned: 0,
      status: "pending_verification",
      onboarded: false,
      referrals: [],
      growth_timeline: [
        { id: "GT_NEW_1", date: new Date().toISOString().split("T")[0], title: "Joined 2UNE Platform", subtitle: "Awaiting Skill Assessment completion", icon: "user" }
      ]
    };

    const newAuditLog: AuditLog = {
      id: "LOG_AUD_" + Math.floor(Math.random() * 90000 + 10000),
      user_name: contribData.name,
      user_id: newUserId,
      role: "contributor",
      action: `Submitted Student application of college ${contribData.college} with linked Aadhaar identifier. Verification pending.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z",
      ip: "127.0.0.1"
    };

    const newLogForSess: AuditLog = {
      id: "LOG_SESS_" + Math.floor(Math.random() * 9000 + 1000),
      user_id: newUserId,
      user_name: contribData.name,
      role: "contributor",
      action: `Logged into 2UNE Platform Portal (Automatic Join redirect): Session Initialized.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z",
      ip: "103.112." + Math.floor(Math.random() * 200) + "." + Math.floor(Math.random() * 250)
    };

    const newDbState = {
      ...db,
      users: [newUser, ...db.users],
      contributors: [newContrib, ...db.contributors],
      auditLogs: [newLogForSess, newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
    setLoggedInUser(newUser);
  };

  // FLOW 2 & 3: Ops manager verifies student Aadhaar KYC documents
  const handleVerifyContributor = (contributorId: string, status: "verified" | "failed") => {
    const updatedContributors = db.contributors.map(c => {
      if (c.id === contributorId) {
        return {
          ...c,
          verification_status: status,
          kyc_status: status,
          status: status === "verified" ? "active" as const : "suspended" as const
        };
      }
      return c;
    });

    const studentObj = db.contributors.find(c => c.id === contributorId);
    const studentUser = studentObj ? db.users.find(u => u.id === studentObj.user_id) : { name: "Candidate" };

    const newAuditLog: AuditLog = {
      id: "LOG_AUD_" + Math.floor(Math.random() * 90000 + 10000),
      user_name: loggedInUser?.name || "System PM",
      user_id: loggedInUser?.id || "O_PM",
      role: "platform_admin",
      action: `KYC clearance: ${status.toUpperCase()} student scholar credentials for ${studentUser?.name} (${studentObj?.college}).`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      contributors: updatedContributors,
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleDeleteContributors = (contributorIds: string[]) => {
    const updatedContributors = db.contributors.filter(c => !contributorIds.includes(c.id));
    
    const newAuditLog: AuditLog = {
      id: "LOG_AUD_" + Math.floor(Math.random() * 90000 + 10000),
      user_name: loggedInUser?.name || "System PM",
      user_id: loggedInUser?.id || "O_PM",
      role: "platform_admin",
      action: `Bulk deleted ${contributorIds.length} contributor profile(s): ${contributorIds.join(", ")}.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      contributors: updatedContributors,
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleImportContributors = (newCohorts: {
    name: string;
    email: string;
    college: string;
    degree: string;
    year_of_study: string;
    domains: string[];
    languages: string[];
    tier?: 1 | 2 | 3;
    verification_status?: "not_started" | "pending" | "verified" | "failed";
  }[]) => {
    const newUsers: User[] = [];
    const newContributors: Contributor[] = [];

    newCohorts.forEach(row => {
      const uId = "UR_" + Math.floor(Math.random() * 90000 + 10000);
      const cId = "CO_" + Math.floor(Math.random() * 900 + 100);

      const newUser: User = {
        id: uId,
        role: "contributor",
        email: row.email,
        name: row.name,
        status: "active",
        created_at: new Date().toISOString()
      };

      const newContributor: Contributor = {
        id: cId,
        user_id: uId,
        tier: row.tier || 1,
        college: row.college || "Unknown Institution",
        degree: row.degree || "B.Tech",
        year_of_study: row.year_of_study || "3rd Year",
        skill_scores: {
          reasoning: Math.floor(Math.random() * 20) + 80,
          domain: Math.floor(Math.random() * 20) + 80,
          language: Math.floor(Math.random() * 20) + 80,
          coding: Math.floor(Math.random() * 20) + 80
        },
        accuracy_score: Math.floor(Math.random() * 15) + 85,
        completion_rate: 100,
        iaa_score: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
        verification_status: row.verification_status || "pending",
        kyc_status: row.verification_status || "pending",
        languages: row.languages.length > 0 ? row.languages : ["English"],
        domains: row.domains.length > 0 ? row.domains : ["General Reasoning"],
        availability_hours: 15,
        bank_details: {
          account_number: "XXXX" + Math.floor(Math.random() * 9000 + 1000),
          ifsc_code: "SBIN0001043",
          upi_id: row.name.toLowerCase().replace(/\s+/g, "") + "@okaxis",
          holder_name: row.name
        },
        earnings_balance: 0,
        total_earned: 0,
        status: "active"
      };

      newUsers.push(newUser);
      newContributors.push(newContributor);
    });

    const newAuditLog: AuditLog = {
      id: "LOG_AUD_" + Math.floor(Math.random() * 90000 + 10000),
      user_name: loggedInUser?.name || "System PM",
      user_id: loggedInUser?.id || "O_PM",
      role: "platform_admin",
      action: `Onboarded cohort of ${newCohorts.length} test contributors via CSV.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      users: [...newUsers, ...db.users],
      contributors: [...newContributors, ...db.contributors],
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 2: Contributor completes and submits task to QA
  const handleCompleteTask = (taskId: string, response: TaskResponse, payout: number) => {
    const currentContributor = db.contributors.find(c => c.user_id === loggedInUser?.id);
    if (!currentContributor) return;

    const updatedTasks = db.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "in_qa" as const, // move into Quality Queue!
          assigned_contributor_id: currentContributor.id,
          submitted_at: new Date().toISOString(),
          response
        };
      }
      return t;
    });

    const newLog: AuditLog = {
      id: "LOG_TSK_" + Math.floor(Math.random() * 90000 + 10000),
      user_id: loggedInUser?.id || "U_C",
      user_name: loggedInUser?.name || "Student",
      role: "contributor",
      action: `Submitted Task ${taskId} response into secure audit pipeline. Provisional credit issued.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      tasks: updatedTasks,
      auditLogs: [newLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 3: Contributor Earnings Wallet updater
  const handleUpdateEarnings = (newBalance: number, amountAdded: number) => {
    const currentContributor = db.contributors.find(c => c.user_id === loggedInUser?.id);
    if (!currentContributor) return;

    const updatedContributors = db.contributors.map(c => {
      if (c.id === currentContributor.id) {
        return {
          ...c,
          earnings_balance: newBalance,
          total_earned: c.total_earned + amountAdded
        };
      }
      return c;
    });

    const newDbState = {
      ...db,
      contributors: updatedContributors
    };
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 3: Ops QA Auditor overrides and approves decision
  const handleQAOverride = (taskId: string, choice: "A" | "B", notes: string) => {
    const currentReviewingTask = db.tasks.find(t => t.id === taskId);
    if (!currentReviewingTask) return;

    const updatedTasks = db.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "approved" as const,
          qa_override_by: loggedInUser?.id || "O_PM",
          qa_notes: notes
        };
      }
      return t;
    });

    // Award direct payout to contributor balance since validated
    const updatedContributors = db.contributors.map(c => {
      if (c.id === currentReviewingTask.assigned_contributor_id) {
        return {
          ...c,
          earnings_balance: c.earnings_balance + currentReviewingTask.payout_amount,
          total_earned: c.total_earned + currentReviewingTask.payout_amount,
          accuracy_score: Math.min(100, c.accuracy_score + 1)
        };
      }
      return c;
    });

    const batchObj = db.batches.find(b => b.id === currentReviewingTask.batch_id);
    if (batchObj) {
      // Scale project completion counter
      db.projects = db.projects.map(p => {
        if (p.id === batchObj.project_id) {
          return {
            ...p,
            volume_completed: Math.min(p.volume_total, p.volume_completed + 1)
          };
        }
        return p;
      });
    }

    const reviewStudentObj = currentReviewingTask.assigned_contributor_id 
      ? db.contributors.find(co => co.id === currentReviewingTask.assigned_contributor_id) 
      : null;
    const scholarUserObj = reviewStudentObj ? db.users.find(usr => usr.id === reviewStudentObj.user_id) : { name: "Student" };

    const newAuditLog: AuditLog = {
      id: "LOG_QC_" + Math.floor(Math.random() * 90000 + 10000),
      user_id: loggedInUser?.id || "O_PM",
      user_name: loggedInUser?.name || "Senior Auditor",
      role: "qa_auditor",
      action: `Consensus Override cleared on ${taskId}. Approved Generation Option ${choice} for ${scholarUserObj?.name}'s submission. Payout dispatched.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      tasks: updatedTasks,
      contributors: updatedContributors,
      projects: db.projects,
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 3: PM generates new task batch dynamically
  const handleCreateTaskBatch = (newBatch: TaskBatch, newTasks: Task[]) => {
    const newAuditLog: AuditLog = {
      id: "LOG_QC_" + Math.floor(Math.random() * 90000 + 10000),
      user_id: loggedInUser?.id || "O_PM",
      user_name: loggedInUser?.name || "Lead PM",
      role: "platform_admin",
      action: `Created Task Batch ${newBatch.id} (${newBatch.name}) with ${newBatch.task_count} high-stakes guidelines. Assigned Tier ${newBatch.tier_required} scholars.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      batches: [newBatch, ...db.batches],
      tasks: [...newTasks, ...db.tasks],
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // FLOW 3: Clear and approve payment settlements
  const handleApprovePayment = (paymentId: string) => {
    const updatedPayments = db.payments.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: "paid" as const,
          processed_at: new Date().toISOString()
        };
      }
      return p;
    });

    const paymentObj = db.payments.find(p => p.id === paymentId);
    const payeeContrib = paymentObj ? db.contributors.find(c => c.id === paymentObj.contributor_id) : null;
    const payeeUser = payeeContrib ? db.users.find(u => u.id === payeeContrib.user_id) : { name: "Scholar" };

    const newAuditLog: AuditLog = {
      id: "LOG_FIN_" + Math.floor(Math.random() * 90000 + 10000),
      user_id: loggedInUser?.id || "O_FIN",
      user_name: loggedInUser?.name || "Finance Manager",
      role: "finance_ops",
      action: `Cleared Bulk IMPS Transfer Reference: Settled ${paymentObj?.amount} INR to Scholar ${payeeUser?.name}'s UPI wallet.`,
      timestamp: new Date().toISOString().replace("Z", "").substring(0, 19) + "Z"
    };

    const newDbState = {
      ...db,
      payments: updatedPayments,
      auditLogs: [newAuditLog, ...db.auditLogs]
    };

    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // Dedicated Calibration adder
  const handleAddCalibration = (newItem: CalibrationItem) => {
    const updatedCalibrations = [newItem, ...db.calibrations];
    const newDbState = { ...db, calibrations: updatedCalibrations };
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleUpdateProjectsList = (updated: Project[]) => {
    const newDbState = { ...db, projects: updated };
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleUpdateContributor = (updated: Contributor) => {
    if (!db) return;
    const newDbState = {
      ...db,
      contributors: db.contributors.map(c => c.id === updated.id ? updated : c)
    };
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  const handleUpdateDB = (fieldsToUpdate: Partial<typeof db>) => {
    if (!db) return;
    const newDbState = {
      ...db,
      ...fieldsToUpdate
    } as any;
    setDb(newDbState);
    savePlatformDB(newDbState);
  };

  // Helper for direct user switching
  const customerOrg = db.orgs.find(o => o.id === activeCustomerOrgId) || db.orgs[0];
  const matchedContributor = db.contributors.find(c => c.user_id === loggedInUser?.id);

  return (
    <div className="flex-1 min-h-screen bg-brand-black text-white relative">
      {/* Floating control bar for developers / sandbox testers */}
      <div className="fixed bottom-4 right-4 z-[9999] flex gap-2">
        <button 
          onClick={resetPlatformDB}
          title="Reset Sandbox Database"
          className="bg-brand-red text-white p-2.5 rounded-full hover:bg-brand-red/85 shadow-lg flex items-center gap-2 font-mono text-xs font-bold transition-all hover:scale-105 border border-white/10"
          id="sandbox-reset-btn"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          RESET SANDBOX
        </button>
      </div>

      {!loggedInUser ? (
        <AuthCover 
          users={db.users}
          orgs={db.orgs}
          onLogin={handleLogin}
          onRequestPilot={handleRequestPilot}
          onJoinContributor={handleJoinContributor}
        />
      ) : (
        <div className="animate-fade-in">
          {/* CUSTOMER VIEWS */}
          {(loggedInUser.role === "customer_admin" || loggedInUser.role === "customer_viewer") && (
            <CustomerPortal 
              user={loggedInUser}
              org={customerOrg}
              projects={db.projects}
              batches={db.batches}
              tasks={db.tasks}
              calibrations={db.calibrations}
              onUploadCalibration={handleAddCalibration}
              onLogout={handleLogout}
              onUpdateProjects={handleUpdateProjectsList}
            />
          )}

          {/* CONTRIBUTOR WORKSPACE */}
          {loggedInUser.role === "contributor" && matchedContributor && (
            <ContributorPortal 
              user={loggedInUser}
              contributor={matchedContributor}
              tasks={db.tasks}
              batches={db.batches}
              certifications={db.certifications.filter(c => c.contributor_id === matchedContributor.id)}
              onCompleteTask={handleCompleteTask}
              onLogout={handleLogout}
              onUpdateEarnings={handleUpdateEarnings}
              allContributors={db.contributors}
              allUsers={db.users}
              onUpdateContributor={handleUpdateContributor}
              onUpdateDB={handleUpdateDB}
            />
          )}

          {/* OPERATIONS ADMIN HUB */}
          {(loggedInUser.role === "platform_admin" || loggedInUser.role === "qa_auditor") && (
            <OperationsPortal 
              user={loggedInUser}
              customers={db.users}
              orgs={db.orgs}
              contributors={db.contributors}
              projects={db.projects}
              batches={db.batches}
              tasks={db.tasks}
              payments={db.payments}
              auditLogs={db.auditLogs}
              onVerifyContributor={handleVerifyContributor}
              onDeleteContributors={handleDeleteContributors}
              onImportContributors={handleImportContributors}
              onQAOverride={handleQAOverride}
              onApprovePayment={handleApprovePayment}
              onCreateTaskBatch={handleCreateTaskBatch}
              onLogout={handleLogout}
            />
          )}
          
          {/* Global AI Chatbot Companion */}
          <AIChatbot user={loggedInUser} />
        </div>
      )}
    </div>
  );
}
