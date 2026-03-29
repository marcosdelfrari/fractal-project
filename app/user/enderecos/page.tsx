import { redirect } from 'next/navigation';

export default function UserAddressesPage() {
  redirect('/user?tab=addresses');
}
