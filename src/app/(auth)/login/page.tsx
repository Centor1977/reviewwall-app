import LoginForm from "./LoginForm";

type Props = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { message, error } = await searchParams;
  return <LoginForm message={message} error={error} />;
}
