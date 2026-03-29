import { redirect } from 'next/navigation';

export default function UserReviewsPage() {
  redirect('/user?tab=reviews');
}
