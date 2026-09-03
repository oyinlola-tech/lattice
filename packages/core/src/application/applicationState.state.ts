/**
 * Represents the lifecycle state of a Zudo application.
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
