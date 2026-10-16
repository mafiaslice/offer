"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

export type StackCardTone = "sunset" | "mint" | "night";

export type StackCard = {
  id: string;
  tabTitle: string;
  title: string;
  description: string;
  tone?: StackCardTone;
};

type ScrollStackDeckProps = {
  items: StackCard[];
  title: string;
  subtitle: string;
  scrollLabel?: string;
};

const toneClass: Record<StackCardTone, string> = {
  sunset: "from-[#ffcf91] via-[#ff7da8] to-purple",
  mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
  night: "from-[#29244b] via-[#6e49a8] to-error",
};

function buildCardKeyframes(index: number, totalCards: number) {
  const steps: number[] = [];
  const yValues: number[] = [];
  const scaleValues: number[] = [];
  const numTransitions = Math.max(totalCards - 1, 1);

  for (let step = 0; step <= numTransitions; step += 1) {
    steps.push(step / numTransitions);
    if (step < index) {
      yValues.push(520);
      scaleValues.push(1);
    } else if (step === index) {
      yValues.push(0);
      scaleValues.push(1);
    } else {
      const depth = step - index;
      yValues.push(-depth * 28);
      scaleValues.push(1 - depth * 0.035);
    }
  }

  if (index === 0) return { steps, y: yValues, scale: scaleValues };

  const entryStart = (index - 1) / numTransitions;
  const entryEnd = index / numTransitions;
  const fullSteps: number[] = [];
  const fullY: number[] = [];
  const fullScale: number[] = [];

  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i] < entryStart) {
      fullSteps.push(steps[i]);
      fullY.push(520);
      fullScale.push(1);
    }
  }

  fullSteps.push(entryStart);
  fullY.push(520);
  fullScale.push(1);

  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i] >= entryEnd) {
      fullSteps.push(steps[i]);
      fullY.push(yValues[i]);
      fullScale.push(scaleValues[i]);
    }
  }

  return { steps: fullSteps, y: fullY, scale: fullScale };
}

function CardFace({ item }: { item: StackCard }) {
  const tone = item.tone ?? "night";
  return (
    <article className="relative box-border w-full pt-11">
      <div className="absolute top-0 left-0 rounded-t-2xl bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px">
        <div className="flex h-10 w-40 items-center rounded-t-[15px] bg-[#211A35] px-4 text-sm font-medium text-white">
          <span className="truncate">{item.tabTitle}</span>
        </div>
      </div>
      <div className="rounded-b-3xl rounded-tr-3xl bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px shadow-card">
        <div className="grid gap-4 rounded-b-[23px] rounded-tr-[23px] bg-[#211A35]/95 p-4 backdrop-blur-xl sm:p-6">
          <div className={`h-28 rounded-2xl bg-gradient-to-br ${toneClass[tone]} sm:h-36`} />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-normal tracking-[-0.025em] text-white">{item.title}</h3>
            <p className="text-sm leading-6 text-purple-gray">{item.description}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function AnimatedCard({
  item,
  index,
  total,
  progress,
}: {
  item: StackCard;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const keyframes = buildCardKeyframes(index, total);
  const y = useTransform(progress, keyframes.steps, keyframes.y);
  const scale = useTransform(progress, keyframes.steps, keyframes.scale);

  return (
    <motion.div style={{ y, scale, zIndex: index + 1, transformOrigin: "center top" }} className="absolute inset-x-0 top-0 w-full">
      <CardFace item={item} />
    </motion.div>
  );
}

export function ScrollStackDeck({ items, title, subtitle, scrollLabel = "Scroll" }: ScrollStackDeckProps) {
  const reduce = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.2,
    restDelta: 0.001,
  });

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="star-showcase-heading">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <h2 id="star-showcase-heading" className="text-xl font-normal tracking-[-0.025em]">
            {title}
          </h2>
          {reduce ? null : (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-gray">
              {scrollLabel}
              <motion.svg
                aria-hidden="true"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v13M7 13.5 12 19l5-5.5" />
              </motion.svg>
            </span>
          )}
        </div>
        <p className="max-w-xl text-sm leading-6 text-purple-gray">{subtitle}</p>
      </div>

      {reduce ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <CardFace key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div ref={containerRef} className="relative" style={{ height: `${Math.max(items.length, 1) * 72}vh` }}>
          <div className="sticky top-20 isolate h-[24rem]">
            <div className="relative h-full w-full">
              {items.map((item, index) => (
                <AnimatedCard key={item.id} item={item} index={index} total={items.length} progress={progress} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ScrollStackDeck;
