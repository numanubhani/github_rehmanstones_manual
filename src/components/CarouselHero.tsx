import { useEffect, useRef, useState } from "react";

type Slide = {
  id: number | string;
  image: string;
  headline?: string;
  subhead?: string;
  type?: "image" | "video";
};

export default function CarouselHero({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);
  const goTo = (i: number) => setIndex(i);

  const start = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
  };
  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  return (
    // square edges (no rounded), slightly glassy overlay handled inside
    <section
      className="relative h-[360px] sm:h-[440px] md:h-[520px] overflow-hidden border"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div key={s.id} className="relative min-w-full h-full">
            {(s.type === "video") ? (
              <video
                key={`video-${s.id}`}
                src={s.image}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* subtle dark veil for readability */}
            <div className="absolute inset-0 bg-black/30" />

            {/* CENTERED content */}
            {(s.headline || s.subhead) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
                {s.headline && (
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow">
                    {s.headline}
                  </h2>
                )}
                {s.subhead && (
                  <p className="mt-3 max-w-2xl text-sm sm:text-base opacity-90">
                    {s.subhead}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-9 h-9 grid place-items-center"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-9 h-9 grid place-items-center"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
