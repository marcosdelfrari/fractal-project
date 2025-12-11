import Link from "next/link";
import Image from "next/image";
import React from "react";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuCategory {
  title: string;
  items: SubCategory[];
}

interface MegaMenuProps {
  activeItem: string;
  data: {
    leftLinks: SubCategory[];
    categories: MenuCategory[];
    featured: {
      image: string;
      title: string;
      subtitle: string;
      linkText: string;
      linkHref: string;
    };
  } | null;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ activeItem, data }) => {
  if (!data) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white text-black shadow-lg z-40 border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-8 py-10 flex justify-between">
        {/* Left Column: Quick Links */}
        <div className="flex flex-col gap-4 w-1/5">
          {data.leftLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-sm hover:text-gray-500 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Middle Column: Categories */}
        <div className="flex gap-16 w-2/5">
          {data.categories.map((category, index) => (
            <div key={index} className="flex flex-col gap-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-green-900 mb-2">
                {category.title}
              </h3>
              <div className="flex flex-col gap-3">
                {category.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="text-sm hover:text-gray-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Featured Image */}
        <div className="w-2/5 pl-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
            {/* Fallback image if specific one not found, utilizing a colored div as placeholder if image fails or isn't real */}
            <div className="w-full h-full bg-gray-100 relative">
              <Image
                src={data.featured.image}
                alt={data.featured.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2">
              {data.featured.subtitle}
            </h4>
            <Link
              href={data.featured.linkHref}
              className="text-xs border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
            >
              {data.featured.linkText} &gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
