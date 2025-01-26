'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs'; // Import useUser from Clerk
import { db } from '@/db/drizzle';
import { comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

interface CommentsProps {
  filmId: number; // Required filmId for comments
}

interface Comment {
  id: number;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function Comments({ filmId }: CommentsProps) {
  const { user } = useUser(); // Get the current user from Clerk
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    if (!filmId) {
      setError('Missing film ID.');
      return;
    }

    if (!user) {
      setError('You must be logged in to post a comment.');
      return;
    }

    setError(null); // Reset error state
    setLoading(true);

    const commentData = {
      userId: user.id,
      filmId,
      username: user.username || 'Anonymous', // Use Clerk's username or fallback to "Anonymous"
      content: newComment.trim(),
      email: user.emailAddresses[0]?.emailAddress || '', // Correctly accessing emailAddresses
    };

    // Optimistically update UI
    const optimisticComment: Comment = {
      id: Date.now(), // Temporary ID for UI rendering
      userId: user.id,
      username: commentData.username,
      content: commentData.content,
      createdAt: new Date().toISOString(),
    };

    setCommentsList((prev) => [optimisticComment, ...prev]);
    setNewComment('');

    try {
      // Insert comment into the database
      const result = await db.insert(comments).values(commentData);
      console.log('Comment successfully inserted:', result);

      // Refetch comments to ensure data consistency
      await fetchComments();
    } catch (error) {
      console.error('Error inserting comment:', error);
      setError('Failed to add comment. Please try again.');

      // Rollback optimistic update
      setCommentsList((prev) => prev.filter((comment) => comment.id !== optimisticComment.id));
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments from the database
  const fetchComments = async () => {
    if (!filmId) {
      setError('Film ID is required to load comments.');
      return;
    }

    setLoading(true);

    try {
      const fetchedComments = await db
        .select({
          id: comments.id,
          userId: comments.userId,
          username: comments.username,
          content: comments.content,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .where(eq(comments.filmId, filmId))
        .orderBy(desc(comments.createdAt));

      // Format dates for display
      const formattedComments = fetchedComments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        username: comment.username || 'Anonymous',
      }));

      setCommentsList(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filmId]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Input for adding a comment */}
      {user ? (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Add a comment..."
            disabled={loading}
          />
          <button
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
            onClick={handleAddComment}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Add Comment'}
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">You must be logged in to add a comment.</p>
      )}

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
