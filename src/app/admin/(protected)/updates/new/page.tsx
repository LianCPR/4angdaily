import { UpdateForm } from "@/components/admin/UpdateForm";

export default function NewUpdatePage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">New update</h1>
      <div className="mt-6">
        <UpdateForm />
      </div>
    </div>
  );
}
