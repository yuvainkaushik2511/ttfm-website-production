"use client";

import { useCallback, useState } from "react";
import { applicationSteps, type ApplicationStepDef } from "@/data/creators";

export type FormValues = Record<string, string>;

interface UseMultiStepFormResult {
  step: number;
  direction: 1 | -1;
  values: FormValues;
  currentStepDef: ApplicationStepDef;
  isLastStep: boolean;
  isFirstStep: boolean;
  error: string | null;
  setField: (name: string, value: string) => void;
  next: () => void;
  back: () => void;
  submitted: boolean;
  submit: () => void;
}

export function useMultiStepForm(): UseMultiStepFormResult {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [values, setValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentStepDef = applicationSteps[step];
  const isLastStep = step === applicationSteps.length - 1;
  const isFirstStep = step === 0;

  const setField = useCallback((name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setError(null);
  }, []);

  const validateCurrent = useCallback(() => {
    const def = applicationSteps[step];
    const value = values[def.fieldName]?.trim();
    if (!value) {
      setError("This field is required.");
      return false;
    }
    return true;
  }, [step, values]);

  const next = useCallback(() => {
    if (!validateCurrent()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, applicationSteps.length - 1));
  }, [validateCurrent]);

  const back = useCallback(() => {
    setDirection(-1);
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const submit = useCallback(() => {
    if (!validateCurrent()) return;
    setSubmitted(true);
    // No backend/API route or server action exists anywhere else in this
    // codebase to send this to yet — wire this up once one does.
  }, [validateCurrent]);

  return {
    step,
    direction,
    values,
    currentStepDef,
    isLastStep,
    isFirstStep,
    error,
    setField,
    next,
    back,
    submitted,
    submit,
  };
}
