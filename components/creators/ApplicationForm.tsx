"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMultiStepForm } from "@/lib/useMultiStepForm";
import { applicationSteps } from "@/data/creators";
import MagneticButton from "@/components/ui/MagneticButton";
import SplitHeading from "@/components/ui/SplitHeading";
import GlassPanel from "@/components/creators/GlassPanel";

// Genuinely new — zero <form> exists anywhere else in this codebase. One real
// <form>, one <fieldset> per step (only the active step's fields in the DOM),
// GSAP clipPath step transitions in `direction` (the Navbar.tsx mobile-menu
// clipPath reveal is the house style for this), a 6-dot progress rail (the
// Ecosystem.tsx dot-rail pattern). Full a11y since this is the only real input
// surface on the site: labels, an aria-live step announcer, and focus moved to
// the new step's legend on every change.
export default function ApplicationForm() {
  const {
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
  } = useMultiStepForm();
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const legendRef = useRef<HTMLLegendElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = fieldsetRef.current;
    if (!el) return;
    registerGsap();

    if (reducedMotion) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
    } else {
      // Plain `opacity`, not `autoAlpha` — autoAlpha also toggles CSS
      // `visibility`, and the browser silently refuses to focus a descendant of
      // a visibility:hidden element. That broke the legend.focus() call below:
      // fromTo's "from" state (opacity 0) briefly computed visibility:hidden
      // before the tween had animated away from it.
      gsap.fromTo(
        el,
        {
          clipPath: direction === 1 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
          opacity: 0,
        },
        { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.6, ease: "power4.out" }
      );
    }

    legendRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      submit();
    } else {
      next();
    }
  };

  return (
    <section id="apply" className="relative overflow-hidden border-t border-line bg-ink py-28 md:py-36">
      <div className="container-px mx-auto max-w-2xl">
        <span className="eyebrow">Creator Application</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 text-4xl font-semibold text-paper md:text-5xl"
        >
          Apply to join the roster.
        </SplitHeading>

        {submitted ? (
          <GlassPanel className="mt-14 p-10 text-center">
            <span className="eyebrow text-ember">Application received</span>
            <p className="mt-4 text-lg text-paper">
              We&rsquo;ll review your submission and reach out if it&rsquo;s a fit.
            </p>
          </GlassPanel>
        ) : (
          <form onSubmit={handleSubmit} className="mt-14" noValidate>
            <div aria-live="polite" className="sr-only">
              Step {step + 1} of {applicationSteps.length}: {currentStepDef.title}
            </div>

            <div className="mb-8 flex items-center gap-2">
              {applicationSteps.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 bg-ember" : i < step ? "w-4 bg-ember/50" : "w-1.5 bg-paper-dim/40"
                  }`}
                />
              ))}
            </div>

            <div className="overflow-hidden">
              <GlassPanel className="p-8 md:p-10">
                <fieldset ref={fieldsetRef} className="border-none p-0">
                  <legend
                    ref={legendRef}
                    tabIndex={-1}
                    className="font-display text-2xl font-medium text-paper outline-none md:text-3xl"
                  >
                    {currentStepDef.title}
                  </legend>
                  <p className="mt-2 text-sm text-paper-dim">{currentStepDef.question}</p>

                  <div className="mt-6">
                    <label htmlFor={currentStepDef.fieldName} className="sr-only">
                      {currentStepDef.title}
                    </label>
                    {currentStepDef.fieldType === "select" ? (
                      <select
                        id={currentStepDef.fieldName}
                        value={values[currentStepDef.fieldName] ?? ""}
                        onChange={(e) => setField(currentStepDef.fieldName, e.target.value)}
                        className="w-full rounded-xl border border-line bg-ink-raised/60 px-4 py-3 text-paper focus-visible:outline-ember"
                      >
                        <option value="" disabled>
                          Select one
                        </option>
                        {currentStepDef.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : currentStepDef.fieldType === "textarea" || currentStepDef.fieldType === "links" ? (
                      <textarea
                        id={currentStepDef.fieldName}
                        value={values[currentStepDef.fieldName] ?? ""}
                        onChange={(e) => setField(currentStepDef.fieldName, e.target.value)}
                        placeholder={currentStepDef.placeholder}
                        rows={4}
                        className="w-full rounded-xl border border-line bg-ink-raised/60 px-4 py-3 text-paper placeholder:text-steel focus-visible:outline-ember"
                      />
                    ) : (
                      <input
                        id={currentStepDef.fieldName}
                        type="text"
                        value={values[currentStepDef.fieldName] ?? ""}
                        onChange={(e) => setField(currentStepDef.fieldName, e.target.value)}
                        placeholder={currentStepDef.placeholder}
                        className="w-full rounded-xl border border-line bg-ink-raised/60 px-4 py-3 text-paper placeholder:text-steel focus-visible:outline-ember"
                      />
                    )}
                    {error && (
                      <p role="alert" className="mt-2 text-sm text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                </fieldset>
              </GlassPanel>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={isFirstStep}
                data-cursor="link"
                className="eyebrow text-paper-dim transition-colors hover:text-paper disabled:opacity-0"
              >
                Back
              </button>
              <MagneticButton className="rounded-full bg-paper px-8 py-4 font-display text-base font-medium text-ink hover:bg-ember">
                {isLastStep ? "Submit Application" : "Continue"}
              </MagneticButton>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
