/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'image.tmdb.org', 
        'utfs.io', 
        'lh3.googleusercontent.com', 
        'avatars.githubusercontent.com' 
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'image.tmdb.org',
          port: '',
          pathname: '/t/p/original/**', 
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/a/**', 
        },
        {
          protocol: 'https',
          hostname: 'avatars.githubusercontent.com',
          port: '',
          pathname: '/u/**',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
        },
      ],
    },
  };
  
  export default nextConfig;
  