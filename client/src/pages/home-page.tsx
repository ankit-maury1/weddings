import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BusinessInquiry } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { data: inquiries, isLoading } = useQuery<BusinessInquiry[]>({
    queryKey: ["/api/inquiries"],
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
      <h1 className="text-4xl font-playfair">Welcome, {user?.username}</h1>

      {user?.role !== "client" ? (
        <Card>
          <CardHeader>
            <CardTitle>Business Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Business Details</h3>
                <p>Business Name: {user.businessName}</p>
                <p>Role: {user.role}</p>
                <p>Rating: {user.rating}/5</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recent Inquiries</h3>
                {inquiries?.length ? (
                  <div className="space-y-2">
                    {inquiries.map((inquiry) => (
                      <Card key={inquiry.id}>
                        <CardContent className="p-4">
                          <p className="text-sm">{inquiry.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Status: {inquiry.status}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No inquiries yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Find Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse our directory of wedding photographers, videographers, and editors.
              </p>
              <a href="/businesses" className="text-primary hover:underline block mt-4">
                View Directory →
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Community Forum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with other couples and professionals in our community forum.
              </p>
              <a href="/forum" className="text-primary hover:underline block mt-4">
                Visit Forum →
              </a>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
