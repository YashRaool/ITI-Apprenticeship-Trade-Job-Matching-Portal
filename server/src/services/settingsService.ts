import * as settingsRepository from "../repositories/settingsRepository";

const SETTINGS_KEYS = {
  MAX_TRADE_SKILLS: "maxTradeSkillsPerStudent",
} as const;

const DEFAULTS: Record<string, string> = {
  [SETTINGS_KEYS.MAX_TRADE_SKILLS]: "5",
};

export async function getSettingValue(key: string): Promise<string> {
  const value = await settingsRepository.getSetting(key);
  return value ?? DEFAULTS[key] ?? "";
}

export async function getMaxTradeSkills(): Promise<number> {
  const raw = await getSettingValue(SETTINGS_KEYS.MAX_TRADE_SKILLS);
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? 5 : parsed;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await settingsRepository.upsertSetting(key, value);
}

export { SETTINGS_KEYS };
