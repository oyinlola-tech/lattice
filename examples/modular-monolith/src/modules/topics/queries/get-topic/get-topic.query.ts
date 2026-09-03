import { Query } from "@zudoliblib/cqrs";
import type { TopicId } from "../../../../types/index.js";

export class GetTopicQuery extends Query<"topics.get"> {
  public readonly topicId: TopicId;

  public constructor(topicId: TopicId) {
    super("topics.get");
    this.topicId = topicId;
  }
}
