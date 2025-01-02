import type { GalaxyClient } from './GalaxyClient'
import type { ShowFullJobResponse } from './types'

export class Jobs {
  private static instance: Jobs
  #client: GalaxyClient

  private constructor(client: GalaxyClient) {
    this.#client = client
  }

  static getInstance(client: GalaxyClient): Jobs {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Jobs(client)
    return this.instance
  }

  public async getJob(jobId: string): Promise<ShowFullJobResponse> {
    return this.#client.api(
      `api/jobs/${jobId}?full=true`,
      {
        method: 'GET',
      },
    )
  }
}
