export type HabitType = "vape" | "cigarettes";

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  habit: HabitType;
  consumed: boolean; // true = consumed, false = clean/did not consume
  quantity?: number; // amount smoked/vaped in that day
  reason?: string; // what was the main reason
  solution?: string; // solution to overcome it
  timestamp: string; // ISO datetime
}

export interface PlantAvatar {
  id: string;
  name: string;
  emoji: string;
  stageName: string;
  tagline: string;
  themeColor: string;
  bgColor: string;
}

export interface Quote {
  text: string;
  author: string;
}

export interface UrgeQuest {
  id: string;
  pillar: "Delay" | "Deep Breathe" | "Drink Water" | "Do Something Else";
  title: string;
  emoji: string;
  description: string;
  interactiveType: "bubble_pop" | "unscramble" | "breath_sync" | "water_fill" | "stretch_challenge" | "tap_rush" | "trivia_flash";
  triviaQuestion?: string;
  triviaAnswers?: string[];
  correctAnswerIndex?: number;
  unscrambleWord?: string;
  encouragement: string;
}

export interface SmokingProfile {
  habitType: "cigarette" | "vape" | "both" | "shisha";
  frequency: string;
  quitGoal: "complete" | "gradual" | "control_triggers";
  targetTimeline: "7_days" | "14_days" | "30_days" | "60_days";
  createdAt: string;
  /** Persisted after the first-run tutorial so returning sign-ins skip it */
  hasSeenTour?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  timestamp: string;
}

