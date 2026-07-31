import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
interface ImageSliderProps {
  images: {
    src: string;
    alt: string;
  }[];
}
export function ImageSlider({
  images
}: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (next: number) => {
    setDir(next > index || index === images.length - 1 && next === 0 ? 1 : -1);
    setIndex((next + images.length) % images.length);
  };
  return <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl bg-stone-100">
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.img key={index} src={images[index].src} alt={images[index].alt} custom={dir} initial={{
        opacity: 0,
        x: dir * 40
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: dir * -40
      }} transition={{
        duration: 0.35,
        ease: 'easeOut'
      }} className="absolute inset-0 h-full w-full object-cover" />
      </AnimatePresence>

      <button onClick={() => go(index - 1)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-stone-700 backdrop-blur transition-colors hover:bg-white" aria-label="Ảnh trước">
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button onClick={() => go(index + 1)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-stone-700 backdrop-blur transition-colors hover:bg-white" aria-label="Ảnh tiếp theo">
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => <button key={i} onClick={() => go(i)} aria-label={`Đến ảnh ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`} />)}
      </div>
    </div>;
}