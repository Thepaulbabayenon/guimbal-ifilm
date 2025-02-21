'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // ✅ Import Clerk's useUser
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewAnnouncement() {
  const router = useRouter();
  const { user } = useUser(); // ✅ Get the current authenticated user

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("You must be logged in to create an announcement.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user.id,
          title,
          content,
        }),
      });

      if (res.ok) {
        router.push("/admin/announcements");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create announcement.");
      }
    } catch (error) {
      setError("Error submitting announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Announcement</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Write your announcement..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading || !user}>
          {loading ? "Posting..." : "Post Announcement"}
        </Button>
      </form>
    </div>
  );
}
