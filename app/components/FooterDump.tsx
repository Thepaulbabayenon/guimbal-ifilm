'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from "../../public/logo.svg"
import { useSelectedLayoutSegment } from 'next/navigation';


const FooterDump = () => {
  const segment = useSelectedLayoutSegment();
  const isProfilePage = segment === "user";
  if (isProfilePage) {
    return null;
  }
  return (
    
    <footer className="bg-black text-gray-400 p-1 text-xs">
      <div className='max-w-7xl mx-auto flex flex-col items-center justify-center'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          <div>
          
            <h3 className="font-bold mb-3">Company Information</h3>
            <ul>
              <li>
                <Link href="/contact">
                  <span className="cursor-pointer hover:underline">Contact Us</span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span className="cursor-pointer hover:underline">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/reviews">
                  <span className="cursor-pointer hover:underline">Reviews and Documentations</span>
                </Link>
              </li>
              <li>
                <Link href="/investors">
                  <span className="cursor-pointer hover:underline">Investors</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3">Customer Care</h3>
            <ul>
              <li>
                <Link href="/FAQ">
                  <span className="cursor-pointer hover:underline">FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/technical">
                  <span className="cursor-pointer hover:underline">Technical Support</span>
                </Link>
              </li>
              <li>
                <Link href="/terms&conditions">
                  <span className="cursor-pointer hover:underline">Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/feedback">
                  <span className="cursor-pointer hover:underline">Feedback and Suggestions</span>
                </Link>
              </li>
              <li>
                <Link href="/emergency">
                  <span className="cursor-pointer hover:underline">Emergency Support</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3">Services</h3>
            <ul>
              <li>
                <Link href="/subscription">
                  <span className="cursor-pointer hover:underline">Subscription</span>
                </Link>
              </li>
              <li>
                <Link href="/movielib">
                  <span className="cursor-pointer hover:underline">Movie Library</span>
                </Link>
              </li>
              <li>
                <Link href="/movielib">
                  <span className="cursor-pointer hover:underline">Streaming Quality and Device Compatibility</span>
                </Link>
              </li>
              <li>
                <Link href="/movielib">
                  <span className="cursor-pointer hover:underline">Accessibility and Language Options</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-y-2 pt-3 border-t border-gray-700 mt-8">
          <Image src={Logo} alt='logo' width={40} height={40}/>
          <p>&copy; {new Date().getFullYear()} Guimbal iFilm Society</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterDump;
