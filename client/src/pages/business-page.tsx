import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import BusinessCard from "@/components/ui/business-card";
import { Loader2 } from "lucide-react";

export default function BusinessPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: businesses, isLoading } = useQuery<User[]>({
    queryKey: ["/api/businesses"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredBusinesses = businesses?.filter((business) => {
    const matchesSearch = business.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || business.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-playfair">Wedding Professionals</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="photographer">Photographers</SelectItem>
            <SelectItem value="videographer">Videographers</SelectItem>
            <SelectItem value="editor">Editors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBusinesses?.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
        {filteredBusinesses?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            No businesses found matching your criteria
          </p>
        )}
      </div>
    </div>
  );
}
