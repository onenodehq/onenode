import { redirect } from 'next/navigation';

export default function DocumentPage() {
  // Redirect to the first document page
  redirect('/document/insert');
} 