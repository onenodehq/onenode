import { redirect } from 'next/navigation';

export default function SyntaxPage() {
  // Redirect to the first syntax page
  redirect('/syntax/overview');
} 