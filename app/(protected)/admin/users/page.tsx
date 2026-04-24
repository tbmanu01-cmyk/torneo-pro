import { requireSuperAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import UsersManager from "@/components/users/UsersManager";

export default async function AdminUsersPage() {
  const session = await requireSuperAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <UsersManager
          initialUsers={users}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
