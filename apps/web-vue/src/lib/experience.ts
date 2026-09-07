export type ExperienceState = 'new' | 'trial' | 'experienced'

const KEY = 'voice_bbs_experience_v1'
const TEST_ROOM_HINT = 'テスト雑談'

export function getExperience(storage: Storage = localStorage): ExperienceState {
  const value = storage.getItem(KEY)
  if (value === 'trial' || value === 'experienced') return value
  return 'new'
}

export function markTrial(storage: Storage = localStorage): void {
  if (getExperience(storage) === 'new') storage.setItem(KEY, 'trial')
}

export function markExperienced(storage: Storage = localStorage): void {
  storage.setItem(KEY, 'experienced')
}

export function isTestRoom(title: string | null | undefined): boolean {
  return (title ?? '').includes(TEST_ROOM_HINT)
}

export function shouldShowCreator(storage: Storage = localStorage): boolean {
  return getExperience(storage) === 'experienced'
}
