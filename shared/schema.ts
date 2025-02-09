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
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website")
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  createdAt: text("created_at").notNull()
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull()
});

export const businessInquiries = pgTable("business_inquiries", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  createdAt: text("created_at").notNull()
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
  isRead: boolean("is_read").default(false)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  businessName: true,
  description: true,
  address: true,
  phone: true,
  email: true,
  website: true
}).extend({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number in international format (e.g. +1234567890)")
    .optional()
    .refine((val) => {
      // Phone is required for business accounts
      if (val === undefined) return true;
      return val.length >= 10;
    }, "Phone number is required for business accounts"),
});

export const insertForumPostSchema = createInsertSchema(forumPosts);
export const insertForumReplySchema = createInsertSchema(forumReplies);
export const insertBusinessInquirySchema = createInsertSchema(businessInquiries);
export const insertChatSchema = createInsertSchema(chats);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;
export type BusinessInquiry = typeof businessInquiries.$inferSelect;
export type Chat = typeof chats.$inferSelect;