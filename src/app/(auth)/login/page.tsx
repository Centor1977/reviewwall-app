import LoginForm from "./LoginForm";

type Props = {
  searchParams: Promise<{ message?: string; error?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { message, error, email } = await searchParams;
  return <LoginForm message={message} error={error} email={email} />;
}
