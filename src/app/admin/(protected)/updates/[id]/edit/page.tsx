import { notFound } from "next/navigation";
import { UpdatesRepo } from "@/lib/db";
import { UpdateForm } from "@/components/admin/UpdateForm";

export default async function EditUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await UpdatesRepo.getById(Number(id));
  if (!entry) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Edit update</h1>
      <div className="mt-6">
        <UpdateForm initial={entry} />
      </div>
    </div>
  );
}
