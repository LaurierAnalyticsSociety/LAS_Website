import { renderToString } from 'react-dom/server';
import { App } from './App';
import { faqs } from './data/site';

export function render() {
  return renderToString(<App />);
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
