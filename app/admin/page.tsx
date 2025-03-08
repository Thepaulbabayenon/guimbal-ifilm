'use client';
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Film, Users, Star, Activity, TrendingUp, Loader2 } from 'lucide-react';


type Film = {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
  averageRating: number;
  viewCount?: number; 
  releaseYear: number;
  createdAt: Date;
};

type User = {
  id: string;
  name: string;
  role: string;
  createdAt: Date;
};

type Rating = {
  userId: string;
  filmId: number;
  rating: number;
  createdAt: Date;
};

type WatchedFilm = {
  userId: string;
  filmId: number;
  watchedAt: Date;
};

type Comment = {
  id: number;
  userId: string;
  filmId: number;
  content: string;
  createdAt: Date;
};

type RecentActivity = {
  action: string;
  user: string;
  time: string;
  item?: string;
};

type CategoryData = {
  name: string;
  value: number;
};

type MonthlyUpload = {
  month: string;
  films: number;
};

type RatingDistribution = {
  rating: string;
  count: number;
};

type TopFilm = {
  title: string;
  rating: number;
  views: number;
  type: 'most_viewed' | 'highest_rated' | 'trending';
  growth?: number;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // State for all the data we need to fetch
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    admins: 0,
    regularUsers: 0,
  });
  const [filmStats, setFilmStats] = useState({
    total: 0,
    uploadedThisMonth: 0,
    averageRating: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyUploads, setMonthlyUploads] = useState<MonthlyUpload[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [topFilms, setTopFilms] = useState<TopFilm[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Fetch data based on the selected time range
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user statistics
        const usersResponse = await fetch(`/api/dashboard/users?timeRange=${timeRange}`);
        const usersData = await usersResponse.json();
        setUserStats(usersData);

        // Fetch film statistics
        const filmsResponse = await fetch(`/api/dashboard/films?timeRange=${timeRange}`);
        const filmsData = await filmsResponse.json();
        setFilmStats(filmsData);

        // Fetch category distribution
        const categoriesResponse = await fetch(`/api/dashboard/categories?timeRange=${timeRange}`);
        const categoriesData = await categoriesResponse.json();
        setCategoryData(categoriesData);

        // Fetch monthly uploads
        const monthlyResponse = await fetch(`/api/dashboard/monthly-uploads?timeRange=${timeRange}`);
        const monthlyData = await monthlyResponse.json();
        setMonthlyUploads(monthlyData);

        // Fetch rating distribution
        const ratingsResponse = await fetch(`/api/dashboard/rating-distribution?timeRange=${timeRange}`);
        const ratingsData = await ratingsResponse.json();
        setRatingDistribution(ratingsData);

        // Fetch top performing films
        const topFilmsResponse = await fetch(`/api/dashboard/top-films?timeRange=${timeRange}`);
        const topFilmsData = await topFilmsResponse.json();
        setTopFilms(topFilmsData);

        // Fetch recent activity
        const activityResponse = await fetch(`/api/dashboard/recent-activity?limit=4`);
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-700" />
          <p className="text-slate-700 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6 space-y-8">
      {/* Header with improved spacing and shadow */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">Analytics Dashboard</h1>
        <div className="flex space-x-1">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Summary Cards with improved styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Films</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{filmStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                <Film className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{userStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Average Rating</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                        {filmStats.averageRating.toFixed(1)}
                  </p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">New Uploads</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{filmStats.uploadedThisMonth}</p>
              </div>
              <div className="h-12 w-12 bg-violet-50 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row with improved styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-lg font-semibold">Film Uploads by Month</CardTitle>
            <CardDescription className="text-slate-500">Number of films uploaded each month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyUploads.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyUploads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                    <YAxis tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="films" fill="#4f46e5" name="Films Uploaded" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500">No upload data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-lg font-semibold">Film Categories</CardTitle>
            <CardDescription className="text-slate-500">Distribution of films by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500">No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Third Row with improved styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-lg font-semibold">Rating Distribution</CardTitle>
            <CardDescription className="text-slate-500">Breakdown of film ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {ratingDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ratingDistribution}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                    <YAxis type="category" dataKey="rating" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
                    <Tooltip contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }} />
                    <Legend />
                    <Bar dataKey="count" fill="#f59e0b" name="Number of Ratings" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500">No rating data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-lg font-semibold">Top Performing Films</CardTitle>
            <CardDescription className="text-slate-500">Films with highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFilms.length > 0 ? (
                topFilms.map((film, index) => (
                  <div key={index} className="bg-slate-100 p-4 rounded-lg hover:bg-slate-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-800">{film.title}</h3>
                      {film.type === 'trending' ? (
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+{film.growth}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4 mr-1" />
                          <span>{film.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span className="font-medium">
                        {film.type === 'most_viewed' && 'Most viewed'}
                        {film.type === 'highest_rated' && 'Highest rated'}
                        {film.type === 'trending' && 'Fastest growing'}
                      </span>
                      <span>{film.views.toLocaleString()} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500">No film performance data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section with improved styling */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-800 text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-slate-500">Latest actions in the system</CardDescription>
            </div>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {activity.action.includes("uploaded") ? (
                        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center">
                          <Film className="h-5 w-5 text-indigo-600" />
                        </div>
                      ) : activity.action.includes("registered") ? (
                        <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                      ) : activity.action.includes("updated") ? (
                        <div className="h-10 w-10 bg-violet-50 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-violet-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5 text-amber-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{activity.action} {activity.item && <span className="font-normal">- {activity.item}</span>}</p>
                      <p className="text-sm text-slate-500">by {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 whitespace-nowrap ml-4">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;