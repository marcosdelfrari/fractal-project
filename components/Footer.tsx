// *********************
// Role of the component: Footer component
// Name of the component: Footer.tsx
// Version: 1.1
// Component call: <Footer />
// Input parameters: no input parameters
// Output: Footer component
// *********************

"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Ocultar footer nas páginas de login, verify-pin e admin
  if (
    pathname === "/login" ||
    pathname === "/verify-pin" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer
      className="bg-white border-t border-gray-100"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
        <span className="font-thin text-4xl tracking-widest text-black">
          MARCOS
        </span>
        <p className="mt-8 text-xs leading-5 text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Fractal Project. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
