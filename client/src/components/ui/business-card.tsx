import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Video, Pencil, Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const roleIcons = {
  photographer: Camera,
  videographer: Video,
  editor: Pencil,
};

interface BusinessCardProps {
  business: User;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const [open, setOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm({
    defaultValues: {
      message: "",
      toUserId: business.id,
    },
  });

  const ratingForm = useForm({
    defaultValues: {
      rating: 5,
      businessId: business.id,
    },
  });

  const sendInquiry = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiRequest("POST", "/api/inquiries", formData);
      return res.json();
    },
    onSuccess: () => {
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      toast({
        title: "Inquiry sent",
        description: "Your message has been sent successfully.",
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

  const submitRating = useMutation({
    mutationFn: async (data: { rating: number; businessId: number }) => {
      const res = await apiRequest("POST", "/api/ratings", data);
      return res.json();
    },
    onSuccess: () => {
      setRatingOpen(false);
      ratingForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
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

  const Icon = roleIcons[business.role as keyof typeof roleIcons];

  const handleWhatsAppQuery = () => {
    if (!business.phone) {
      toast({
        title: "Error",
        description: "This business has not provided a contact number.",
        variant: "destructive",
      });
      return;
    }

    const phone = business.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi, I'm interested in your services on WeddingConnect.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {business.businessName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-1"
              onClick={() => setRatingOpen(true)}
            >
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{business.rating || 0}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{business.description}</p>
        {business.phone && (
          <p className="text-sm mb-2">Contact: {business.phone}</p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleWhatsAppQuery} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Send Inquiry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send message to {business.businessName}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) =>
                  sendInquiry.mutate(data)
                )}
                className="space-y-4"
              >
                <Textarea
                  placeholder="Write your message here..."
                  {...form.register("message")}
                />
                <Button type="submit" disabled={sendInquiry.isPending}>
                  Send Message
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {business.businessName}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={ratingForm.handleSubmit((data) =>
                submitRating.mutate(data)
              )}
              className="space-y-4"
            >
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="ghost"
                    onClick={() => ratingForm.setValue("rating", value)}
                    className={`p-2 ${
                      ratingForm.watch("rating") >= value
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </Button>
                ))}
              </div>
              <Button type="submit" disabled={submitRating.isPending}>
                Submit Rating
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}