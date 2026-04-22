"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { FieldGroup, Input } from "@hp-mis/ui";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
  label: string;
  helper?: string;
  error?: string;
  /** Render extra content (e.g. an inline link) below the input. */
  adornment?: ReactNode;
};

/**
 * Student-friendly form field: label-above, always-visible helper text,
 * tall input per low-tech design rules. Wraps the shared FieldGroup + Input
 * primitives so Hindi-locale callers pick up the same bilingual treatment.
 */
export function Field({ label, helper, error, adornment, ...inputProps }: FieldProps) {
  return (
    <FieldGroup
      label={label}
      helper={!error ? helper : undefined}
      error={error}
    >
      <Input variant="filled" {...inputProps} />
      {adornment ? <div className="pt-0.5">{adornment}</div> : null}
    </FieldGroup>
  );
}
