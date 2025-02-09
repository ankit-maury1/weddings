import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, InsertUser, ForumPost, ForumReply, BusinessInquiry, Chat, Portfolio } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private businessInquiries: Map<number, BusinessInquiry>;
  private chats: Map<number, Chat>;
  private portfolios: Map<number, Portfolio>;
  sessionStore: session.Store;
  currentId: { users: number; posts: number; replies: number; inquiries: number; chats: number; portfolios: number };

  constructor() {
    this.users = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.businessInquiries = new Map();
    this.chats = new Map();
    this.portfolios = new Map();
    this.currentId = { users: 1, posts: 1, replies: 1, inquiries: 1, chats: 1, portfolios: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, rating: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getBusinesses(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role !== "client"
    );
  }

  async getForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values());
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }

  async createForumPost(post: Omit<ForumPost, "id">): Promise<ForumPost> {
    const id = this.currentId.posts++;
    const newPost: ForumPost = { ...post, id };
    this.forumPosts.set(id, newPost);
    return newPost;
  }

  async deleteForumPost(id: number): Promise<void> {
    this.forumPosts.delete(id);
    // Delete associated replies
    const replies = Array.from(this.forumReplies.values()).filter(
      (reply) => reply.postId === id
    );
    for (const reply of replies) {
      this.forumReplies.delete(reply.id);
    }
  }

  async createForumReply(reply: Omit<ForumReply, "id">): Promise<ForumReply> {
    const id = this.currentId.replies++;
    const newReply: ForumReply = { ...reply, id };
    this.forumReplies.set(id, newReply);
    return newReply;
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values()).filter(
      (reply) => reply.postId === postId
    );
  }

  async createInquiry(inquiry: Omit<BusinessInquiry, "id">): Promise<BusinessInquiry> {
    const id = this.currentId.inquiries++;
    const newInquiry: BusinessInquiry = { ...inquiry, id };
    this.businessInquiries.set(id, newInquiry);
    return newInquiry;
  }

  async getInquiriesByUserId(userId: number): Promise<BusinessInquiry[]> {
    return Array.from(this.businessInquiries.values()).filter(
      (inquiry) => inquiry.toUserId === userId || inquiry.fromUserId === userId
    );
  }

  async createChat(chat: Omit<Chat, "id">): Promise<Chat> {
    const id = this.currentId.chats++;
    const newChat: Chat = { ...chat, id };
    this.chats.set(id, newChat);
    return newChat;
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.toUserId === userId || chat.fromUserId === userId
    );
  }

  async markChatAsRead(chatId: number): Promise<void> {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.isRead = true;
      this.chats.set(chatId, chat);
    }
  }

  async createPortfolio(portfolio: Omit<Portfolio, "id">): Promise<Portfolio> {
    const id = this.currentId.portfolios++;
    const newPortfolio: Portfolio = { ...portfolio, id };
    this.portfolios.set(id, newPortfolio);
    return newPortfolio;
  }

  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(
      (portfolio) => portfolio.userId === userId
    );
  }
}

export const storage = new MemStorage();