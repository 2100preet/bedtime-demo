import { ChildForm } from "@/components/child-form";

export const metadata = { title: "Add a child" };

export default function NewChildPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-4xl">Add a child</h1>
      <p className="mt-2 mb-6 text-muted-foreground">First name, age range, language, interests, and a nickname. That is the whole profile.</p>
      <ChildForm />
    </div>
  );
}
