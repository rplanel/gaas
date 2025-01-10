import type { GalaxyClient } from './GalaxyClient'
import { type GalaxyInvoke, type GalaxyWorkflow, type GalaxyWorkflowExport, galaxyWorkflowExportSchema, type GalaxyWorkflowInput, type GalaxyWorkflowParameters, type GalaxyWorkflowsItem, type rawGalaxyWorkflowExport } from './types'

export class Workflows {
  #client: GalaxyClient
  private static instance: Workflows
  private constructor(client: GalaxyClient) {
    this.#client = client
  }

  static getInstance(client: GalaxyClient): Workflows {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Workflows(client)
    return this.instance
  }

  public async getWorkflow(workflowId: string): Promise<GalaxyWorkflow> {
    return this.#client.api<GalaxyWorkflow>(
      `api/workflows/${workflowId}`,
      {
        method: 'GET',
      },
    )
  }

  public async exportWorkflow(workflowId: string, style: 'export' | 'run' | 'editor' | 'instance' = 'export'): Promise<GalaxyWorkflowExport> {
    return this.#client.api<rawGalaxyWorkflowExport>(
      `api/workflows/${workflowId}/download?style=${style}`,
      {
        credentials: 'include',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        method: 'GET',
      },
    ).then((wf) => {
      return galaxyWorkflowExportSchema.passthrough().parse(wf) as GalaxyWorkflowExport
    })
  }

  public async getWorkflows(): Promise<GalaxyWorkflowsItem[]> {
    return this.#client.api<GalaxyWorkflowsItem[]>(
      'api/workflows',
      {
        method: 'GET',
      },
    )
  }

  public async invokeWorkflow(historyGalaxyId: string, workflowId: string, inputs: GalaxyWorkflowInput, parameters: GalaxyWorkflowParameters): Promise<GalaxyInvoke> {
    return this.#client.api<GalaxyInvoke>(
      `api/workflows/${workflowId}/invocations`,
      {
        method: 'POST',
        body: { history_id: historyGalaxyId, inputs, parameters },
      },
    )
  }
}
