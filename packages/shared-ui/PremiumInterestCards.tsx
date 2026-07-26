"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  premiumInterestFeatures,
  trackAnalyticsEvent,
  type PremiumInterestFeatureId,
  type PremiumInterestPlacement,
  type PremiumInterestToolId,
} from "./AnalyticsEvents";

export type PremiumInterestCandidate = {
  featureId: PremiumInterestFeatureId;
  name: string;
  description: string;
};

type PremiumInterestCardsProps = {
  toolId: PremiumInterestToolId;
  placement: PremiumInterestPlacement;
  candidates: readonly PremiumInterestCandidate[];
};

const STORAGE_PREFIX = "sakupla:premium-interest";

function storageKey(toolId: PremiumInterestToolId, featureId: string) {
  return `${STORAGE_PREFIX}:${toolId}:${featureId}`;
}

export function PremiumInterestCards({
  toolId,
  placement,
  candidates,
}: PremiumInterestCardsProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<PremiumInterestCandidate | null>(
    null,
  );
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = new Set<string>();
    try {
      for (const candidate of candidates) {
        if (
          window.localStorage.getItem(
            storageKey(toolId, candidate.featureId),
          )
        ) {
          saved.add(candidate.featureId);
        }
      }
    } catch {
      // Keep the component usable when browser storage is unavailable.
    }
    setConfirmed(saved);
  }, [candidates, toolId]);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("button:not([disabled])")
        ?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const closeDialog = () => {
    setSelected(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openDialog = (
    candidate: PremiumInterestCandidate,
    trigger: HTMLButtonElement,
  ) => {
    triggerRef.current = trigger;
    setSelected(candidate);
    trackAnalyticsEvent("premium_interest_open", {
      tool_id: toolId,
      feature_id: candidate.featureId,
      placement,
    });
  };

  const confirmInterest = () => {
    if (!selected || confirmed.has(selected.featureId)) return;
    try {
      window.localStorage.setItem(
        storageKey(toolId, selected.featureId),
        "confirmed",
      );
    } catch {
      // In-memory state still prevents repeat confirmation in this view.
    }
    setConfirmed((current) => new Set(current).add(selected.featureId));
    trackAnalyticsEvent("premium_interest_confirm", {
      tool_id: toolId,
      feature_id: selected.featureId,
      placement,
    });
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const validCandidates = candidates
    .filter((candidate) =>
      (premiumInterestFeatures[toolId] as readonly string[]).includes(
        candidate.featureId,
      ),
    )
    .slice(0, 2);

  if (!validCandidates.length) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:p-5"
      aria-labelledby={`${titleId}-section`}
    >
      <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">
        今後の改善候補
      </p>
      <h3 id={`${titleId}-section`} className="mt-1 text-lg font-black text-slate-950">
        この作業で、さらに省ける手間を教えてください
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        無料機能はそのまま利用できます。関心のある候補があれば、匿名で1件ずつ記録できます。
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {validCandidates.map((candidate) => {
          const isConfirmed = confirmed.has(candidate.featureId);
          return (
            <article
              key={candidate.featureId}
              className="rounded-2xl border border-violet-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-black text-slate-950">{candidate.name}</h4>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
                  開発検討中
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {candidate.description}
              </p>
              <button
                type="button"
                onClick={(event) => openDialog(candidate, event.currentTarget)}
                className="mt-3 min-h-11 rounded-full border border-violet-300 px-4 py-2 text-sm font-bold text-violet-800 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                {isConfirmed ? "記録内容を確認" : "詳しく見る"}
              </button>
            </article>
          );
        })}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onKeyDown={handleDialogKeyDown}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
                  開発検討中
                </span>
                <h2 id={titleId} className="mt-2 text-xl font-black">
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="閉じる"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                ×
              </button>
            </div>
            <div id={descriptionId} className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>{selected.description}</p>
              <p>
                この機能は現在開発を検討中です。料金・提供時期は未定で、現時点では利用できません。
              </p>
              <p>
                「興味があります」を押すと、個人情報を送らず、この機能への要望として記録します。
              </p>
            </div>
            {confirmed.has(selected.featureId) ? (
              <p
                role="status"
                className="mt-5 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800"
              >
                ご意見を記録しました
              </p>
            ) : (
              <button
                type="button"
                onClick={confirmInterest}
                className="mt-5 w-full rounded-full bg-violet-700 px-5 py-3 font-black text-white hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                興味があります
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
