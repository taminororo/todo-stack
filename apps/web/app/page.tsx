import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "@/components/create-user-form";
import { UserPicker } from "@/components/user-picker";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>todo-stack</CardTitle>
          <CardDescription>見たいユーザーの名前を入れるか、新しく作ってください。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <UserPicker />
          <CreateUserForm />
        </CardContent>
      </Card>
    </main>
  );
}
