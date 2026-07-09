"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square border border-black/10 bg-black/[0.02]">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative aspect-square border ${
                i === active ? "border-black" : "border-black/10 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${title} ${i + 1}`} fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
