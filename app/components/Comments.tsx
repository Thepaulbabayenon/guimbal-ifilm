'use client';
import { useState, useEffect } from "react";
import { db } from "@/db/drizzle";
import { comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface CommentsProps {
  filmId?: number;
  userId?: string;
  username?: string; // Use string instead of varchar
}

export default function Comments({ filmId, userId, username }: CommentsProps) {
  const [commentsList, setCommentsList] = useState<
    { id: number; userId: string; username: string; content: string; createdAt: string }[]
  >([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (newComment.trim() && userId && filmId && username) {
      const commentData = {
        userId,
        filmId,
        username: username || "Anonymous", // Default to "Anonymous" if no username
        content: newComment.trim(),
      };
  
      try {
        console.log("Inserting comment:", commentData);
  
        // Insert the comment into the database
        const result = await db.insert(comments).values(commentData);
  
        console.log("Comment inserted successfully", result);
  
        // Optimistically update the comments list
        setCommentsList((prev) => [
          { 
            ...commentData, 
            id: Date.now(), // Temporary ID for optimistic update
            createdAt: new Date().toISOString(), // Current timestamp
          },
          ...prev,
        ]);
  
        setNewComment("");
      } catch (error) {
        console.error("Error inserting comment:", error);
      }
    } else {
      console.log("Missing required fields");
    }
  };
  
  
  

  const fetchComments = async () => {
    if (filmId) {
      // Fetch comments, ensuring `username` is included
      const fetchedComments = await db
        .select({
          id: comments.id,
          userId: comments.userId,
          username: comments.username, // Ensure username is fetched
          content: comments.content,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .where(eq(comments.filmId, filmId))
        .orderBy(desc(comments.createdAt)); // Fix: Using "desc" correctly here
  
      // Map dates to strings for display
      const formattedComments = fetchedComments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        username: comment.username || "Anonymous", // Provide default username if null
      }));
  
      setCommentsList(formattedComments);
    }
  };
  

  useEffect(() => {
    if (filmId) fetchComments();
  }, [filmId]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {/* Input for adding a comment */}
      <div className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Add a comment..."
        />
        <button
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
          onClick={handleAddComment}
        >
          Add Comment
        </button>
      </div>

      {/* Display the list of comments */}
      <div className="space-y-4">
        {commentsList.length > 0 ? (
          commentsList.map((comment) => (
            <div key={comment.id} className="border-b py-2">
              <p className="font-semibold">{comment.username}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              <p>{comment.content}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}
