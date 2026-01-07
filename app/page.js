import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/auth');
  return (
    <div>
      <h1>This it pageRoot </h1>
    </div>
  );
}
