export type UserRole =
  | "customer_admin"
  | "customer_viewer"
  | "contributor"
  | "account_lead"
  | "project_manager"
  | "qa_auditor"
  | "workforce_manager"
  | "finance_ops"
  | "platform_admin";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  status: "active" | "inactive" | "pending";
  created_at: string;
  avatar_url?: string;
}

export type OrgContractType = "pilot" | "per_task" | "outcome_retainer";

export interface Organization {
  id: string;
  name: string;
  industry: string;
  tier: "pilot" | "active" | "enterprise";
  account_lead_id: string; // references User.id
  contract_type: OrgContractType;
  status: "active" | "pending" | "suspended";
  created_at: string;
  gstin?: string;
}

export interface Contributor {
  id: string;
  user_id: string;
  tier: 1 | 2 | 3;
  college: string;
  degree: string;
  year_of_study: string;
  skill_scores: {
    reasoning: number;
    domain: number;
    language: number;
    coding: number;
  };
  accuracy_score: number; // 0-100
  completion_rate: number; // percentage
  iaa_score: number; // index between 0 and 1
  verification_status: "not_started" | "pending" | "verified" | "failed";
  kyc_status: "not_started" | "pending" | "verified" | "failed";
  languages: string[];
  domains: string[];
  availability_hours: number; // hours per week
  bank_details: {
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
    holder_name?: string;
  };
  earnings_balance: number;
  total_earned: number;
  status: "active" | "pending_verification" | "suspended";
  onboarded?: boolean;
  referred_by?: string;
  referrals?: Array<{ name: string; email: string; status: "pending" | "completed"; reward_earned: number }>;
  growth_timeline?: Array<{ id: string; date: string; title: string; subtitle: string; icon: string; score?: number }>;
}

export type ProjectUseCase =
  | "Indic Language RLHF"
  | "Voice Agent Evaluation"
  | "Coding & Reasoning Eval"
  | "Safety & Red Teaming"
  | "Benchmark Design"
  | "Enterprise AI Validation";

export type ProjectStatus = "draft" | "active" | "completed" | "paused";

export interface Milestone {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  tasks_count: number;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  use_case: ProjectUseCase;
  status: ProjectStatus;
  task_types: string[]; // e.g. ["RLHF", "Voice_Eval"]
  languages: string[];
  volume_total: number;
  volume_completed: number;
  quality_threshold: number; // minimum accuracy %, e.g., 85
  sla_params: {
    turnaround_hours: number;
    guaranteed_accuracy: number;
  };
  milestones: Milestone[];
  rubric_id: string;
  data_sensitivity: "Public" | "Confidential" | "Highly Confidential";
  created_at: string;
  description: string;
}

export type BatchStatus = "draft" | "active" | "in_progress" | "under_review" | "delivered";

export interface TaskBatch {
  id: string;
  project_id: string;
  name: string;
  status: BatchStatus;
  task_count: number;
  tier_required: 1 | 2 | 3;
  instructions: string;
  rubric_id: string;
  created_at: string;
}

export type TaskStatus =
  | "unassigned"
  | "assigned"
  | "submitted"
  | "in_qa"
  | "approved"
  | "rejected";

export type TaskType = "RLHF" | "Indic_Language_Eval" | "Voice_Agent_Eval" | "Coding_Eval" | "Safety_Red_Team" | "Benchmark_Design";

export interface TaskContent {
  // Common properties
  prompt: string;
  
  // RLHF Preference fields
  response_a?: string;
  response_b?: string;
  
  // Voice Agent fields
  audio_url?: string;
  transcript?: string;

  // Code Eval fields
  code_snippet?: string;
  language?: string;

  // Red Teaming
  system_instructions?: string;
  category?: string;
}

export interface TaskResponse {
  // RLHF Preferred
  preferred_response?: "A" | "B";
  
  // Rubrics rating
  accuracy_rating?: number; // 1-5
  helpfulness_rating?: number; // 1-5
  safety_rating?: number; // 1-5
  tone_rating?: number; // 1-5
  fluency_rating?: number; // 1-5 (for Indic Language)
  cultural_appropriateness_rating?: number; // 1-5
  grammar_rating?: number; // 1-5
  code_efficiency_rating?: number; // 1-5 (for Coding)
  code_style_rating?: number; // 1-5
  voice_naturalness_rating?: number; // 1-5 (for Voice)
  voice_intent_accuracy_rating?: number; // 1-5

  // Qualitative notes
  justification: string;
  suggested_reformulation?: string;
  corrected_indices_or_text?: string;
  flag_harmful?: boolean;
  harm_category?: string;
}

export interface Task {
  id: string;
  batch_id: string;
  status: TaskStatus;
  task_type: TaskType;
  content: TaskContent;
  assigned_contributor_id?: string;
  submitted_at?: string;
  response?: TaskResponse;
  qa_override_by?: string; // User.id
  qa_notes?: string;
  time_taken_seconds?: number;
  payout_amount: number; // e.g. 150
}

export interface SkillAssessment {
  id: string;
  contributor_id: string;
  type: "General Reasoning" | "Indic Language" | "Coding Evaluation" | "Domain Expert";
  score: number; // 0-100
  passed: boolean;
  taken_at: string;
}

export type PaymentStatus = "pending" | "processing" | "paid" | "failed";

export interface Payment {
  id: string;
  contributor_id: string;
  amount: number;
  period: string; // e.g. "June 1-7, 2026"
  task_ids: string[];
  status: PaymentStatus;
  processed_at?: string;
}

export interface CalibrationItem {
  id: string;
  batch_id: string;
  task_id: string;
  customer_answer: string;
  consensus_answer: string;
  agreement_percentage: number;
  status: "reviewed" | "pending";
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  action: string;
  timestamp: string;
  ip?: string;
}

export interface Certification {
  id: string;
  contributor_id: string;
  type: "RLHF Evaluator" | "Indic Language Specialist" | "Safety Reviewer" | "Coding Evaluator" | "Expert Auditor";
  issued_at: string;
  expiry_at: string;
  badge_url: string;
}
