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
  homeGames: "Play Games",
  gamesTitle: "Games",
  leaderboard: "Leaderboard",
  leaderboardEmpty: "No scores yet — play a round!",
  scoreUnit: (n: number) => `${n} pts`,

  // reminder popup (water + medication)
  reminderTitle: "Reminder",
  reminderQuestion: "Have you had some water and taken your medication?",
  reminderYes: "Done",
  reminderNo: "Not yet",
  reminderThanks: "Great, thank you",
  reminderLater: "No worries — remember to drink water and take your medicine",

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
