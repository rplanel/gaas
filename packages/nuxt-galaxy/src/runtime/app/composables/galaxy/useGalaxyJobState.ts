import type { JobState, JobTerminalState } from 'blendtype'
import type { MaybeRef } from 'vue'
import { JobTerminalStates } from 'blendtype'
import { toValue } from 'vue'

export function useGalaxyJobState(): {
  isTerminalState: (state?: MaybeRef<JobState | null>) => boolean
} {
  const isTerminalState = (state: MaybeRef<JobState | null> = null): boolean => {
    const stateVal = toValue(state)
    if (stateVal) {
      return JobTerminalStates.includes(toValue(state) as JobTerminalState)
    }
    else { return false }
  }

  return { isTerminalState }
}
