export type Slide = { id: string; image: string; headline: string; subhead: string };
const KEY = "admin-slides";

export function getSlides(defaultSlides: Slide[]) {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Slide[]) : defaultSlides;
  } catch {
    return defaultSlides;
  }
}
export function saveSlides(slides: Slide[]) {
  localStorage.setItem(KEY, JSON.stringify(slides));
}
