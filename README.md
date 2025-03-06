🎬 Guimbal iFilm Society Streaming Platform
A Cloud-Based Streaming Platform with a Custom Hybrid Recommendation Algorithm with the integration of
Artificial Intelligence. 

📌 Project Overview
The Guimbal iFilm Society has an extensive collection of over 250 films stored on external hard drives, limiting accessibility and engagement. This project aims to develop a cloud-based streaming platform to enhance user experience with:
✅ Custom Hybrid Recommendation Algorithm (collaborative & content-based filtering)
✅ Cloud Storage for Scalability & Accessibility
✅ User-Friendly Streaming Interface

🚀 Features
🔹 Custom Hybrid Recommendation Algorithm – Personalized content suggestions using user behavior & film metadata
🔹 Cloud-Based Infrastructure – Hosted on AWS (Amazon Web Services) for scalability
🔹 Secure & Reliable Storage – Uses NeonDB for metadata & AWS S3 for film storage
🔹 Advanced Streaming Technologies – High-quality video playback with minimal buffering
🔹 Interactive User Experience – User reviews, community voting, and profile management

🏗 Tech Stack
🔹 Frontend
TypeScript – Type-safe client-side logic
React & Next.js – Efficient UI rendering
Tailwind CSS – Modern styling for responsive design
🔹 Backend
Node.js & Next.js API Routes – Handles server-side processing
NeonDB – Flexible database for metadata storage
Redis – Session management for user authentication
🔹 Cloud & Security
AWS S3 – Secure film storage
AWS CloudFront – Content delivery for fast streaming
Drizzle ORM – Database management with PostgreSQL
JWT Authentication – Secure login & session handling
⚙️ Installation & Setup
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/thepaulbabayenon/guimbal-ifilm.git
cd guimbal-ifilm-platform
2️⃣ Install Dependencies
sh
Copy
Edit
npm install
3️⃣ Set Up Environment Variables
Create a .env.local file and add your credentials:

sh
Copy
Edit
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_NEONDB_URL=your-neondb-url
NEXT_PUBLIC_REDIS_URL=your-redis-url
NEXT_PUBLIC_JWT_SECRET=your-secret-key
4️⃣ Start the Development Server
sh
Copy
Edit
npm run dev
The platform will be accessible at http://localhost:3000/

🛠 API Routes & Endpoints
Authentication
POST /api/auth/signin – User login
POST /api/auth/signout – Logout & session removal
User Management
GET /api/users/me – Fetch logged-in user details
POST /api/users/register – Register a new user
Film Streaming & Recommendation
GET /api/films – Get all available films
GET /api/recommendations – Fetch personalized recommendations
POST /api/film/[filmId]/user-ratings – Submit a film rating
Watchlist
GET /api/watchlist – View user watchlist
POST /api/watchlist/ – Add a film to watchlist
DELETE /api/watchlist/[watchListId]/ – Remove a film
📌 Project Objectives
🎯 General Objective:
Develop a cloud-based streaming platform with custom recommendation features to improve accessibility & engagement for the Guimbal iFilm Society.

🎯 Specific Objectives:
✔️ Implement a custom hybrid recommendation algorithm
✔️ Deploy the platform with secure, scalable cloud storage
✔️ Design an interactive user interface for seamless browsing & streaming

📜 License
This project is licensed under the MIT License – Free to use and modify!

📧 Contact: If you have any questions, reach out at pbabayen-on@usa.edu.ph

🚀 Enjoy seamless streaming with the Guimbal iFilm Society Platform! 🎥🍿