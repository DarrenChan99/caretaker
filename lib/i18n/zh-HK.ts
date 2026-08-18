/**
 * All Cantonese / Traditional Chinese UI strings, flat. No inline Chinese in components.
 * FLAG FOR REVIEW: machine-drafted register, not verified by a native speaker (§12).
 *
 * Demo override: values below are English for the /popo demo. The export name (zhHK)
 * and keys are unchanged so no import sites needed to move — swap values back to
 * Cantonese to restore the real elder-facing copy.
 */
export const zhHK = {
  // Shared
  needsEdit: "[Please edit: intro sentence]",

  // /popo entry gate
  entryTitle: "Start",
  entryHint: "Tap to start",

  // /popo home
  greeting: (name: string) => `Hi, ${name}`,
  homeFamily: "Family",
  homeNews: "Today's News",
  homeChat: "Chat",
  someoneIsCalling: "Someone is calling you",

  // /popo/people
  whoIsThis: "Who is this",
  yourRelation: (relZh: string) => `Your ${relZh}`,

  // /popo/news
  readToMe: "Read to me",
  stop: "Stop",
  noNewsToday: "No news today",
  backHome: "Home",

  // /popo/games
  homeGames: "玩遊戲",
  gamesTitle: "玩遊戲",
  leaderboard: "最高分",
  leaderboardEmpty: "仲未有分數，玩一鋪先啦",
  scoreUnit: (n: number) => `${n} 分`,

  // reminder popup (water + medication)
  reminderTitle: "提提你",
  reminderQuestion: "婆婆，飲咗水同食咗藥未呀？",
  reminderYes: "食咗喇",
  reminderNo: "未呀",
  reminderThanks: "好呀，多謝婆婆",
  reminderLater: "唔緊要，得閒飲啖水、食粒藥啦",

  // /popo/call
  chat: "Chat",
  hangUp: "Hang up",

  // relay: popo-side call screen
  incomingCallTitle: "Someone is calling you",
  answer: "Answer",
  iWantToSpeak: "I want to speak",
  listening: "Listening...",
  connecting: "Connecting...",
  connectionLostCalm: "Can't connect right now, please wait",

  // /family strings that surface Chinese
  medNotConfirmed: "Medication not confirmed",
  medConfirmed: "Medication confirmed",
} as const;
