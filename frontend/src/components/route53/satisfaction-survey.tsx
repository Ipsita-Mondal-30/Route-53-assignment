"use client";

import { useEffect, useId, useRef, useState } from "react";

import { StarIcon } from "@/components/ui/icons";

const RATINGS = [1, 2, 3, 4, 5] as const;
const DISMISS_KEY = "route53-satisfaction-dismissed";

export function SatisfactionSurvey() {
  const [open, setOpen] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const titleId = useId();
  const groupId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setRating(null);
    setSubmitted(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  function submit() {
    if (rating == null) {
      return;
    }
    setSubmitted(true);
  }

  useEffect(() => {
    if (!submitted) {
      return;
    }
    const timer = window.setTimeout(() => {
      setOpen(false);
      setRating(null);
      setSubmitted(false);
      sessionStorage.setItem(DISMISS_KEY, "1");
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [submitted]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Rate this website"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setSubmitted(false);
          setOpen(true);
        }}
        className="satisfaction-trigger aws-focus"
      >
        <StarIcon className="satisfaction-trigger-star h-[18px] w-[18px]" />
      </button>

      {open ? (
        <div className="satisfaction-root">
          <div
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className="satisfaction-dialog"
          >
            {submitted ? (
              <p className="satisfaction-thanks">Thank you for your feedback.</p>
            ) : (
              <>
                <button
                  type="button"
                  className="satisfaction-close aws-focus"
                  aria-label="Close survey"
                  onClick={close}
                >
                  <span aria-hidden="true">×</span>
                </button>

                <h2 id={titleId} className="satisfaction-title">
                  Based on your visit today, how satisfied are you with the
                  website?
                </h2>

                <fieldset className="satisfaction-scale">
                  <legend className="sr-only">
                    Satisfaction rating from 1 to 5
                  </legend>
                  <div className="satisfaction-options">
                    {RATINGS.map((value) => {
                      const inputId = `${groupId}-${value}`;
                      return (
                        <label
                          key={value}
                          htmlFor={inputId}
                          className="satisfaction-option"
                        >
                          <input
                            id={inputId}
                            className="satisfaction-radio"
                            type="radio"
                            name={groupId}
                            value={value}
                            checked={rating === value}
                            onChange={() => setRating(value)}
                          />
                          <span className="satisfaction-number">{value}</span>
                        </label>
                      );
                    })}
                    <span className="satisfaction-caption satisfaction-caption-start">
                      Not satisfied
                      <br />
                      at all
                    </span>
                    <span className="satisfaction-caption satisfaction-caption-end">
                      Very satisfied
                    </span>
                  </div>
                </fieldset>

                <div className="satisfaction-actions">
                  <button
                    type="button"
                    className="satisfaction-continue"
                    disabled={rating == null}
                    onClick={submit}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
