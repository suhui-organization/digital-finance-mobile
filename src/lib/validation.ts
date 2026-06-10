import { ReviewForm } from "./types";

/**
 * Validation result (DESIGN_DOC 10).
 * Branch-aware: only validates fields for the currently active branch.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// --- DESIGN_DOC 10.1: Main form validation (always required) ---

function validateCommonFields(form: ReviewForm): string[] {
  const errors: string[] = [];
  if (!form.visitTime.trim()) errors.push("客户到访时间");
  if (!form.customerName.trim()) errors.push("客户姓名");
  if (!form.gender) errors.push("客户性别");
  if (!form.age || form.age < 18 || form.age > 120) errors.push("客户年龄（18-120）");
  if (!form.maritalStatus) errors.push("婚姻状况");
  if (!form.loanAmount || form.loanAmount < 0) errors.push("需求额度");
  if (!form.isEnterprise) errors.push("是否为企业客户");
  if (!form.canMatch) errors.push("是否可以匹配方案");
  return errors;
}

// --- DESIGN_DOC 10.2: Individual branch validation ---

function validateIndividualProfile(form: ReviewForm): string[] {
  const errors: string[] = [];
  if (!form.mainBank.trim()) errors.push("个人流水主要所在银行");

  const hasValidDebt = form.debtDetails.every(
    (d) =>
      d.institution.trim() &&
      d.totalAmount >= 0 &&
      d.balance >= 0 &&
      d.loanMethod &&
      d.loanDue.trim() &&
      d.repaymentMethod
  );
  if (form.debtDetails.length === 0 || !hasValidDebt)
    errors.push("个人负债情况说明（需完整填写至少1行）");

  if (!form.creditStatus) errors.push("征信当前状态");
  if (!form.creditQuery1m && form.creditQuery1m !== 0) errors.push("征信查询-近1月");
  if (!form.creditQuery3m && form.creditQuery3m !== 0) errors.push("征信查询-近3月");
  if (!form.creditQuery6m && form.creditQuery6m !== 0) errors.push("征信查询-近6月");
  if (!form.spouseInfo.trim()) errors.push("配偶情况说明");
  if (!form.spouseCooperate) errors.push("配偶是否能知晓和配合");
  if (form.highlights.length === 0) errors.push("个人亮点（至少选择1项）");
  return errors;
}

// --- DESIGN_DOC 10.3: Enterprise branch validation ---

function validateEnterpriseProfile(form: ReviewForm): string[] {
  const errors: string[] = [];
  if (!form.enterpriseName.trim()) errors.push("企业名称");
  if (!form.unifiedSocialCreditCode.trim()) errors.push("统一社会信用代码");
  if (form.enterpriseYears < 0) errors.push("企业成立年限（>=0）");
  if (!form.mainBusiness.trim()) errors.push("企业主营业务");
  if (form.monthlyRevenue < 0) errors.push("企业月均流水（>=0）");

  const hasValidDebt = form.enterpriseDebtDetails.every(
    (d) =>
      d.institution.trim() &&
      d.totalAmount >= 0 &&
      d.balance >= 0 &&
      d.loanMethod &&
      d.loanDue.trim() &&
      d.repaymentMethod
  );
  if (form.enterpriseDebtDetails.length === 0 || !hasValidDebt)
    errors.push("企业负债情况说明（需完整填写至少1行）");

  if (!form.enterpriseCreditStatus) errors.push("企业征信当前状态");
  if (!form.enterpriseCreditQuery1m && form.enterpriseCreditQuery1m !== 0)
    errors.push("企业征信查询-近1月");
  if (!form.enterpriseCreditQuery3m && form.enterpriseCreditQuery3m !== 0)
    errors.push("企业征信查询-近3月");
  if (!form.enterpriseCreditQuery6m && form.enterpriseCreditQuery6m !== 0)
    errors.push("企业征信查询-近6月");
  if (!form.controllerCooperate) errors.push("法人/实控人配合度");
  if (form.enterpriseHighlights.length === 0) errors.push("企业亮点（至少选择1项）");
  return errors;
}

// --- Branch-aware validation entry point ---

export function validateForm(form: ReviewForm): ValidationResult {
  // Main form always validated
  const errors = validateCommonFields(form);

  // Branch-specific validation
  if (form.isEnterprise === "否") {
    errors.push(...validateIndividualProfile(form));
  } else if (form.isEnterprise === "是") {
    errors.push(...validateEnterpriseProfile(form));
  }
  // If isEnterprise is empty (unselected), only common fields are validated.

  return { valid: errors.length === 0, errors };
}

/**
 * Progress calculation (DESIGN_DOC 11.1).
 * Counts filled fields from common + current branch.
 */
export function calcProgress(form: ReviewForm, formReady: boolean): number {
  if (!formReady) return 0;

  let count = 0;
  // Common fields
  if (form.visitTime) count++;
  if (form.customerName) count++;
  if (form.gender) count++;
  if (form.age) count++;
  if (form.maritalStatus) count++;
  if (form.loanAmount) count++;
  if (form.isEnterprise) count++;
  if (form.canMatch) count++;

  if (form.isEnterprise === "否") {
    // Individual profile
    if (form.mainBank) count++;
    const debtFilled = form.debtDetails.every(
      (d) => d.institution && d.loanMethod && d.loanDue && d.repaymentMethod && d.totalAmount >= 0 && d.balance >= 0
    );
    if (debtFilled && form.debtDetails.length > 0) count++;
    count++; // totalDebt auto-calc
    if (form.creditStatus) count++;
    if (form.creditQuery1m >= 0 || form.creditQuery3m >= 0 || form.creditQuery6m >= 0) count++;
    if (form.spouseInfo) count++;
    if (form.spouseCooperate) count++;
    if (form.highlights.length > 0) count++;
  } else if (form.isEnterprise === "是") {
    // Enterprise profile
    if (form.enterpriseName) count++;
    if (form.unifiedSocialCreditCode) count++;
    if (form.enterpriseYears >= 0) count++;
    if (form.mainBusiness) count++;
    if (form.monthlyRevenue >= 0) count++;
    const debtFilled = form.enterpriseDebtDetails.every(
      (d) => d.institution && d.loanMethod && d.loanDue && d.repaymentMethod && d.totalAmount >= 0 && d.balance >= 0
    );
    if (debtFilled && form.enterpriseDebtDetails.length > 0) count++;
    count++; // enterpriseTotalDebt auto-calc
    if (form.enterpriseCreditStatus) count++;
    if (form.enterpriseCreditQuery1m >= 0 || form.enterpriseCreditQuery3m >= 0 || form.enterpriseCreditQuery6m >= 0) count++;
    if (form.controllerCooperate) count++;
    if (form.enterpriseHighlights.length > 0) count++;
  }
  // If branch not selected, only common counts.

  return count;
}

/** Max progress total: common (8) + individual branch (8) = 16, or common (8) + enterprise (12) = 20 */
export function maxProgress(form: ReviewForm): number {
  if (form.isEnterprise === "否") return 16;
  if (form.isEnterprise === "是") return 20;
  return 8; // branch not selected
}