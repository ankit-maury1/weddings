import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, InsertUser, ForumPost, BusinessInquiry } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forumPosts: Map<number, ForumPost>;
  private businessInquiries: Map<number, BusinessInquiry>;
  sessionStore: session.Store;
  currentId: { users: number; posts: number; inquiries: number };

  constructor() {
    this.users = new Map();
    this.forumPosts = new Map();
    this.businessInquiries = new Map();
    this.currentId = { users: 1, posts: 1, inquiries: 1 };
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

  async getBusinesses(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role !== "client"
    );
  }

  async getForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values());
  }

  async createForumPost(post: Omit<ForumPost, "id">): Promise<ForumPost> {
    const id = this.currentId.posts++;
    const newPost: ForumPost = { ...post, id };
    this.forumPosts.set(id, newPost);
    return newPost;
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
}

export const storage = new MemStorage();
