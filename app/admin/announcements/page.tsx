'use client';
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Announcement {
  id: number;
  adminId: string;
  title: string;
  content: string;
  createdAt: string;
}

const PAGE_SIZE = 10; // Limit announcements to 10 per page

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch(`/api/admin/announcements?page=${page}&limit=${PAGE_SIZE}`, {
          credentials: "include", // Ensures cookies are sent
        });
  
        if (!res.ok) throw new Error("Failed to fetch announcements");
  
        const { data, total } = await res.json();
  
        if (Array.isArray(data)) {
          setAnnouncements(data);
          setTotalPages(Math.ceil(total / PAGE_SIZE));
        } else {
          setAnnouncements([]);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    }
  
    fetchAnnouncements();
  }, [page]);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>

      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <Card key={announcement.id} className="mb-4 shadow-lg">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold">{announcement.title}</h2>
              <p className="text-gray-700 mt-2">{announcement.content}</p>
              <p className="text-sm text-gray-500 mt-4">
                Posted on {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-6">
        <button 
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
          disabled={page === 1} 
          className="px-4 py-2 bg-pink-800 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-lg font-semibold">
          Page {page} of {totalPages}
        </span>

        <button 
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} 
          disabled={page === totalPages} 
          className="px-4 py-2 bg-pink-800 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Link href="/admin/announcements/new">
        <button className="border-blue-400 hover:text-blue-500 mt-6">
          Make a New Announcement
        </button>
      </Link>
    </div>
  );
}

