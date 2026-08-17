/** English relationship slug (from photo filenames or forms) -> Traditional Chinese term of address. */
export const RELATIONSHIP_ZH: Record<string, string> = {
  elder: "婆婆",
  son: "兒子",
  daughter: "女兒",
  grandson: "孫仔",
  granddaughter: "孫女",
  husband: "丈夫",
  wife: "妻子",
  "son-in-law": "女婿",
  "daughter-in-law": "新婦",
  brother: "兄弟",
  sister: "姊妹",
  "great-grandson": "曾孫",
  "great-granddaughter": "曾孫女",
  niece: "姪女",
  nephew: "姪仔",
  friend: "朋友",
};

/** Unmapped relationships get this placeholder instead of a silent blank. */
export function relationshipZh(relationshipEn: string): string {
  return RELATIONSHIP_ZH[relationshipEn] ?? `〔請編輯：${relationshipEn}〕`;
}
