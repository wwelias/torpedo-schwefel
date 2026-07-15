'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ClubLogo from './ClubLogo';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary-green text-white border-b border-gold/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <ClubLogo className="w-12 h-12 transition-transform duration-300 group-hover:rotate-12" />
            <div>
              <span className="font-extrabold text-xl tracking-wider block text-white group-hover:text-gold transition-colors">
                TORPEDO
              </span>
              <span className="text-xs text-gold font-semibold uppercase tracking-widest block -mt-1">
                Schwefel 2018
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/#aktuelles" className="hover:text-gold transition-colors duration-200">
              Aktuelles
            </Link>
            <Link href="/#ueber-uns" className="hover:text-gold transition-colors duration-200">
              Über Uns
            </Link>
            <Link href="/#kader" className="hover:text-gold transition-colors duration-200">
              Kader
            </Link>
            <Link href="/#training" className="hover:text-gold transition-colors duration-200">
              Training
            </Link>

          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-gold hover:bg-primary-green-dark focus:outline-none transition-colors"
              aria-label="Hauptmenü öffnen"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-green-dark border-t border-gold/20">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            <Link
              href="/#aktuelles"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base hover:bg-primary-green hover:text-gold transition-colors"
            >
              Aktuelles
            </Link>
            <Link
              href="/#ueber-uns"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base hover:bg-primary-green hover:text-gold transition-colors"
            >
              Über Uns
            </Link>
            <Link
              href="/#kader"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base hover:bg-primary-green hover:text-gold transition-colors"
            >
              Kader
            </Link>
            <Link
              href="/#training"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base hover:bg-primary-green hover:text-gold transition-colors"
            >
              Training
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
