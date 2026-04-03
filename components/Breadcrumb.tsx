// *********************
// Role of the component: Component that displays current page location in the application 
// Name of the component: Breadcrumb.tsx
// Version: 1.0
// Component call: <Breadcrumb />
// Input parameters: No input parameters
// Output: Page location in the application
// *********************

import Link from "next/link";
import React from "react";
import { FaHouse } from "react-icons/fa6";

const Breadcrumb = () => {
  return (
    <div className="breadcrumbs py-1 text-sm text-zinc-500 md:py-2 md:text-base [&_a]:text-zinc-600 [&_a:hover]:text-zinc-900">
      <ul>
        <li>
          <Link href="/">
            <FaHouse className="mr-2" />
            Home
          </Link>
        </li>
        <li>
          <Link href="/loja">Loja</Link>
        </li>
        <li>
          <Link href="/loja">Todos os produtos</Link>
        </li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
