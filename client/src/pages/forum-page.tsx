import { useQuery, useMutation } from "@tanstack/react-query";
import { ForumPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertForumPostSchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ForumPostComponent from "@/components/ui/forum-post";
import { Loader2 } from "lucide-react";

export default function ForumPage() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertForumPostSchema),
    defaultValues: {
      title: "",
      content: "",
      userId: 0,
      isPinned: false
    }
  });

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum"],
  });

  const createPost = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/forum", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum"] });
      form.reset();
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
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

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-playfair">Community Forum</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => createPost.mutate(data))}
          className="space-y-4"
        >
          <Input placeholder="Post title" {...form.register("title")} />
          <Textarea
            placeholder="Write your post content here..."
            {...form.register("content")}
          />
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Post
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        {posts?.map((post) => (
          <ForumPostComponent key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
