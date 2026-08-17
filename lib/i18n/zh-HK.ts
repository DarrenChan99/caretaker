/**
 * All Cantonese / Traditional Chinese UI strings, flat. No inline Chinese in components.
 * FLAG FOR REVIEW: machine-drafted register, not verified by a native speaker (§12).
 */
export const zhHK = {
  // Shared
  needsEdit: "〔請編輯：介紹句子〕",

  // /popo entry gate
  entryTitle: "開始",
  entryHint: "㩒一下開始",

  // /popo home
  greeting: (name: string) => `${name}，你好`,
  homeFamily: "家人",
  homeNews: "今日新聞",
  homeChat: "傾偈",
  someoneIsCalling: "有人搵你",

  // /popo/people
  whoIsThis: "佢係邊個",
  yourRelation: (relZh: string) => `你嘅${relZh}`,

  // /popo/news
  readToMe: "讀畀我聽",
  stop: "停",
  noNewsToday: "今日未有新聞",
  backHome: "返去",

  // /popo/call
  chat: "傾偈",
  hangUp: "收線",

  // relay: popo-side call screen
  incomingCallTitle: "有人搵你",
  answer: "接聽",
  iWantToSpeak: "我要講嘢",
  listening: "聽緊你講",
  connecting: "接緊線",
  connectionLostCalm: "而家連唔到線，請等一等",

  // /family strings that surface Chinese
  medNotConfirmed: "未確認食藥",
  medConfirmed: "已確認食藥",
} as const;
