import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertForumPostSchema, insertBusinessInquirySchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/businesses", async (req, res) => {
    const businesses = await storage.getBusinesses();
    res.json(businesses);
  });

  app.get("/api/forum", async (req, res) => {
    const posts = await storage.getForumPosts();
    res.json(posts);
  });

  app.post("/api/forum", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validation = insertForumPostSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const post = await storage.createForumPost({
      ...validation.data,
      userId: req.user!.id
    });
    res.status(201).json(post);
  });

  app.post("/api/inquiries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validation = insertBusinessInquirySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const inquiry = await storage.createInquiry({
      ...validation.data,
      fromUserId: req.user!.id
    });
    res.status(201).json(inquiry);
  });

  app.get("/api/inquiries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const inquiries = await storage.getInquiriesByUserId(req.user!.id);
    res.json(inquiries);
  });

  const httpServer = createServer(app);
  return httpServer;
}
