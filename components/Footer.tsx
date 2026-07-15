import React from 'react';
import Link from 'next/link';
import ClubLogo from './ClubLogo';

export default function Footer() {
  return (
    <footer className="bg-primary-green-dark text-white border-t-2 border-gold/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand section */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="flex items-center gap-3">
              <ClubLogo className="w-10 h-10" />
              <div>
                <span className="font-extrabold text-lg tracking-wider block text-white">TORPEDO</span>
                <span className="text-xs text-gold font-semibold uppercase tracking-widest block -mt-1">SCHWEFEL 2018</span>
              </div>
            </div>
            <p className="text-sm text-white/70 text-center md:text-left max-w-xs">
              Der heißeste Hobby-Fußballverein am Funkenplatz. Zukünftige Champions-League-Sieger seit 2018.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className="text-gold font-bold uppercase tracking-wider text-sm">Navigation</h3>
            <ul className="space-y-2 text-sm text-center md:text-left text-white/70">
              <li>
                <Link href="/#" className="hover:text-gold transition-colors">Startseite</Link>
              </li>
              <li>
                <Link href="/#aktuelles" className="hover:text-gold transition-colors">Aktuelles & Turniere</Link>
              </li>
              <li>
                <Link href="/#ueber-uns" className="hover:text-gold transition-colors">Über Uns</Link>
              </li>
              <li>
                <Link href="/#kader" className="hover:text-gold transition-colors">Unser Kader</Link>
              </li>
            </ul>
          </div>

          {/* Club details */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className="text-gold font-bold uppercase tracking-wider text-sm">Unser Revier</h3>
            <p className="text-sm text-white/70 text-center md:text-left">
              <strong>Heimspielstätte:</strong><br />
              Sportplatz Funkenplatz Schwefel<br />
              Hohenems, Österreich
            </p>
            <p className="text-xs text-white/40 text-center md:text-left mt-2">
              Trainingszeiten: Dienstags & Donnerstags abends. Fans sind immer herzlich willkommen!
            </p>
          </div>

        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Torpedo Schwefel. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <span className="text-gold/85">Mit Leidenschaft gekickt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
