import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: user?.username,
      password: "",
      role: user?.role,
      businessName: user?.businessName || "",
      description: user?.description || "",
      address: user?.address || "",
      phone: user?.phone || "",
      email: user?.email || "",
      website: user?.website || ""
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/profile");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-playfair">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
              className="space-y-4"
            >
              <Input
                placeholder="Username"
                {...form.register("username")}
                disabled={!isEditing}
              />
              {isEditing && (
                <Input
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  {...form.register("password")}
                />
              )}
              {user.role !== "client" && (
                <>
                  <Input
                    placeholder="Business Name"
                    {...form.register("businessName")}
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="Description"
                    {...form.register("description")}
                    disabled={!isEditing}
                  />
                </>
              )}
              <Input
                placeholder="Address"
                {...form.register("address")}
                disabled={!isEditing}
              />
              <Input
                placeholder="Phone"
                {...form.register("phone")}
                disabled={!isEditing}
              />
              <Input
                placeholder="Email"
                {...form.register("email")}
                disabled={!isEditing}
              />
              {user.role !== "client" && (
                <Input
                  placeholder="Website"
                  {...form.register("website")}
                  disabled={!isEditing}
                />
              )}

              <div className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                          deleteAccount.mutate();
                        }
                      }}
                    >
                      Delete Account
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
