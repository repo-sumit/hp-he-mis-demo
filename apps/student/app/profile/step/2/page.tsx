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

// HP districts — the primary admission dataset only covers these twelve.
// Non-HP domicile students still pick from the same list for now; if they
// have no matching district they can use "Out of state" via a free-text
// permanent-address line.
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

// Indian states + UTs with Himachal Pradesh pinned first so domicile
// students don't have to scroll. Keeps the field auditable (no free text).
const INDIAN_STATES = [
  "Himachal Pradesh",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Common HP postal codes surfaced as <datalist> suggestions. Students can
// still type any 6-digit PIN; the list is just a shortcut. Ordered by
// district so a Shimla student sees Shimla PINs near the top.
const HP_PIN_SUGGESTIONS: Array<{ pin: string; label: string }> = [
  { pin: "171001", label: "Shimla — 171001" },
  { pin: "171002", label: "Shimla (Chhota Shimla) — 171002" },
  { pin: "171006", label: "Shimla (Sanjauli) — 171006" },
  { pin: "172001", label: "Rampur Bushahr — 172001" },
  { pin: "172107", label: "Reckong Peo (Kinnaur) — 172107" },
  { pin: "173001", label: "Solan — 173001" },
  { pin: "173205", label: "Nalagarh (Solan) — 173205" },
  { pin: "173212", label: "Kandaghat (Solan) — 173212" },
  { pin: "174001", label: "Bilaspur — 174001" },
  { pin: "174201", label: "Una — 174201" },
  { pin: "174306", label: "Nadaun (Hamirpur) — 174306" },
  { pin: "175001", label: "Mandi — 175001" },
  { pin: "175101", label: "Kullu — 175101" },
  { pin: "175125", label: "Manali (Kullu) — 175125" },
  { pin: "175132", label: "Keylong (Lahaul & Spiti) — 175132" },
  { pin: "176001", label: "Dharamshala (Kangra) — 176001" },
  { pin: "176061", label: "Palampur (Kangra) — 176061" },
  { pin: "176215", label: "Dharamshala (McLeodganj) — 176215" },
  { pin: "177001", label: "Hamirpur — 177001" },
  { pin: "177022", label: "Sujanpur Tira — 177022" },
  { pin: "176310", label: "Chamba — 176310" },
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

    if (!draft.correspondenceSame) {
      if (!draft.correspondenceAddress.trim())
        e.correspondenceAddress = t("error.required");
      if (!draft.correspondenceDistrict)
        e.correspondenceDistrict = t("error.required");
      if (!draft.correspondenceState.trim())
        e.correspondenceState = t("error.required");
      if (!draft.correspondencePincode)
        e.correspondencePincode = t("error.required");
      else if (!/^\d{6}$/.test(draft.correspondencePincode.replace(/\s+/g, "")))
        e.correspondencePincode = t("error.invalidPincode");
    }
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
  const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

  return (
    <PageShell
      backHref="/profile/step/1"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={2} />
      <AutosaveHint className="mb-4" />

      {/*
       * Shared HP PIN suggestions — referenced by `list="hp-pincodes"` on
       * both the permanent and correspondence PIN inputs. Students can
       * still type any 6-digit PIN; this just speeds up the common ones.
       */}
      <datalist id="hp-pincodes">
        {HP_PIN_SUGGESTIONS.map((p) => (
          <option key={p.pin} value={p.pin}>
            {p.label}
          </option>
        ))}
      </datalist>

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
          <Select
            name="state"
            label={t("field.state.label")}
            helper={t("field.state.helper")}
            placeholder={t("field.state.label")}
            options={stateOptions}
            value={draft.state}
            onChange={(event) => update("state", event.target.value)}
            error={errors.state}
          />
          <Field
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            list="hp-pincodes"
            maxLength={6}
            label={t("field.pincode.label")}
            helper={t("field.pincode.helper")}
            placeholder={t("field.pincode.placeholder")}
            value={draft.pincode}
            onChange={(event) =>
              update("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            error={errors.pincode}
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
            <>
              <Textarea
                name="correspondenceAddress"
                label={t("field.correspondenceAddress.label")}
                helper={t("field.correspondenceAddress.helper")}
                placeholder={t("field.correspondenceAddress.placeholder")}
                value={draft.correspondenceAddress}
                onChange={(event) => update("correspondenceAddress", event.target.value)}
                error={errors.correspondenceAddress}
              />
              <Select
                name="correspondenceDistrict"
                label={t("field.district.label")}
                helper={t("field.district.helper")}
                placeholder={t("field.district.label")}
                options={districtOptions}
                value={draft.correspondenceDistrict}
                onChange={(event) =>
                  update("correspondenceDistrict", event.target.value)
                }
                error={errors.correspondenceDistrict}
              />
              <Select
                name="correspondenceState"
                label={t("field.state.label")}
                helper={t("field.state.helper")}
                placeholder={t("field.state.label")}
                options={stateOptions}
                value={draft.correspondenceState}
                onChange={(event) => update("correspondenceState", event.target.value)}
                error={errors.correspondenceState}
              />
              <Field
                name="correspondencePincode"
                inputMode="numeric"
                autoComplete="postal-code"
                list="hp-pincodes"
                maxLength={6}
                label={t("field.pincode.label")}
                helper={t("field.pincode.helper")}
                placeholder={t("field.pincode.placeholder")}
                value={draft.correspondencePincode}
                onChange={(event) =>
                  update(
                    "correspondencePincode",
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                error={errors.correspondencePincode}
              />
            </>
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
