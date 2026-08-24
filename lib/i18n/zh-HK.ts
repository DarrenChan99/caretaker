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
  homeChat: "Messages",
  homeCall: "Call Family",
  homeCompanion: "Talk to Ah Mui",
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
  newMessageTitle: "You have a new message",
  listenToMessage: "Listen",
  answer: "Answer",
  iWantToSpeak: "I want to speak",
  listening: "Listening...",
  micUnavailable: "The microphone isn't working here. Please type your reply below.",
  connecting: "Connecting...",
  connectionLostCalm: "Can't connect right now, please wait",
  callEnded: "Call ended",
  companionConnecting: "Calling Ah Mui...",
  companionLive: "Ah Mui is listening",
  companionAgain: "Talk to Ah Mui again",
  companionUnavailable: "Ah Mui can't come to the phone right now.",
  noActiveCall: "No call right now",
  // Both sides of the video call see this one button, so it stays bilingual whatever
  // the demo override above does to the rest of the file.
  translateOff: "Translate · 翻譯",
  translateOn: "Translating · 翻譯緊",

  // video call — Popo's controls. She gets volume and a way out, nothing else:
  // a muted grandmother is a support call, not a feature.
  volumeDown: "Softer", // 細聲
  volumeUp: "Louder", // 大聲
  volume: "Volume", // 音量
  // "You can still hear him" is load-bearing, not decoration — without it a dark
  // tile reads as a dropped call.
  // No name interpolated: splicing a Latin name into this line is what produces
  // "Ken熄咗個鏡頭" once the Cantonese values come back.
  cameraOff: "The camera is off", // 個鏡頭熄咗
  stillHear: "You can still hear them", // 你仲聽到佢
  // Plain words, never 08:14 — a clock readout is not what she needs from a call.
  callDuration: (mins: number, name: string) => `You talked with ${name} for ${mins} minutes`,

  // missed call, shown as a card on her home screen
  missedCall: "Missed call",
  justCalled: (name: string) => `${name} just called you`, // {name}啱啱打過嚟
  callBack: "Call back", // 打返俾佢

  // /family strings that surface Chinese
  medNotConfirmed: "Medication not confirmed",
  medConfirmed: "Medication confirmed",
} as const;
