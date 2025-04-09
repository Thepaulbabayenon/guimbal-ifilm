import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, RefreshCcw, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Fetch Notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements");
      
      if (!res.ok) {
        throw new Error(`API returned status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Raw API Response:", data);
      
      if (!data.announcements) {
        console.error("API returned:", data);
        throw new Error("API response doesn't contain announcements array");
      }
      
      console.log("Found announcements:", data.announcements.length);
      setNotifications(data.announcements);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch Dismissed Announcements
  const fetchDismissedAnnouncements = async () => {
    try {
      const res = await fetch("/api/notifications/dismissed");
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch dismissed notifications");

      setDismissedAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching dismissed announcements:", err);
    }
  };

  // Handle Dismiss Notification
  const dismissNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/notifications/dismissed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dismiss notification");

      // Remove from state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <motion.div whileHover={{ scale: 1.2 }} className="relative">
          <Bell className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white" />
          {notifications.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
            >
              {notifications.length}
            </motion.span>
          )}
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-gray-800 text-white rounded-md shadow-md p-2">
        <div className="flex items-center justify-between">
          <Link href="/home/announcements">
            <DropdownMenuLabel className="text-xs font-semibold cursor-pointer hover:text-yellow-400 transition-all">
              Notifications
            </DropdownMenuLabel>
          </Link>
          
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              fetchNotifications();
            }}
            className="text-gray-300 hover:text-white transition-all p-1 rounded-full hover:bg-gray-700"
            title="Refresh notifications"
          >
            <RefreshCcw className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Error / Loading State */}
        {loading ? (
          <DropdownMenuItem className="text-xs text-gray-400">Loading...</DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem className="text-xs text-red-400">{error}</DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem className="text-xs text-gray-400">No new notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="w-full">
             <DropdownMenuItem 
                className="p-2 hover:bg-gray-700 text-xs flex justify-between items-center cursor-pointer"
                onClick={(e) => {
                    e.preventDefault();
                    setExpandedId(expandedId === notification.id ? null : notification.id);
                }}
                >
                <span className="font-semibold">{notification.title}</span>
                <Trash2
                    className="h-4 w-4 text-gray-400 cursor-pointer hover:text-red-500 transition-all"
                    onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id, e);
                    }}
                />
                </DropdownMenuItem>
              {expandedId === notification.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-700 text-gray-300 text-xs p-2 rounded-md mt-1"
                >
                  {notification.content}
                </motion.div>
              )}
            </div>
          ))
        )}

        <DropdownMenuSeparator />

        {/* Retrieve Dismissed Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchDismissedAnnouncements}
          className="text-xs text-gray-400 hover:text-white transition-all flex items-center justify-start w-full py-1"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retrieve Dismissed Notifications
        </motion.button>

        {/* Display Dismissed Notifications */}
        {dismissedAnnouncements.length > 0 && (
          <div className="mt-2 bg-gray-700 p-2 rounded-md">
            <p className="text-xs text-gray-300 mb-1">Dismissed Notifications:</p>
            {dismissedAnnouncements.map((id) => {
              const notification = notifications.find((n) => n.id === id);
              return notification ? (
                <div key={notification.id} className="text-xs text-gray-400 border-b border-gray-600 py-1">
                  {notification.title}
                </div>
              ) : null; 
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;