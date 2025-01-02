import type { GalaxyClient } from './GalaxyClient'
import type { GalaxyTool } from './types'

export class Tools {
  private static instance: Tools
  #client: GalaxyClient

  private constructor(client: GalaxyClient) {
    this.#client = client
  }

  static getInstance(client: GalaxyClient): Tools {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Tools(client)
    return this.instance
  }

  public async getTool(toolId: string, version: string): Promise<GalaxyTool> {
    return this.#client.api(
      `api/tools/${toolId}?io_details=true&version=${version}`,
      {
        method: 'GET',
      },
    )
  }
}
