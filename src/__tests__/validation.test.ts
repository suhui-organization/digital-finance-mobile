import { validateForm, ValidationResult } from "../lib/validation";
import { ReviewForm } from "../lib/types";

function createEmptyForm(): ReviewForm {
  return {
    visitTime: "",
    customerName: "",
    gender: "",
    age: 0,
    maritalStatus: "",
    loanAmount: 0,
    isEnterprise: "",
    mainBank: "",
    creditStatus: "",
    creditQuery1m: 0,
    creditQuery3m: 0,
    creditQuery6m: 0,
    spouseInfo: "",
    spouseCooperate: "",
    highlights: [],
    canMatch: "",
    debtDetails: [],
    enterpriseName: "",
    unifiedSocialCreditCode: "",
    enterpriseYears: 0,
    mainBusiness: "",
    monthlyRevenue: 0,
    enterpriseCreditStatus: "",
    enterpriseCreditQuery1m: 0,
    enterpriseCreditQuery3m: 0,
    enterpriseCreditQuery6m: 0,
    controllerCooperate: "",
    enterpriseHighlights: [],
    enterpriseDebtDetails: [],
  };
}

describe("validateForm", () => {
  it("空表单应返回无效结果", () => {
    const result = validateForm(createEmptyForm());
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("仅填写公共字段且有缺失项应报错", () => {
    const form = createEmptyForm();
    form.visitTime = "2025-01-15T10:30";
    form.customerName = "张三";

    const result = validateForm(form);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("年龄必须大于等于18岁", () => {
    const form = createEmptyForm();
    form.visitTime = "2025-01-15T10:30";
    form.customerName = "张三";
    form.gender = "男";
    form.age = 15; // invalid
    form.maritalStatus = "已婚";
    form.loanAmount = 500000;
    form.isEnterprise = "否";
    form.canMatch = "是";

    const result = validateForm(form);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("年龄"))).toBe(true);
  });

  it("年龄必须小于等于120岁", () => {
    const form = createEmptyForm();
    form.visitTime = "2025-01-15T10:30";
    form.customerName = "张三";
    form.gender = "男";
    form.age = 150; // invalid
    form.maritalStatus = "已婚";
    form.loanAmount = 500000;
    form.isEnterprise = "否";
    form.canMatch = "是";

    const result = validateForm(form);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("年龄"))).toBe(true);
  });

  it("个人分支应验证配偶信息", () => {
    const form = createEmptyForm();
    form.visitTime = "2025-01-15T10:30";
    form.customerName = "张三";
    form.gender = "男";
    form.age = 35;
    form.maritalStatus = "已婚";
    form.loanAmount = 500000;
    form.isEnterprise = "否";
    form.canMatch = "是";
    // 个人分支字段未填写

    const result = validateForm(form);
    expect(result.valid).toBe(false);
    // 应包含配偶相关错误
    expect(result.errors.some((e) => e.includes("配偶"))).toBe(true);
  });
});

describe("ValidationResult", () => {
  it("valid为true时errors应为空数组", () => {
    const result: ValidationResult = { valid: true, errors: [] };
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("valid为false时应包含错误信息", () => {
    const result: ValidationResult = {
      valid: false,
      errors: ["客户姓名", "客户年龄"],
    };
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });
});
