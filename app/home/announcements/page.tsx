"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader, AlertCircle, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5; // Number of announcements per page

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`/api/announcements?page=${page}&limit=${pageSize}`);
      if (response.data && Array.isArray(response.data.announcements)) {
        setAnnouncements(response.data.announcements);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.warn("Unexpected API response:", response.data);
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page]); // Refetch when `page` changes

  return (
    <div className="max-w-4xl mx-auto px-6 mt-20">
      <motion.h1
        className="text-2xl font-bold text-white mb-6 text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Announcements
      </motion.h1>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center text-gray-400"
        >
          <Loader className="animate-spin h-6 w-6 mr-2" />
          <span>Loading...</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-red-400 flex items-center justify-between bg-gray-800 p-4 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button
            onClick={fetchAnnouncements}
            className="flex items-center text-white px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <RefreshCcw className="h-5 w-5 mr-1" />
            Reload
          </button>
        </motion.div>
      )}

      {!loading && !error && announcements.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-400 text-left"
        >
          No announcements available.
        </motion.p>
      )}

      <div className="space-y-4">
        {announcements.map((announcement, idx) => (
          <motion.div
            key={announcement.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white text-left">{announcement.title}</h2>
            <p className="text-gray-300 mt-2 text-left">{announcement.content}</p>
            <p className="text-gray-500 text-xs mt-2 text-left">
              {new Date(announcement.createdAt).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`flex items-center text-white px-4 py-2 rounded-lg ${
            page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>

        <span className="text-white">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className={`flex items-center text-white px-4 py-2 rounded-lg ${
            page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
