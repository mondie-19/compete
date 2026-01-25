import { ReactNode } from "react";

export default function ComingSoonLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-black overflow-x-hidden">
      {/* This layout acts as a wrapper. 
          It inherits the <html> and <body> from the root layout 
          but ignores the Navbar and Footer because they are 
          siblings to {children} in the root, not parents.
      */}
      {children}
    </section>
  );
}