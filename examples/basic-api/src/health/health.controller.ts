/**
 * Health HTTP handler.
 *
 * Returns application health status.
 */

export class HealthController {
  public async handleRequest(_request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
    id: string;
  }): Promise<{ status: number; body: unknown }> {
    return {
      status: 200,
      body: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
