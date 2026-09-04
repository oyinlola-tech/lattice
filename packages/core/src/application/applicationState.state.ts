/**
 * Represents the lifecycle state of a Zudojs application.
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
