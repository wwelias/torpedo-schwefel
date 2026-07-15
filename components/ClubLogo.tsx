import React from "react";

export default function ClubLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <img 
      src="/torpedo-schwefel_logo.svg" 
      className={className} 
      alt="Torpedo Schwefel Logo" 
    />
  );
}

