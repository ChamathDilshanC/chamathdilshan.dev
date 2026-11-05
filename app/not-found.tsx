import { ArrowLink } from "@/components/ui/arrow-link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh w-full flex-col items-start justify-end gap-10 bg-neutral-900 p-6 pb-16">
      <p className="type-body-3 text-white-a50">404</p>
      <h1 className="type-heading-2">This page does not exist.</h1>
      <ArrowLink href="/" variant="light">
        Back Home
      </ArrowLink>
    </main>
  );
}
