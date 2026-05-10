import { redirect } from 'next/navigation';

/** Legacy path — progress analytics live under `/analytics`. */
export default function ProgressPage() {
  redirect('/analytics');
}
