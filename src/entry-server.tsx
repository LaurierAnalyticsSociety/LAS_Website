import { renderToString } from 'react-dom/server';
import { App } from './App';
import { faqs } from './data/site';

export function render(page: 'home' | 'workshops' = 'home') {
  return renderToString(<App page={page} />);
}

export function faqJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a }
    }))
  });
}
