import React from "react";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center space-y-6">
        {/* Netflix Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-red-600 border-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="block w-8 h-8 bg-red-600 rounded-full"></span>
          </div>
        </div>
        {/* Loading Text */}
        <p className="text-red-600 text-xl font-semibold tracking-wider">
          Loading Trailer<span className="dot-animate"></span>
        </p>
      </div>

      {/* Dot Animation Styles */}
      <style jsx>{`
        .dot-animate::after {
          content: ".";
          animation: dots 1.5s steps(3, end) infinite;
        }
        @keyframes dots {
          0% {
            content: ".";
          }
          33% {
            content: "..";
          }
          66% {
            content: "...";
          }
          100% {
            content: "";
          }
        }
      `}</style>
    </div>
  );
}
