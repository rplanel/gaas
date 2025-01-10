import type { TagCollection } from './tag'
import type { GalaxyToolParameters, GalaxyToolParameterValue } from './tool'
import { z } from 'zod'

export type SrcInput = 'hda' | 'ldda' | 'ld' | 'hdca'

export type GalaxyWorkflowInput = Record<
  string,
  {
    id: string
    src: SrcInput
    uuid?: string
    dbid?: number
  }
>

const workflowStepTypes = ['data_input', 'parameter_input', 'data_collection_input', 'tool'] as const

export type WorkflowStepType = typeof workflowStepTypes[number]

export interface WorkflowInput {
  label: string
  value: string
  uuid: string
}

export type GalaxyWorkflowParameters = Record<string, string | boolean>

export interface WorkflowInputStep {
  source_step: number
  step_output: string
}

export interface WorkflowStep {
  id: number
  type: WorkflowStepType
  tool_id: null | string
  tool_version: null | string
  annotation: null | string
  tool_inputs: Record<string, any>
  input_steps: Record<string, WorkflowInputStep>
}

export interface GalaxyWorkflowsItem {

  model_class: string
  id: string
  name: string
  create_time: Date
  update_time: Date
  published: boolean
  importable: boolean
  deleted: boolean
  hidden: boolean
  tags: TagCollection
  latest_workflow_uuid: string
  annotation: string | null
  url: string
  owner: string
  source_metadata: string | null
  number_of_steps: number
  show_in_tool_panel: boolean

}

export interface GalaxyWorkflow {
  model_class: string
  id: string
  name: string
  create_time: Date
  update_time: Date
  published: boolean
  importable: boolean
  deleted: boolean
  hidden: boolean
  tags: TagCollection
  latest_workflow_uuid: string
  url: string
  owner: string
  inputs: { [key: string]: WorkflowInput }
  annotation: string | null
  license: string | null
  creator: string | null
  source_metadata: string | null
  steps: { [key: string]: WorkflowStep }
  version: number
}

export interface WorkflowStepRun {
  annotation?: string
  step_index: number
  step_label: string
  step_name: string
  step_version: string
  step_type: WorkflowStepType
}

export interface WorkflowStepDataExport extends WorkflowStepRun {
  step_type: Extract<WorkflowStepType, 'data_input'>
}
// parameter_input
export interface WorkflowStepParameterExport extends WorkflowStepRun {
  step_type: Extract<WorkflowStepType, 'parameter_input'>
}
export interface WorkflowStepDataCollectionExport extends WorkflowStepRun {
  step_type: Extract<WorkflowStepType, 'data_collection_input'>
}

export interface WorkflowStepToolExport extends WorkflowStepRun {
  id: string
  step_type: Extract<WorkflowStepType, 'tool'>
  action: string
  citation: boolean
  creator: null | string
  display: boolean
  description: string
  edam_operations: string[]
  edam_topics: string[]
  enctype: string
  help: string
  history_id: string
  is_workflow_compatible: boolean
  license: string | null
  model_class: string
  label: null | string
  name: string
  requirements: { name: string, version: string | null }[]
  sharable_url: string
  tool_shed_repository: {
    changeset_revision: string
    name: string
    owner: string
    tool_shed: string
  }
  version: string
  versions: string[]
  inputs: GalaxyToolParameters[]
  state_inputs: Record<
    string,
    Record<
      string,
      GalaxyToolParameterValue
    >
  >

}

export interface WorkflowStepExport {

}
export const WorkflowStepExportSchema = z.object({
  annotation: z.optional(z.string()),
  step_index: z.number(),
  step_label: z.string(),
  step_name: z.string(),
  step_version: z.string(),
  step_type: z.enum(workflowStepTypes),
})
export interface RawGalaxyWorkflowExport {
  'a_galaxy_workflow': string
  'format-version': string
  'name': string
  'tags': TagCollection
  'annotation': string
  // 'steps': { [key: string]: WorkflowStepExport }
  'version': number
}

export interface GalaxyWorkflowExport extends Omit<RawGalaxyWorkflowExport, 'a_galaxy_workflow'> {
  a_galaxy_workflow: boolean
}

export const GalaxyWorkflowExportSchema = z.object({
  'a_galaxy_workflow': z.coerce.boolean(),
  'format-version': z.string(),
  'name': z.string(),
  'tags': z.array(z.string()),
  'annotation': z.string(),
  'version': z.number(),
  // 'steps': z.record(z.string(), WorkflowStepExportSchema),
})
