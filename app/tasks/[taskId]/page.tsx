import { TaskDetailPage } from "@/components/fpmt-ui";

type Props = {
  params: Promise<{ taskId: string }>;
};

export default async function Page({ params }: Props) {
  const { taskId } = await params;
  return <TaskDetailPage taskId={taskId} />;
}

