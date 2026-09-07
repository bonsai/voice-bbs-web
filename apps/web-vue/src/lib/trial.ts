export type ExperienceState = 'new' | 'trial' | 'experienced'

const KEY = 'voice_bbs_experience_v1'

interface TrialState {
  state: ExperienceState
  interactions: number
}

function read(storage: Storage): TrialState {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return { state: 'new', interactions: 0 }
    const parsed = JSON.parse(raw) as Partial<TrialState>
    const state: ExperienceState =
      parsed.state === 'trial' || parsed.state === 'experienced' ? parsed.state : 'new'
    return {
      state,
      interactions: typeof parsed.interactions === 'number' ? Math.max(0, parsed.interactions) : 0,
    }
  } catch {
    return { state: 'new', interactions: 0 }
  }
}

function write(storage: Storage, value: TrialState) {
  storage.setItem(KEY, JSON.stringify(value))
}

const threshold = Math.max(1, Number(import.meta.env.VITE_TRIAL_INTERACTION_THRESHOLD ?? 1) || 1)

export function getExperience(storage: Storage): TrialState {
  return read(storage)
}

export function startTrial(storage: Storage) {
  const current = read(storage)
  if (current.state === 'new') write(storage, { ...current, state: 'trial' })
}

export function recordTrialInteraction(storage: Storage): TrialState {
  const current = read(storage)
  if (current.state === 'experienced') return current

  const interactions = current.interactions + 1
  const state: ExperienceState = interactions >= threshold ? 'experienced' : 'trial'
  const next = { state, interactions }
  write(storage, next)
  return next
}
