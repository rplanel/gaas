import type { MaybeRef } from '#imports'
import type { GalaxyDataToolParameter, GalaxyTool, GalaxyToolParameters } from 'blendtype'
import { computed, ref, toValue, watch } from '#imports'
import { encodeParam } from 'ufo'

export type ToolInputParameter = Exclude<GalaxyToolParameters, GalaxyDataToolParameter>
export interface ToolQuery {
  toolId: string
  toolVersion: string
}

export function useGalaxyTool(toolParamQueries: MaybeRef<ToolQuery[]>) {
  // State
  const tools = ref<Record<string, GalaxyTool>>({})
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Computed

  /**
   * Extract for each tools, the parameters available.
   * Filter the input paramaters that are data.
   */
  const toolInputParameters = computed(() => {
    const toolsVal = toValue(tools)
    if (toolsVal) {
      return Object
        .entries(toolsVal)
        .reduce<Record<string, ToolInputParameter[]>>((acc, [toolId, tool]) => {
          const filteredInputs = tool.inputs.filter((input): input is ToolInputParameter => input.type !== 'data')
          acc[toolId] = filteredInputs
          return acc
        }, {} as Record<string, ToolInputParameter[]>)
    }
    return {}
  })

  // Methods
  const fetchTools = async () => {
    isLoading.value = true
    try {
      const fetchedTools = await Promise.all(toValue(toolParamQueries).map((toolQuery) => {
        const { toolId, toolVersion } = toolQuery
        return $fetch<GalaxyTool>(`/api/galaxy/tools/${encodeParam(toolId)}/${toolVersion}`)
      }))

      tools.value = fetchedTools.reduce<Record<string, GalaxyTool>>((acc, curr) => {
        acc[curr.id] = curr
        return acc
      }, {} as Record<string, GalaxyTool>)
    }
    catch (err) {
      error.value = err as Error
    }
    finally {
      isLoading.value = false
    }
  }

  watch(toolParamQueries, () => {
    fetchTools()
  })

  return {
    // State
    tools,
    isLoading,
    error,
    // Computed
    toolInputParameters,
  }
}
