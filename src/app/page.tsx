"use client";

import CheckboxGroup from "@/components/CheckboxGroup";
import CreditQueryInput from "@/components/CreditQueryInput";
import DebtTable from "@/components/DebtTable";
import FormSection from "@/components/FormSection";
import ProgressBar from "@/components/ProgressBar";
import RadioGroup from "@/components/RadioGroup";
import SuccessModal from "@/components/SuccessModal";
import Toast from "@/components/Toast";
import {
  createReviewV2,
  type CommonRequest,
  type CreateReviewV2Request,
  type DebtDetailRequest,
  type EnterpriseProfileRequest,
  type IndividualProfileRequest,
} from "@/lib/api";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage";
import type { ReviewForm } from "@/lib/types";
import { defaultReviewForm } from "@/lib/types";
import { calcProgress, maxProgress, validateForm } from "@/lib/validation";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const [form, setForm] = useState<ReviewForm>(defaultReviewForm);
  const [formReady, setFormReady] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdReviewId, setCreatedReviewId] = useState<string | null>(null);

  // Hydration-safe init: defer localStorage reads to mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setForm((prev) => ({ ...prev, ...draft }));
      setToast({ msg: "已恢复上次填写的草稿", type: "info" });
    }
    setFormReady(true);
  }, []);

  const inputClass =
    "w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-colors";

  const update = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const currentProgress = formReady ? calcProgress(form, formReady) : 0;
  const progressTotal = maxProgress(form);

  // Auto-save draft on form change
  useEffect(() => {
    if (formReady) saveDraft(form);
  }, [form, formReady]);

  // --- Individual debt recalc ---
  const recalcIndividualTotal = useCallback((debtDetails: ReviewForm["debtDetails"]) => {
    const total = debtDetails.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    setForm((prev) => ({ ...prev, debtDetails, totalDebt: total }));
  }, []);

  // --- Enterprise debt recalc ---
  const recalcEnterpriseTotal = useCallback((debtDetails: ReviewForm["enterpriseDebtDetails"]) => {
    const total = debtDetails.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    setForm((prev) => ({ ...prev, enterpriseDebtDetails: debtDetails, enterpriseTotalDebt: total }));
  }, []);

  // --- Branch-aware submit (DESIGN_DOC 9.2 / 16.2) ---
  const handleSubmit = useCallback(async () => {
    const { valid, errors } = validateForm(form);
    if (!valid) {
      setToast({
        msg: `请完善：${errors.slice(0, 3).join("、")}${errors.length > 3 ? "等" : ""}`,
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    const isEnterpriseBranch = form.isEnterprise === "是";

    const common: CommonRequest = {
      customer_name: form.customerName,
      gender: form.gender,
      age: form.age,
      marital_status: form.maritalStatus,
      loan_amount: form.loanAmount,
      is_enterprise: isEnterpriseBranch,
      can_match: form.canMatch === "是",
      visit_time: form.visitTime,
    };

    let individualProfile: IndividualProfileRequest | null = null;
    let enterpriseProfile: EnterpriseProfileRequest | null = null;

    if (isEnterpriseBranch) {
      const debtDetails: DebtDetailRequest[] = form.enterpriseDebtDetails.map((d) => ({
        institution: d.institution,
        total_amount: d.totalAmount,
        balance: d.balance,
        loan_method: d.loanMethod,
        loan_due: d.loanDue,
        repayment_method: d.repaymentMethod,
      }));

      enterpriseProfile = {
        enterprise_name: form.enterpriseName,
        unified_social_credit_code: form.unifiedSocialCreditCode,
        enterprise_years: form.enterpriseYears,
        main_business: form.mainBusiness,
        monthly_revenue: form.monthlyRevenue,
        credit_status: form.enterpriseCreditStatus,
        credit_query_1m: form.enterpriseCreditQuery1m,
        credit_query_3m: form.enterpriseCreditQuery3m,
        credit_query_6m: form.enterpriseCreditQuery6m,
        controller_cooperate: form.controllerCooperate === "是",
        highlights: form.enterpriseHighlights,
        debt_details: debtDetails,
      };
    } else {
      const debtDetails: DebtDetailRequest[] = form.debtDetails.map((d) => ({
        institution: d.institution,
        total_amount: d.totalAmount,
        balance: d.balance,
        loan_method: d.loanMethod,
        loan_due: d.loanDue,
        repayment_method: d.repaymentMethod,
      }));

      individualProfile = {
        main_bank: form.mainBank,
        credit_status: form.creditStatus,
        credit_query_1m: form.creditQuery1m,
        credit_query_3m: form.creditQuery3m,
        credit_query_6m: form.creditQuery6m,
        spouse_info: form.spouseInfo,
        spouse_cooperate: form.spouseCooperate === "是",
        highlights: form.highlights,
        debt_details: debtDetails,
      };
    }

    const payload: CreateReviewV2Request = {
      customer_type: isEnterpriseBranch ? "enterprise" : "individual",
      common,
      individual_profile: individualProfile,
      enterprise_profile: enterpriseProfile,
    };

    try {
      const result = await createReviewV2(payload);
      setCreatedReviewId(result.id);
      clearDraft();
      setShowSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "提交失败";
      setToast({ msg: `提交失败：${msg}`, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const handleReset = useCallback(() => {
    setShowSuccess(false);
    setForm(defaultReviewForm());
  }, []);

  const isIndividual = form.isEnterprise === "否";
  const isEnterprise = form.isEnterprise === "是";

  return (
    <>
      <div className="bg-[#1e3a5f] text-white p-5 rounded-[10px] mb-3 text-center shadow-[0_4px_12px_rgba(30,58,95,0.15)]">
        <h1 className="text-lg font-semibold tracking-[0.5px]">融资资质尽职审查报告</h1>
        <p className="text-xs opacity-85 mt-1 leading-relaxed">
          填表人须逐项核实客户信息，确保经营数据、负债情况、征信记录真实完整。
        </p>
      </div>

      <ProgressBar filled={currentProgress} total={progressTotal} />

      {/* ====== MAIN FORM (always visible, DESIGN_DOC 8.1) ====== */}
      <FormSection number={1} title="客户到访时间">
        <input
          type="datetime-local"
          value={form.visitTime}
          onChange={(e) => update("visitTime", e.target.value)}
          className={inputClass}
        />
      </FormSection>

      <FormSection number={2} title="客户姓名">
        <input
          type="text"
          placeholder="请输入"
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
          className={inputClass}
        />
      </FormSection>

      <FormSection number={3} title="客户性别">
        <RadioGroup
          name="gender"
          options={[
            { label: "男", value: "男" },
            { label: "女", value: "女" },
          ]}
          value={form.gender}
          onChange={(v) => update("gender", v)}
        />
      </FormSection>

      <FormSection number={4} title="客户年龄">
        <input
          type="number"
          placeholder="请输入数字（整数）"
          min={18}
          max={120}
          value={form.age || ""}
          onChange={(e) => update("age", parseInt(e.target.value) || 0)}
          className={inputClass}
        />
      </FormSection>

      <FormSection number={5} title="婚姻状况">
        <RadioGroup
          name="marital"
          variant="col-4"
          options={["单身", "已婚", "离异", "丧偶"].map((v) => ({ label: v, value: v }))}
          value={form.maritalStatus}
          onChange={(v) => update("maritalStatus", v)}
        />
      </FormSection>

      <FormSection number={6} title="需求额度">
        <input
          type="number"
          placeholder="请输入数字（整数）元"
          min={0}
          value={form.loanAmount || ""}
          onChange={(e) => update("loanAmount", parseFloat(e.target.value) || 0)}
          className={inputClass}
        />
      </FormSection>

      <FormSection number={7} title="是否为企业客户（分支开关）">
        <RadioGroup
          name="enterprise"
          options={[
            { label: "是", value: "是" },
            { label: "否", value: "否" },
          ]}
          value={form.isEnterprise}
          onChange={(v) => update("isEnterprise", v)}
        />
      </FormSection>

      {/* ====== INDIVIDUAL SUB-FORM (DESIGN_DOC 8.2) ====== */}
      {isIndividual && (
        <>
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-4 py-2 mb-2 text-xs text-[#3b82f6] font-medium">
            📋 个人客户信息
          </div>

          <FormSection number={8} title="个人流水主要所在银行">
            <input
              type="text"
              placeholder="请输入"
              value={form.mainBank}
              onChange={(e) => update("mainBank", e.target.value)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={9} title="个人负债情况说明" id="debtDetails">
            <DebtTable items={form.debtDetails} onChange={recalcIndividualTotal} />
          </FormSection>

          <FormSection number={10} title="个人负债总额" required={false}>
            <input
              type="text"
              disabled
              value={form.totalDebt.toFixed(2)}
              className={`${inputClass} bg-gray-100 text-gray-500`}
            />
            <p className="text-[11px] text-[#3b82f6] mt-1">
              该数值根据第9题&ldquo;余额&rdquo;列自动计算
            </p>
          </FormSection>

          <FormSection number={11} title="征信当前状态">
            <RadioGroup
              name="creditStatus"
              variant="col-4"
              options={["正常", "当前逾期", "呆账", "关注", "代偿", "法诉", "其他", "情况说明"].map(
                (v) => ({ label: v, value: v })
              )}
              value={form.creditStatus}
              onChange={(v) => update("creditStatus", v)}
            />
          </FormSection>

          <FormSection number={12} title="征信查询">
            <CreditQueryInput
              value1m={form.creditQuery1m}
              value3m={form.creditQuery3m}
              value6m={form.creditQuery6m}
              onChange1m={(v) => update("creditQuery1m", v)}
              onChange3m={(v) => update("creditQuery3m", v)}
              onChange6m={(v) => update("creditQuery6m", v)}
            />
          </FormSection>

          <FormSection number={13} title="配偶情况说明">
            <input
              type="text"
              placeholder="请输入"
              value={form.spouseInfo}
              onChange={(e) => update("spouseInfo", e.target.value)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={14} title="配偶是否能知晓和配合">
            <RadioGroup
              name="spouse"
              options={[
                { label: "是", value: "是" },
                { label: "否", value: "否" },
              ]}
              value={form.spouseCooperate}
              onChange={(v) => update("spouseCooperate", v)}
            />
          </FormSection>

          <FormSection
            number={15}
            title="个人亮点"
            hint={`此题已选择 ${form.highlights.length}/6 项`}
          >
            <CheckboxGroup
              options={["不动产", "车", "公积金", "打卡工资", "其它亮点", "其它亮点说明"].map(
                (v) => ({ label: v, value: v })
              )}
              values={form.highlights}
              onChange={(v) => update("highlights", v)}
            />
          </FormSection>
        </>
      )}

      {/* ====== ENTERPRISE SUB-FORM (DESIGN_DOC 8.3) ====== */}
      {isEnterprise && (
        <>
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-lg px-4 py-2 mb-2 text-xs text-[#92400e] font-medium">
            🏢 企业客户信息
          </div>

          <FormSection number={8} title="企业名称">
            <input
              type="text"
              placeholder="请输入"
              value={form.enterpriseName}
              onChange={(e) => update("enterpriseName", e.target.value)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={9} title="统一社会信用代码">
            <input
              type="text"
              placeholder="请输入"
              value={form.unifiedSocialCreditCode}
              onChange={(e) => update("unifiedSocialCreditCode", e.target.value)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={10} title="企业成立年限（年）">
            <input
              type="number"
              placeholder="请输入"
              min={0}
              value={form.enterpriseYears || ""}
              onChange={(e) => update("enterpriseYears", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={11} title="企业主营业务">
            <input
              type="text"
              placeholder="请输入"
              value={form.mainBusiness}
              onChange={(e) => update("mainBusiness", e.target.value)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={12} title="企业月均流水（元）">
            <input
              type="number"
              placeholder="请输入"
              min={0}
              value={form.monthlyRevenue || ""}
              onChange={(e) => update("monthlyRevenue", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </FormSection>

          <FormSection number={13} title="企业负债情况说明" id="enterpriseDebtDetails">
            <DebtTable items={form.enterpriseDebtDetails} onChange={recalcEnterpriseTotal} />
          </FormSection>

          <FormSection number={14} title="企业负债总额" required={false}>
            <input
              type="text"
              disabled
              value={form.enterpriseTotalDebt.toFixed(2)}
              className={`${inputClass} bg-gray-100 text-gray-500`}
            />
            <p className="text-[11px] text-[#3b82f6] mt-1">
              该数值根据第13题&ldquo;余额&rdquo;列自动计算
            </p>
          </FormSection>

          <FormSection number={15} title="企业征信当前状态">
            <RadioGroup
              name="enterpriseCreditStatus"
              variant="col-4"
              options={["正常", "当前逾期", "呆账", "关注", "代偿", "法诉", "其他", "情况说明"].map(
                (v) => ({ label: v, value: v })
              )}
              value={form.enterpriseCreditStatus}
              onChange={(v) => update("enterpriseCreditStatus", v)}
            />
          </FormSection>

          <FormSection number={16} title="企业征信查询">
            <CreditQueryInput
              value1m={form.enterpriseCreditQuery1m}
              value3m={form.enterpriseCreditQuery3m}
              value6m={form.enterpriseCreditQuery6m}
              onChange1m={(v) => update("enterpriseCreditQuery1m", v)}
              onChange3m={(v) => update("enterpriseCreditQuery3m", v)}
              onChange6m={(v) => update("enterpriseCreditQuery6m", v)}
            />
          </FormSection>

          <FormSection number={17} title="法人/实控人配合度">
            <RadioGroup
              name="controllerCooperate"
              options={[
                { label: "是", value: "是" },
                { label: "否", value: "否" },
              ]}
              value={form.controllerCooperate}
              onChange={(v) => update("controllerCooperate", v)}
            />
          </FormSection>

          <FormSection
            number={18}
            title="企业亮点"
            hint={`此题已选择 ${form.enterpriseHighlights.length}/5 项`}
          >
            <CheckboxGroup
              options={["纳税稳定", "开票稳定", "固定资产", "上下游稳定", "其他"].map(
                (v) => ({ label: v, value: v })
              )}
              values={form.enterpriseHighlights}
              onChange={(v) => update("enterpriseHighlights", v)}
            />
          </FormSection>
        </>
      )}

      {/* ====== MAIN FORM TAIL (DESIGN_DOC 6.2 item 8) ====== */}
      <FormSection number={isEnterprise ? 19 : 16} title="是否可以匹配方案？">
        <RadioGroup
          name="match"
          options={[
            { label: "是", value: "是" },
            { label: "否", value: "否" },
          ]}
          value={form.canMatch}
          onChange={(v) => update("canMatch", v)}
        />
      </FormSection>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-[10px] font-semibold text-base tracking-[2px] shadow-[0_4px_12px_rgba(30,58,95,0.3)] active:scale-[0.97] transition-transform mb-2 disabled:opacity-50 disabled:active:scale-100"
      >
        {submitting ? "提交中..." : "提 交"}
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showSuccess && <SuccessModal onReset={handleReset} reviewId={createdReviewId} />}
    </>
  );
}