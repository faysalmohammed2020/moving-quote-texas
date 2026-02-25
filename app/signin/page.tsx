import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Component() {
  return (
    <div className="flex justify-center items-center h-full grow">
      <Card className="mx-auto mt-56 min-w-md w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex justify-center">
            Welcome
          </CardTitle>
          <CardDescription className="flex justify-center">
            Enter your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Link href="/dashboard">
              <Button type="submit" className="w-full mt-5">
                Login
              </Button>
            </Link>
          </div>
          <div className="mt-2 text-black">
            <Link href="#">Forgot Password?</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
