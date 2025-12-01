import { auth } from "@/auth";
import KnowledgeBaseSettings from "@/components/KnowledgeBaseSettings";

export default async function SettingsPage() {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
    return <div>User Session not found.</div>;
  }

    return (
        <>
            <KnowledgeBaseSettings userId={userId}/>
        </>
    )
};