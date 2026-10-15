import { notFound } from 'next/navigation';
import ExampleCook from './ExampleCook';

export const metadata = {
  title: 'example — visual cook',
  robots: { index: false, follow: false },
};

// Development only: without the guard the cook ships to the live site.
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ExampleCook />;
}
