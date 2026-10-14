"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import useMeasure from "react-use-measure";

export type MultiStep = {
  title: string;
  description: string;
};

type MultiStepFormProps = {
  steps: MultiStep[];
  step: number;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
};

export function MultiStepForm({ steps, step, children, footer, className }: MultiStepFormProps) {
  const reduce = Boolean(useReducedMotion());
  const [direction, setDirection] = useState(1);
  const [previousStep, setPreviousStep] = useState(step);
  const [ref, bounds] = useMeasure();

  if (step !== previousStep) {
    setPreviousStep(step);
    setDirection(step > previousStep ? 1 : -1);
  }

  const current = steps[step] ?? steps[0];
  const variants = reduce
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: (nextDirection: number) => ({ x: `${80 * nextDirection}%`, opacity: 0 }),
        animate: { x: "0%", opacity: 1 },
        exit: (nextDirection: number) => ({ x: `${-80 * nextDirection}%`, opacity: 0 }),
      };

  return (
    <MotionConfig transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0 }}>
      <section className={cn("overflow-hidden rounded-[1.75rem] bg-white shadow-[0_14px_34px_rgba(53,32,79,0.08)]", className)}>
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-7">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-purple uppercase">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.03em]">{current.title}</h2>
            <p className="mt-1 text-sm text-purple-gray">{current.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1" aria-hidden="true">
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={cn("h-2 rounded-full bg-purple/20 transition-all", index === step ? "w-8 bg-purple" : "w-2")}
              />
            ))}
          </div>
        </div>

        <motion.div
          animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
          className="relative overflow-hidden"
          transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.45 }}
        >
          <div ref={ref}>
            <div className="px-5 py-5 sm:px-7">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 px-5 py-4 sm:px-7">{footer}</div>
      </section>
    </MotionConfig>
  );
}

export default MultiStepForm;
