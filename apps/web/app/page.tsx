import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPicker } from "@/components/user-picker";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>todo-stack</CardTitle>
          <CardDescription>見たいユーザーの名前を入れてください。</CardDescription>
        </CardHeader>
        <CardContent>
          <UserPicker />
        </CardContent>
      </Card>
    </main>
  );
}
