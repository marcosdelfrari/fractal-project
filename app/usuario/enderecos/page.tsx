import { redirect } from 'next/navigation';

export default function UserAddressesPage() {
  redirect('/usuario?tab=addresses');
}
