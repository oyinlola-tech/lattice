/**
 * User validation schemas.
 *
 * Uses Zod for schema definition and @oyinlola141/lattice-validation for parsing.
 */

import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

export type CreateUserSchemaInput = z.infer<typeof CreateUserSchema>;
