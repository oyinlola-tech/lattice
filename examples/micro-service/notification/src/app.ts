import { CommandBus } from "@zudoliblib/cqrs";
import { QueryBus } from "@zudoliblib/cqrs";
import { createEventBus } from "@zudoliblib/events";
import type { Queue } from "@zudoliblib/queue";
import type { INotificationRepository } from "./interfaces/index.js";
import { registerNotificationService } from "./services/index.js";
import { registerNotificationRoutes } from "./routes/index.js";
import { loadEvents, loadQueue } from "./loaders/index.js";
import type { ProcessNotificationJobData } from "./jobs/index.js";

export interface NotificationApp {
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly queue: Queue<ProcessNotificationJobData>;
  readonly shutdown: () => Promise<void>;
}

export function createApp(
  repository: INotificationRepository,
): NotificationApp {
  const eventBus = createEventBus();
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();

  registerNotificationService({ repository, commandBus, queryBus });

  const { queue } = loadQueue({ commandBus });

  loadEvents({ eventBus, queue });

  return {
    commandBus,
    queryBus,
    queue,
    shutdown: async () => {
      eventBus.dispose();
      await queue.close();
    },
  };
}
