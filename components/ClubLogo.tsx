import React from "react";
import Image from "next/image";

export default function ClubLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image 
        src="/torpedo-schwefel_logo.svg" 
        alt="Torpedo Schwefel Logo" 
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}

