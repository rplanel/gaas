import type { GalaxyClient } from './GalaxyClient'
import type { GalaxyDataset } from './types'

export class Datasets {
  private static instance: Datasets
  #client: GalaxyClient

  private constructor(client: GalaxyClient) {
    this.#client = client
  }

  static getInstance(client: GalaxyClient): Datasets {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Datasets(client)
    return this.instance
  }

  public async getDataset(datasetId: string, historyId: string): Promise<GalaxyDataset> {
    return this.#client.api(
      `api/histories/${historyId}/contents/${datasetId}`,
      {
        method: 'GET',
      },
    )
  }
}
