import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertForumPostSchema, insertBusinessInquirySchema, insertForumReplySchema, insertChatSchema } from "@shared/schema";

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

    const validation = insertForumPostSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString()
    });
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const post = await storage.createForumPost({
      ...validation.data,
      userId: req.user!.id
    });
    res.status(201).json(post);
  });

  app.post("/api/forum/:postId/replies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validation = insertForumReplySchema.safeParse({
      ...req.body,
      postId: parseInt(req.params.postId),
      createdAt: new Date().toISOString()
    });
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const reply = await storage.createForumReply({
      ...validation.data,
      userId: req.user!.id
    });
    res.status(201).json(reply);
  });

  app.delete("/api/forum/:postId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const post = await storage.getForumPost(parseInt(req.params.postId));
    if (!post) return res.sendStatus(404);
    if (post.userId !== req.user!.id) return res.sendStatus(403);

    await storage.deleteForumPost(post.id);
    res.sendStatus(204);
  });

  app.post("/api/inquiries", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validation = insertBusinessInquirySchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString()
    });
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

  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = await storage.updateUser(req.user!.id, req.body);
    res.json(user);
  });

  app.delete("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    await storage.deleteUser(req.user!.id);
    req.logout((err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.sendStatus(204);
    });
  });

  // Portfolio endpoints
  app.post('/api/portfolio', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const portfolio = await storage.createPortfolio({
      ...req.body,
      userId: req.user!.id,
      createdAt: new Date()
    });
    res.status(201).json(portfolio);
  });

  app.get('/api/portfolio/:userId', async (req, res) => {
    const portfolios = await storage.getPortfoliosByUserId(parseInt(req.params.userId));
    res.json(portfolios);
  });

  const httpServer = createServer(app);
  return httpServer;
}
