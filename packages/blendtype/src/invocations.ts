import type { GalaxyClient } from './GalaxyClient'

import type { GalaxyInvocation } from './types'

export class Invocations {
  #client: GalaxyClient
  private static instance: Invocations

  private constructor(client: GalaxyClient) {
    this.#client = client
  }

  static getInstance(client: GalaxyClient): Invocations {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Invocations(client)
    return this.instance
  }

  public async getInvocation(invocationId: string): Promise<GalaxyInvocation> {
    return this.#client.api(
      `api/invocations/${invocationId}`,
      {
        method: 'GET',
      },
    )
  }
}
