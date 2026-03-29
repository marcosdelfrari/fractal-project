import { redirect } from 'next/navigation';

export default function UserOrdersPage() {
  redirect('/user?tab=orders');
}
