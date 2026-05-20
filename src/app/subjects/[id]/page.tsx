'use client';

import { useParams } from 'next/navigation';
import PublicSubjectDetail from '@/components/public-subjects/PublicSubjectDetail';

export default function PublicSubjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <PublicSubjectDetail subjectId={id} />;
}
