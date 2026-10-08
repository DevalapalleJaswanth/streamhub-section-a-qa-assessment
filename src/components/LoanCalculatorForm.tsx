import { useRef, useState, type FormEvent } from 'react';
import type { LoanScenario } from '../domain/loanTypes';
import { hasValidInterestPrecision, LOAN_LIMITS } from '../domain/loanRules';

type LoanCalculatorFormProps = {
  initialValues: LoanScenario;
  onSubmit: (scenario: LoanScenario) => void;
};

type FormValues = {
  principal: string;
  annualInterestRate: string;
  tenureYears: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function toFormValues(values: LoanScenario): FormValues {
  return {
    principal: String(values.principal),
    annualInterestRate: String(values.annualInterestRate),
    tenureYears: String(values.tenureYears),
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const principal = Number(values.principal);
  const rate = Number(values.annualInterestRate);
  const years = Number(values.tenureYears);

  if (!values.principal || !Number.isSafeInteger(principal) || principal <= 0 || principal > LOAN_LIMITS.maxPrincipal) {
    errors.principal = 'Enter a whole-dollar loan amount between $1 and $1 billion.';
  }
  if (!values.annualInterestRate || !Number.isFinite(rate) || rate < 0 || rate > LOAN_LIMITS.maxAnnualInterestRate || !hasValidInterestPrecision(rate)) {
    errors.annualInterestRate = 'Enter an interest rate from 0 to 100 with up to two decimals.';
  }
  if (!values.tenureYears || !Number.isInteger(years) || years <= 0 || years > LOAN_LIMITS.maxTenureYears) {
    errors.tenureYears = 'Enter a whole number of years between 1 and 50.';
  }
  return errors;
}

export function LoanCalculatorForm({ initialValues, onSubmit }: LoanCalculatorFormProps) {
  const [values, setValues] = useState<FormValues>(toFormValues(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const principalInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const tenureInputRef = useRef<HTMLInputElement>(null);

  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    const firstInvalidField = Object.keys(validationErrors)[0] as keyof FormErrors | undefined;
    if (firstInvalidField) {
      const inputRefs = {
        principal: principalInputRef,
        annualInterestRate: rateInputRef,
        tenureYears: tenureInputRef,
      };
      inputRefs[firstInvalidField]?.current?.focus();
      return;
    }

    onSubmit({
      principal: Number(values.principal),
      annualInterestRate: Number(values.annualInterestRate),
      tenureYears: Number(values.tenureYears),
    });
  }

  return (
    <form className="calculator-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="principal">Loan amount</label>
        <div className="input-with-prefix">
          <span aria-hidden="true">$</span>
          <input
            id="principal"
            name="principal"
            type="number"
            min="1"
            max={LOAN_LIMITS.maxPrincipal}
            step="1"
            inputMode="decimal"
            required
            ref={principalInputRef}
            value={values.principal}
            onChange={(event) => updateValue('principal', event.target.value)}
            aria-invalid={Boolean(errors.principal)}
            aria-describedby={errors.principal ? 'principal-help principal-error' : 'principal-help'}
          />
        </div>
        <p className="field-help" id="principal-help">The amount you plan to borrow.</p>
        {errors.principal && <p className="field-error" id="principal-error" role="alert">{errors.principal}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="annual-interest-rate">Annual interest rate</label>
        <div className="input-with-suffix">
          <input
            id="annual-interest-rate"
            name="annualInterestRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            required
            ref={rateInputRef}
            value={values.annualInterestRate}
            onChange={(event) => updateValue('annualInterestRate', event.target.value)}
            aria-invalid={Boolean(errors.annualInterestRate)}
            aria-describedby={errors.annualInterestRate ? 'rate-help rate-error' : 'rate-help'}
          />
          <span aria-hidden="true">%</span>
        </div>
        <p className="field-help" id="rate-help">Your fixed annual interest rate.</p>
        {errors.annualInterestRate && <p className="field-error" id="rate-error" role="alert">{errors.annualInterestRate}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="tenure-years">Loan tenure</label>
        <div className="input-with-suffix">
          <input
            id="tenure-years"
            name="tenureYears"
            type="number"
            min="1"
            max="50"
            step="1"
            inputMode="numeric"
            required
            ref={tenureInputRef}
            value={values.tenureYears}
            onChange={(event) => updateValue('tenureYears', event.target.value)}
            aria-invalid={Boolean(errors.tenureYears)}
            aria-describedby={errors.tenureYears ? 'tenure-help tenure-error' : 'tenure-help'}
          />
          <span aria-hidden="true">years</span>
        </div>
        <p className="field-help" id="tenure-help">The number of years to repay the loan.</p>
        {errors.tenureYears && <p className="field-error" id="tenure-error" role="alert">{errors.tenureYears}</p>}
      </div>

      <button className="primary-button" type="submit">Calculate my loan</button>
    </form>
  );
}
