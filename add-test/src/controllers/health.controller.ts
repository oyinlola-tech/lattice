export class HealthController {
  check() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
