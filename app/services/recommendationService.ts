const recommendationsCache = new Map<string, { data: any; timestamp: number }>();

export async function getRecommendations(userId: string | number): Promise<any> {
  const url = `/api/recommendations?userId=${userId}`;
  
  // Check cache first (with a time-based expiration)
  const cached = recommendationsCache.get(url);
  if (cached && (Date.now() - cached.timestamp < 60000)) { // 1-minute cache
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Cache the result
  recommendationsCache.set(url, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
}
