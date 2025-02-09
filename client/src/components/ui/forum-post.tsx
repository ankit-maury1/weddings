import { ForumPost, ForumReply } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Pin, Trash2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertForumReplySchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ForumPostProps {
  post: ForumPost;
}

export default function ForumPostComponent({ post }: ForumPostProps) {
  const [showReplies, setShowReplies] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/businesses"],
  });

  const { data: replies } = useQuery<ForumReply[]>({
    queryKey: ["/api/forum", post.id, "replies"],
    enabled: showReplies,
  });

  const form = useForm({
    resolver: zodResolver(insertForumReplySchema),
    defaultValues: {
      content: "",
      postId: post.id,
      userId: currentUser?.id || 0,
      createdAt: new Date().toISOString()
    },
  });

  const deletePost = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/forum/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createReply = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiRequest(
        "POST",
        `/api/forum/${post.id}/replies`,
        {
          ...formData,
          createdAt: new Date().toISOString()
        }
      );
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["/api/forum", post.id, "replies"],
      });
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const author = users?.find((user) => user.id === post.userId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {post.title}
            {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              by {author?.username || "Unknown"}
            </span>
            {currentUser?.id === post.userId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this post? This action cannot be undone."
                    )
                  ) {
                    deletePost.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        <div className="mt-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setShowReplies(!showReplies)}
          >
            <MessageCircle className="h-4 w-4" />
            {showReplies ? "Hide Replies" : "Show Replies"}
          </Button>
        </div>

        {showReplies && (
          <div className="mt-4 space-y-4">
            {replies?.map((reply) => {
              const replyAuthor = users?.find(
                (user) => user.id === reply.userId
              );
              return (
                <Card key={reply.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {replyAuthor?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </CardContent>
                </Card>
              );
            })}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createReply.mutate(data))}
                className="space-y-4"
              >
                <Textarea
                  placeholder="Write your reply..."
                  {...form.register("content")}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createReply.isPending}
                >
                  Post Reply
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}