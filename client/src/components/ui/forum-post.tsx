import { ForumPost } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Pin } from "lucide-react";

interface ForumPostProps {
  post: ForumPost;
}

export default function ForumPostComponent({ post }: ForumPostProps) {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/businesses"],
  });

  const author = users?.find((user) => user.id === post.userId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {post.title}
            {post.isPinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            by {author?.username || "Unknown"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
    </Card>
  );
}
