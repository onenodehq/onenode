import { redirect } from 'next/navigation';

export default function CollectionPage() {
  // Redirect to the first collection page
  redirect('/collection/drop');
} 