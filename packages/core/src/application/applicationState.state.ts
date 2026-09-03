/**
 * Represents the lifecycle state of a Zudolib application.
 */
export type ApplicationState =
  | "created"
  | "initializing"
  | "initialized"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";
