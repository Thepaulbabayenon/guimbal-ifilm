import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Base path configuration
  basePath: "",
  
  // Improved image configuration for mobile
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/original/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "ifilm-bucket.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },
      // Generic patterns for other hostnames
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920], // Better mobile breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller image sizes for mobile
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for a week
  },
  
  // More aggressive Webpack optimization for mobile
  webpack: (config, { isServer, dev }) => {
    // Avoid canvas issues
    config.resolve.alias.canvas = false;
    
    // Optimize chunk loading - more granular for mobile
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25, // Allow more initial chunks for better code splitting
        maxAsyncRequests: 25, // Allow more async chunks
        minSize: 20000, // Smaller chunks (20KB)
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk (React, etc)
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // UI Libraries
          ui: {
            name: 'ui-components',
            test: /[\\/]node_modules[\\/](@\/components|shadcn)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // Vendor chunk for node_modules
          vendor: {
            name: (module) => {
              // Get the name of the package and safely handle undefined cases
              const packageName = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
              // Return a safe fallback if packageName is undefined
              return packageName ? `npm.${packageName.replace('@', '')}` : 'npm.vendor';
            },
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    // Enable tree shaking even in development
    if (!isServer && !dev) {
      config.optimization.usedExports = true;
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  },

    
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Next.js specific configurations
  experimental: {
    // Server actions settings
    serverActions: {
      allowedOrigins: ['localhost:3000', 'https://www.Thebantayanfilmfestival.com'],
    },
    // Modern settings for code splitting
    optimizeCss: true,
    scrollRestoration: true,
    // Enable prefetching but with smarter strategy
    optimisticClientCache: true,
    // Performance budget
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'], // Track performance metrics
  },
  
  // Output configuration
  output: 'standalone',
  
  // Compiler options - more aggressive console removal
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // Additional mobile optimizations
  poweredByHeader: false,
  compress: true, // Better compression for mobile networks
};

// Export the configuration with the bundle analyzer wrapper
export default withBundleAnalyzer(nextConfig);