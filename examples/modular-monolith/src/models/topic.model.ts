import type { TopicId } from "../types/index.js";

export interface TopicModel {
  readonly id: TopicId;
  readonly name: string;
  readonly description: string;
  readonly followerCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
