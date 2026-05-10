/** Student-facing labels for `AssignedTopic.status` (shared by dashboard + topic page). */
export function assignmentStatusLabelForStudent(status: string): string {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In progress';
  return 'Not started';
}
