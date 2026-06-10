export interface DebtDetail {
  institution: string;
  totalAmount: number;
  balance: number;
  loanMethod: string;
  loanDue: string;
  repaymentMethod: string;
}

export type CustomerType = "individual" | "enterprise";

// --- DESIGN_DOC 8.1: Common fields (main form) ---
export interface CommonFields {
  visitTime: string;
  customerName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  loanAmount: number;
  isEnterprise: string; // "是" | "否"
  canMatch: string;     // "是" | "否"
}

// --- DESIGN_DOC 8.2: Individual profile fields ---
export interface IndividualProfile {
  mainBank: string;
  debtDetails: DebtDetail[];
  totalDebt: number;
  creditStatus: string;
  creditQuery1m: number;
  creditQuery3m: number;
  creditQuery6m: number;
  spouseInfo: string;
  spouseCooperate: string; // "是" | "否"
  highlights: string[];
}

// --- DESIGN_DOC 8.3: Enterprise profile fields ---
export interface EnterpriseProfile {
  enterpriseName: string;
  unifiedSocialCreditCode: string;
  enterpriseYears: number;
  mainBusiness: string;
  monthlyRevenue: number;
  debtDetails: DebtDetail[];
  totalDebt: number;
  creditStatus: string;
  creditQuery1m: number;
  creditQuery3m: number;
  creditQuery6m: number;
  controllerCooperate: string; // "是" | "否"
  highlights: string[];
}

// --- Unified form state (used in page.tsx) ---
export interface ReviewForm {
  // Common
  visitTime: string;
  customerName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  loanAmount: number;
  isEnterprise: string; // "是" | "否"
  canMatch: string;     // "是" | "否"

  // Individual profile
  mainBank: string;
  debtDetails: DebtDetail[];
  totalDebt: number;
  creditStatus: string;
  creditQuery1m: number;
  creditQuery3m: number;
  creditQuery6m: number;
  spouseInfo: string;
  spouseCooperate: string;
  highlights: string[];

  // Enterprise profile
  enterpriseName: string;
  unifiedSocialCreditCode: string;
  enterpriseYears: number;
  mainBusiness: string;
  monthlyRevenue: number;
  enterpriseDebtDetails: DebtDetail[];
  enterpriseTotalDebt: number;
  enterpriseCreditStatus: string;
  enterpriseCreditQuery1m: number;
  enterpriseCreditQuery3m: number;
  enterpriseCreditQuery6m: number;
  controllerCooperate: string;
  enterpriseHighlights: string[];
}

export const defaultDebtDetail = (): DebtDetail => ({
  institution: "",
  totalAmount: 0,
  balance: 0,
  loanMethod: "",
  loanDue: "",
  repaymentMethod: "",
});

export const defaultReviewForm = (): ReviewForm => ({
  visitTime: "",
  customerName: "",
  gender: "",
  age: 0,
  maritalStatus: "",
  loanAmount: 0,
  isEnterprise: "",
  canMatch: "",
  mainBank: "",
  debtDetails: [defaultDebtDetail()],
  totalDebt: 0,
  creditStatus: "",
  creditQuery1m: 0,
  creditQuery3m: 0,
  creditQuery6m: 0,
  spouseInfo: "",
  spouseCooperate: "",
  highlights: [],
  enterpriseName: "",
  unifiedSocialCreditCode: "",
  enterpriseYears: 0,
  mainBusiness: "",
  monthlyRevenue: 0,
  enterpriseDebtDetails: [defaultDebtDetail()],
  enterpriseTotalDebt: 0,
  enterpriseCreditStatus: "",
  enterpriseCreditQuery1m: 0,
  enterpriseCreditQuery3m: 0,
  enterpriseCreditQuery6m: 0,
  controllerCooperate: "",
  enterpriseHighlights: [],
});