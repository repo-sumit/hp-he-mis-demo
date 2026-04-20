import type { DiscrepancyScope } from "../data/scrutiny-provider";

export interface DiscrepancyTemplate {
  id: string;
  scope: DiscrepancyScope;
  labelEn: string;
  en: string; // with {docName} / {certName} placeholders
  hi: string;
}

/**
 * Seeded from the §14.6 discrepancy templates. Operators pick one of these
 * and we auto-fill the bilingual student message with the selected
 * document / certificate name — matches the §10.5 "dropdown of common
 * reasons per doc type" pattern.
 */
export const DISCREPANCY_TEMPLATES: readonly DiscrepancyTemplate[] = [
  {
    id: "document_blurry",
    scope: "document",
    labelEn: "Document is blurry",
    en: "{docName} is blurry. Seal or details are not clearly visible. Please upload a clearer photo.",
    hi: "{docName} धुंधला है। मुहर या विवरण स्पष्ट नहीं है। कृपया साफ़ फ़ोटो अपलोड करें।",
  },
  {
    id: "wrong_document_type",
    scope: "document",
    labelEn: "Wrong document type",
    en: "You uploaded the wrong document for {docName}. Please upload the correct one.",
    hi: "{docName} के लिए ग़लत दस्तावेज़ अपलोड हुआ है। कृपया सही दस्तावेज़ अपलोड करें।",
  },
  {
    id: "seal_missing",
    scope: "document",
    labelEn: "Seal or signature missing",
    en: "Official seal is not visible on {docName}. Please upload a scan or photo that clearly shows the seal.",
    hi: "{docName} पर आधिकारिक मुहर नहीं दिख रही। कृपया मुहर सहित फ़ोटो या स्कैन अपलोड करें।",
  },
  {
    id: "certificate_expired",
    scope: "document",
    labelEn: "Certificate has expired",
    en: "The {docName} you uploaded has expired. Please upload a valid certificate.",
    hi: "आपने जो {docName} अपलोड किया है वह अमान्य हो चुका है। कृपया वैध प्रमाणपत्र अपलोड करें।",
  },
  {
    id: "name_mismatch",
    scope: "document",
    labelEn: "Name mismatch on document",
    en: "The name on your {docName} doesn't match your profile. Please check and correct.",
    hi: "आपके {docName} पर नाम प्रोफ़ाइल से मेल नहीं खाता। कृपया जाँचें और सुधार करें।",
  },
  {
    id: "marks_mismatch",
    scope: "academic",
    labelEn: "Marks mismatch",
    en: "The best-of-five percentage you declared doesn't match your marksheet. Please check and update.",
    hi: "आपने जो सर्वोत्तम-पाँच प्रतिशत दिया है वह मार्कशीट से मेल नहीं खाता। कृपया जाँच कर सही करें।",
  },
  {
    id: "personal_name_mismatch",
    scope: "personal",
    labelEn: "Personal detail mismatch",
    en: "The details you entered don't match your ID. Please review and correct.",
    hi: "आपकी दी गई जानकारी पहचान से मेल नहीं खाती। कृपया जाँच कर सुधार करें।",
  },
  {
    id: "reservation_evidence_missing",
    scope: "reservation",
    labelEn: "Reservation evidence missing",
    en: "The evidence for your reservation claim is missing or unclear. Please re-upload the certificate.",
    hi: "आपके आरक्षण दावे का प्रमाण अधूरा या अस्पष्ट है। कृपया प्रमाणपत्र दोबारा अपलोड करें।",
  },
];

export function fillTemplate(
  template: string,
  vars: { docName?: string } = {},
): string {
  return template.replace(/\{docName\}/g, vars.docName ?? "this document");
}

export function templatesForScope(scope: DiscrepancyScope): DiscrepancyTemplate[] {
  return DISCREPANCY_TEMPLATES.filter((t) => t.scope === scope);
}
