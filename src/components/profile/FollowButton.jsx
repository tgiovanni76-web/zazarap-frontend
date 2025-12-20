import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";

export default function FollowButton({ targetType, targetId, className = "", labelFollow = "Segui", labelUnfollow = "Smetti di seguire" }) {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["follow", targetType, targetId],
    queryFn: async () => {
      if (!me || !targetId) return [];
      return base44.entities.Follow.filter({ targetType, targetId });
    },
    enabled: !!me && !!targetId,
    initialData: [],
  });

  const isFollowing = existing.length > 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Follow.create({
        followerId: me.email,
        targetType,
        targetId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", targetType, targetId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const rec = existing[0];
      return base44.entities.Follow.delete(rec.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", targetType, targetId] });
    },
  });

  if (!me || !targetId) return null;

  const Icon = targetType === "category" ? Star : Heart;

  return (
    <Button
      type="button"
      variant={isFollowing ? "secondary" : "outline"}
      onClick={() => (isFollowing ? deleteMutation.mutate() : createMutation.mutate())}
      className={`gap-2 ${className}`}
      disabled={createMutation.isPending || deleteMutation.isPending}
    >
      <Icon className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
      {isFollowing ? labelUnfollow : labelFollow}
    </Button>
  );
}