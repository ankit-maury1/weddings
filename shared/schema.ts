import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const UserRole = z.enum(['client', 'photographer', 'videographer', 'editor', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  businessName: text("business_name"),
  description: text("description"),
  rating: integer("rating"),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
});

export const businessInquiries = pgTable("business_inquiries", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  businessName: true,
  description: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts);
export const insertBusinessInquirySchema = createInsertSchema(businessInquiries);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type BusinessInquiry = typeof businessInquiries.$inferSelect;
