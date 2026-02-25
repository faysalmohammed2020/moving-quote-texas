"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "@/validators/authValidators";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormFieldset,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { FormError } from "../../../../components/FormError";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client"; // ✅ NextAuth

type SignUpValues = yup.InferType<typeof signUpSchema>;

const SignupForm = () => {
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    setFormError("");
    const loadingId = toast.loading("Creating your account...");

    try {
      // 1) Create user via your API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }

      // 2) Auto sign-in with NextAuth credentials
      const signInRes = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false, // we'll route ourselves
      });

      toast.dismiss(loadingId);

      if (!signInRes?.ok) {
        throw new Error(signInRes?.error || "Sign in after registration failed");
      }

      toast.success("Account created! You're now signed in.");
      router.push("/admin/dashboard"); // adjust if your route differs
    } catch (error) {
      toast.dismiss(loadingId);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormFieldset>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldset>

            <FormError message={formError} />

            <Button
              variant="destructive"
              type="submit"
              className="mt-4 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="mt-5 space-x-1 text-center text-sm">
          <Link href="/auth/sign-in" className="text-sm text-muted-foreground hover:underline">
            Already have an account?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
