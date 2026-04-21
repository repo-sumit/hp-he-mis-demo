"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { Field } from "../../../_components/field";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useReviewReturn } from "../../../_components/profile/use-review-return";
import { Select } from "../../../_components/form/select";
import { Textarea } from "../../../_components/form/textarea";
import { Toggle } from "../../../_components/form/toggle";

type Errors = Record<string, string>;

// HP districts appear first, then key non-HP states. The picker is short enough
// (<=16 options) to keep a single native <select> per §10.2's dropdown rule.
const HP_DISTRICTS = [
  "Bilaspur",
  "Chamba",
  "Hamirpur",
  "Kangra",
  "Kinnaur",
  "Kullu",
  "Lahaul & Spiti",
  "Mandi",
  "Shimla",
  "Sirmaur",
  "Solan",
  "Una",
];

export default function Step2Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`field-${focus}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      node instanceof HTMLInputElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLTextAreaElement
    ) {
      node.focus({ preventScroll: true });
    }
  }, [focus]);

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.permanentAddress.trim()) e.permanentAddress = t("error.required");
    if (!draft.district) e.district = t("error.required");
    if (!draft.state.trim()) e.state = t("error.required");
    if (!draft.pincode) e.pincode = t("error.required");
    else if (!/^\d{6}$/.test(draft.pincode.replace(/\s+/g, "")))
      e.pincode = t("error.invalidPincode");
    if (!draft.correspondenceSame && !draft.correspondenceAddress.trim())
      e.correspondenceAddress = t("error.required");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/3");
  }

  const districtOptions = HP_DISTRICTS.map((d) => ({ value: d, label: d }));

  return (
    <PageShell
      backHref="/profile/step/1"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={2} />
      <AutosaveHint className="mb-4" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step2.permanentSection")}
          </h3>
          <Textarea
            name="permanentAddress"
            label={t("field.permanentAddress.label")}
            helper={t("field.permanentAddress.helper")}
            placeholder={t("field.permanentAddress.placeholder")}
            value={draft.permanentAddress}
            onChange={(event) => update("permanentAddress", event.target.value)}
            error={errors.permanentAddress}
            autoComplete="street-address"
          />
          <Select
            name="district"
            label={t("field.district.label")}
            helper={t("field.district.helper")}
            placeholder={t("field.district.label")}
            options={districtOptions}
            value={draft.district}
            onChange={(event) => update("district", event.target.value)}
            error={errors.district}
          />
          <Field
            name="state"
            label={t("field.state.label")}
            value={draft.state}
            onChange={(event) => update("state", event.target.value)}
            error={errors.state}
          />
          <Field
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            label={t("field.pincode.label")}
            helper={t("field.pincode.helper")}
            placeholder={t("field.pincode.placeholder")}
            value={draft.pincode}
            onChange={(event) => update("pincode", event.target.value)}
            error={errors.pincode}
            adornment={
              <a
                href="#"
                className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
              >
                {t("field.pincode.finder")}
              </a>
            }
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step2.correspondenceSection")}
          </h3>
          <Toggle
            label={t("field.correspondenceSame.label")}
            helper={t("field.correspondenceSame.helper")}
            value={draft.correspondenceSame}
            onChange={(v) => update("correspondenceSame", v)}
          />
          {!draft.correspondenceSame ? (
            <Textarea
              name="correspondenceAddress"
              label={t("field.correspondenceAddress.label")}
              helper={t("field.correspondenceAddress.helper")}
              placeholder={t("field.correspondenceAddress.placeholder")}
              value={draft.correspondenceAddress}
              onChange={(event) => update("correspondenceAddress", event.target.value)}
              error={errors.correspondenceAddress}
            />
          ) : null}
        </section>

        {Object.keys(errors).length > 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
            ⚠ {t("error.fixBeforeContinue")}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <PrimaryButton type="submit">{t(saveLabelKey)}</PrimaryButton>
        </div>
      </form>
     </div>
    </PageShell>
  );
}
