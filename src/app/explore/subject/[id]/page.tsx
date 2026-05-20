import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function ExploreSubjectRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/subjects/${id}`);
}
