"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/logo.svg"; // Assuming logo is in public folder

const AboutPage = () => {
  return (
    <main className="bg-neutral-900 text-gray-300 min-h-screen">
      <div className="max-w-screen-lg mx-auto px-6 py-16">
        <div className="flex items-center mb-8">
          <Image src={Logo} alt="Guimbal iFilm Society Logo" width={64} height={64} className="mr-4" />
          <h1 className="text-4xl font-bold text-white">About Guimbal iFilm & This Platform</h1>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Our Roots: The Guimbal iFilm Society</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            The Guimbal iFilm Society stands as one of the longest-running community-based filmmaker groups in the Philippines. For nearly two decades, we have nurtured local talent and celebrated cinematic storytelling through our annual film festival. Our archive boasts over 250 films, representing a rich tapestry of local creativity and cultural heritage produced year after year.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Our mission has always been to foster filmmaking within the community and showcase these unique works. However, preserving and sharing this growing collection presented significant challenges.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">The Challenge: Bridging Tradition and Technology</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Historically, our extensive film library was stored on physical media, primarily external hard drives. While functional for archival, this method limited accessibility for a wider audience and lacked the engaging, personalized experience modern viewers expect. Sharing our cinematic heritage beyond physical screenings was cumbersome and unsustainable for our growing collection.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Our Solution: A Dedicated Streaming Platform</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            To overcome these limitations and bring the Guimbal iFilm Society's collection into the digital age, this cloud-based streaming platform was developed. Our goal is to provide enhanced accessibility and foster greater user engagement with our unique film library.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Leveraging modern cloud technologies (like AWS and NeonDB) ensures a scalable, reliable, and secure environment for hosting and streaming films. The platform features a user-friendly interface designed for easy navigation across various devices.
          </p>
          <p className="text-gray-400 leading-relaxed">
            A key innovation is the implementation of a **custom hybrid recommendation algorithm**. This system combines collaborative filtering (learning from user behavior) and content-based filtering (analyzing film attributes) to offer personalized suggestions, helping viewers discover films tailored to their tastes within our diverse collection.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment</h2>
          <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed">
            <li><span className="font-medium text-gray-300">Accessibility:</span> Making our film archive easily available to a broader audience online.</li>
            <li><span className="font-medium text-gray-300">Engagement:</span> Creating an interactive and personalized viewing experience through recommendations, reviews, and community features.</li>
            <li><span className="font-medium text-gray-300">Preservation:</span> Digitally safeguarding the rich cinematic heritage of Guimbal.</li>
            <li><span className="font-medium text-gray-300">Discovery:</span> Helping users explore and appreciate the diverse works of our local filmmakers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Development Context</h2>
          <p className="text-gray-400 leading-relaxed">
            This platform was developed as part of a Bachelor of Science in Computer Science thesis project at the University of San Agustin by Paul E. Babayen-on, Johan Ross S. Cajilig, Derrick Jovil O. Dagohoy, Serge Alfred T. España, and Roche Kristoffer P. Pido, under the guidance of Gerard G. Sayomac. It represents a fusion of academic research and practical application to serve the Guimbal iFilm Society community.
          </p>
        </section>
        <div className="mt-12 text-center">
           <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Have questions? Contact Us
           </Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;