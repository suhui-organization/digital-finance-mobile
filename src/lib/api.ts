/**
 * API client for the Mobile Web app.
 * Connects to the Go backend at the configured API_BASE_URL.
 *
 * V2 (DESIGN_DOC 9/16): supports customer_type + grouped profile payload.
 * V1 flat payload kept for backward compatibility during migration.
 *
 * V2 (DESIGN_DOC 26-31): proper auth with access/refresh tokens, auth guard.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:16080';

// --- Auth ---

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    display_name: string;
    role: string;
    status: string;
  };
}

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt: number = 0;

function getAccessToken(): string {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    cachedAccessToken = localStorage.getItem('mobile_access_token');
    cachedRefreshToken = localStorage.getItem('mobile_refresh_token');
    const exp = localStorage.getItem('mobile_token_expires');
    if (exp) tokenExpiresAt = parseInt(exp, 10);
  }
  return cachedAccessToken || '';
}

function getRefreshToken(): string {
  if (cachedRefreshToken) return cachedRefreshToken;
  if (typeof window !== 'undefined') {
    cachedRefreshToken = localStorage.getItem('mobile_refresh_token');
  }
  return cachedRefreshToken || '';
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  cachedAccessToken = accessToken;
  cachedRefreshToken = refreshToken;
  tokenExpiresAt = Date.now() + expiresIn * 1000;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mobile_access_token', accessToken);
    localStorage.setItem('mobile_refresh_token', refreshToken);
    localStorage.setItem('mobile_token_expires', tokenExpiresAt.toString());
    // Sync cookie for middleware authentication
    document.cookie = `auth_token=1; path=/; max-age=${expiresIn}; SameSite=Lax`;
  }
}

export function clearTokens(): void {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  tokenExpiresAt = 0;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mobile_access_token');
    localStorage.removeItem('mobile_refresh_token');
    localStorage.removeItem('mobile_token_expires');
  }
}

export function getCachedUser(): AuthTokens['user'] | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('mobile_user');
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignore */ }
    }
  }
  return null;
}

function setCachedUser(user: AuthTokens['user']): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mobile_user', JSON.stringify(user));
  }
}

export function clearCachedUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mobile_user');
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  let token = getAccessToken();

  if (!token || Date.now() >= tokenExpiresAt) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      token = getAccessToken();
    } else {
      clearTokens();
      clearCachedUser();
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(url, { ...options, headers });
      if (!retryRes.ok) {
        const errorBody = await retryRes.json().catch(() => ({ error: `HTTP ${retryRes.status}` }));
        throw new Error(errorBody.error || `Request failed with status ${retryRes.status}`);
      }
      return retryRes.json();
    }
    clearTokens();
    clearCachedUser();
    throw new Error('AUTH_TOKEN_EXPIRED: 会话已过期，请重新登录');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// --- Auth API ---

export async function login(username: string, password: string): Promise<AuthTokens> {
  const data = await apiFetch<AuthTokens>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, client_type: 'mobile' }),
  });
  setTokens(data.access_token, data.refresh_token, data.expires_in);
  setCachedUser(data.user);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
  } catch { /* best effort */ }
  clearTokens();
  clearCachedUser();
}

// --- Review API ---

export interface DebtDetailRequest {
  institution: string;
  total_amount: number;
  balance: number;
  loan_method: string;
  loan_due: string;
  repayment_method: string;
}

export interface CreateReviewRequest {
  customer_name: string;
  gender: string;
  age: number;
  marital_status: string;
  loan_amount: number;
  is_enterprise: boolean;
  main_bank: string;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  spouse_info: string;
  spouse_cooperate: boolean;
  highlights: string[];
  can_match: boolean;
  visit_time: string;
  debt_details: DebtDetailRequest[];
}

export interface CommonRequest {
  customer_name: string;
  gender: string;
  age: number;
  marital_status: string;
  loan_amount: number;
  is_enterprise: boolean;
  can_match: boolean;
  visit_time: string;
}

export interface IndividualProfileRequest {
  main_bank: string;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  spouse_info: string;
  spouse_cooperate: boolean;
  highlights: string[];
  debt_details: DebtDetailRequest[];
}

export interface EnterpriseProfileRequest {
  enterprise_name: string;
  unified_social_credit_code: string;
  enterprise_years: number;
  main_business: string;
  monthly_revenue: number;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  controller_cooperate: boolean;
  highlights: string[];
  debt_details: DebtDetailRequest[];
}

export interface CreateReviewV2Request {
  customer_type: "individual" | "enterprise";
  common: CommonRequest;
  individual_profile?: IndividualProfileRequest | null;
  enterprise_profile?: EnterpriseProfileRequest | null;
}

export interface IndividualProfileResponse {
  main_bank: string;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  spouse_info: string;
  spouse_cooperate: boolean;
  highlights: string[];
  total_debt: number;
}

export interface EnterpriseProfileResponse {
  enterprise_name: string;
  unified_social_credit_code: string;
  enterprise_years: number;
  main_business: string;
  monthly_revenue: number;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  controller_cooperate: boolean;
  highlights: string[];
  total_debt: number;
}

export interface ReviewResponse {
  id: string;
  customer_name: string;
  gender: string;
  age: number;
  marital_status: string;
  loan_amount: number;
  is_enterprise: boolean;
  main_bank: string;
  total_debt: number;
  credit_status: string;
  credit_query_1m: number;
  credit_query_3m: number;
  credit_query_6m: number;
  spouse_info: string;
  spouse_cooperate: boolean;
  highlights: string[];
  can_match: boolean;
  visit_time: string;
  created_by: string;
  ai_score: number | null;
  ai_risk_level: string | null;
  ai_summary: string | null;
  created_at: string;
  debt_details: DebtDetailRequest[];
  customer_type?: "individual" | "enterprise";
  enterprise_name?: string | null;
  unified_social_credit_code?: string | null;
  enterprise_years?: number | null;
  main_business?: string | null;
  monthly_revenue?: number | null;
  controller_cooperate?: boolean | null;
  enterprise_highlights?: string[] | null;
  individual_profile?: IndividualProfileResponse | null;
  enterprise_profile?: EnterpriseProfileResponse | null;
}

export interface ReviewListResponse {
  data: ReviewResponse[];
  page: number;
  page_size: number;
  total_count: number;
}

export async function createReviewV2(data: CreateReviewV2Request): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>('/api/v1/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>('/api/v1/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listReviews(page = 1, pageSize = 20): Promise<ReviewListResponse> {
  return apiFetch<ReviewListResponse>(`/api/v1/reviews?page=${page}&pageSize=${pageSize}`);
}

export async function listMyReviews(page = 1, pageSize = 20): Promise<ReviewListResponse> {
  return apiFetch<ReviewListResponse>(`/api/v1/reviews/mine?page=${page}&pageSize=${pageSize}`);
}

export async function getReview(id: string): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>(`/api/v1/reviews/${id}`);
}

export async function updateReviewV2(id: string, data: CreateReviewV2Request): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>(`/api/v1/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// --- ReviewResponse → ReviewForm mapping ---

import type { ReviewForm } from "./types";
import { defaultDebtDetail } from "./types";

function yn(b: boolean): string { return b ? "是" : "否"; }

export function mapReviewToForm(r: ReviewResponse): ReviewForm {
  const isEnterprise = r.customer_type === "enterprise";
  const common: ReviewForm = {
    visitTime: new Date(r.visit_time).toISOString().slice(0, 16),
    customerName: r.customer_name,
    gender: r.gender,
    age: r.age,
    maritalStatus: r.marital_status,
    loanAmount: r.loan_amount,
    isEnterprise: yn(r.is_enterprise),
    canMatch: yn(r.can_match),
    // defaults for both branches
    mainBank: r.main_bank || "",
    debtDetails: [],
    totalDebt: 0,
    creditStatus: r.credit_status || "",
    creditQuery1m: r.credit_query_1m || 0,
    creditQuery3m: r.credit_query_3m || 0,
    creditQuery6m: r.credit_query_6m || 0,
    spouseInfo: r.spouse_info || "",
    spouseCooperate: yn(r.spouse_cooperate),
    highlights: r.highlights || [],
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
  };

  if (isEnterprise) {
    common.enterpriseName = r.enterprise_name || "";
    common.unifiedSocialCreditCode = r.unified_social_credit_code || "";
    common.enterpriseYears = r.enterprise_years || 0;
    common.mainBusiness = r.main_business || "";
    common.monthlyRevenue = r.monthly_revenue || 0;
    common.enterpriseCreditStatus = r.credit_status || "";
    common.enterpriseCreditQuery1m = r.credit_query_1m || 0;
    common.enterpriseCreditQuery3m = r.credit_query_3m || 0;
    common.enterpriseCreditQuery6m = r.credit_query_6m || 0;
    common.controllerCooperate = yn(r.controller_cooperate || false);
    common.enterpriseHighlights = r.enterprise_highlights || [];
    if (r.debt_details?.length) {
      common.enterpriseDebtDetails = r.debt_details.map((d) => ({
        institution: d.institution,
        totalAmount: d.total_amount,
        balance: d.balance,
        loanMethod: d.loan_method,
        loanDue: d.loan_due,
        repaymentMethod: d.repayment_method,
      }));
      common.enterpriseTotalDebt = r.total_debt;
    }
  } else {
    if (r.debt_details?.length) {
      common.debtDetails = r.debt_details.map((d) => ({
        institution: d.institution,
        totalAmount: d.total_amount,
        balance: d.balance,
        loanMethod: d.loan_method,
        loanDue: d.loan_due,
        repaymentMethod: d.repayment_method,
      }));
      common.totalDebt = r.total_debt;
    }
  }

  return common;
}

// --- Lottery API ---

export interface Prize {
  id: string;
  name: string;
  probability: number;
  stock: number;
  image_url: string;
  is_active: boolean;
}

export interface LotteryActivity {
  id: string;
  name: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  prizes: Prize[];
}

export interface LotteryDrawResponse {
  won: boolean;
  prize?: Prize;
  message?: string;
}

export async function getLotteryActivity(): Promise<LotteryActivity> {
  return apiFetch<LotteryActivity>('/api/v1/lottery/activity');
}

export async function lotteryDraw(): Promise<LotteryDrawResponse> {
  return apiFetch<LotteryDrawResponse>('/api/v1/lottery/draw', {
    method: 'POST',
  });
}