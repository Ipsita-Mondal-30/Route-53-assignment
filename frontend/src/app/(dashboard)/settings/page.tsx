"use client";

import { LANGUAGE_OPTIONS, type VisualMode, useUserSettings } from "@/lib/user-settings";

const MODES: VisualMode[] = ["browser", "light", "dark"];

export default function UserSettingsPage() {
  const { language, visualMode, copy, setLanguage, setVisualMode } = useUserSettings();

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <h1 className="text-[24px] leading-8 font-bold text-white">{copy.title}</h1>
      <p className="mt-2 text-[14px] leading-5 text-[#aab7b8]">
        These preferences apply to this console and are stored in this browser.
      </p>

      <section className="mt-6 rounded-lg border border-[#545b64] p-5">
        <label className="block">
          <span className="mb-1.5 block text-[12px] text-[#aab7b8]">{copy.language}</span>
          <select
            className="console-input max-w-md"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as (typeof LANGUAGE_OPTIONS)[number]["value"])
            }
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-6 border-0 p-0">
          <legend className="mb-2.5 text-[12px] text-[#aab7b8]">
            {copy.visualMode} - <em>{copy.beta}</em>
          </legend>
          <div className="space-y-2.5">
            {MODES.map((mode) => (
              <label
                key={mode}
                className="flex cursor-pointer items-center gap-2.5 text-[14px] text-white"
              >
                <input
                  type="radio"
                  name="visual-mode-page"
                  value={mode}
                  checked={visualMode === mode}
                  onChange={() => setVisualMode(mode)}
                  className="accent-[#42b4ff]"
                />
                {mode === "browser"
                  ? copy.browserDefault
                  : mode === "light"
                    ? copy.light
                    : copy.dark}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
    </div>
  );
}
