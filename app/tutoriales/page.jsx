import { redirect } from 'next/navigation';

export default function TutorialesRedirect() {
  redirect('/blog?tipo=tutorial');
}
