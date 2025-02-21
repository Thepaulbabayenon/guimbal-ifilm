export const useMarkAsWatched = () => {
    const markAsWatched = async (userId: string, filmId: number) => {
      try {
        await fetch('/api/watched-films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, filmId }),
        });
      } catch (error) {
        console.error('Failed to mark film as watched:', error);
      }
    };
  
    return { markAsWatched };
  };
  