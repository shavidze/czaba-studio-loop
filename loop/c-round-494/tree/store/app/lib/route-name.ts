export function readRouteName(doc: Document): string {
  const title = doc.title.trim();
  if (title !== '') return title;
  const heading = doc.querySelector('.page-transition-wrapper h1');
  return heading?.textContent?.trim() ?? '';
}
