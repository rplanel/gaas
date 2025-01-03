import type { MaybeRef } from '#imports'
import type { JobState, JobTerminalState } from 'blendtype'
import { JobTerminalStates } from 'blendtype'

export function useGalaxyJobState(): { isTerminalState: (state?: MaybeRef<JobState | null>) => boolean } {
  const isTerminalState = (state: MaybeRef<JobState | null> = null): boolean => {
    const stateVal = toValue(state)
    if (stateVal) {
      return JobTerminalStates.includes(toValue(state) as JobTerminalState)
    }
    else { return false }
  }

  return { isTerminalState }
}
