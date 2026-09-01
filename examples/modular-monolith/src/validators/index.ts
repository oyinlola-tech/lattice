import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(500).optional().default(""),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const CreateArticleSchema = z.object({
  authorId: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  content: z.string().min(50, "Content must be at least 50 characters"),
});

export const UpdateArticleSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(50).optional(),
});

export const CreateCommentSchema = z.object({
  articleId: z.string().min(1),
  authorId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const AddReactionSchema = z.object({
  articleId: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["like", "love", "insightful", "disagree"]),
});

export const CreateTopicSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().default(""),
});

export const FollowTopicSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().min(1),
});

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});
