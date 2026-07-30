import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — StoryForge AI" },
      { name: "description", content: "Sign in or create your StoryForge AI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});
const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(1).max(60),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  const signIn = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUp = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const onSignIn = signIn.handleSubmit(async (v) => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(v);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back.");
  });

  const onSignUp = signUp.handleSubmit(async (v) => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: v.displayName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email if verification is required.");
  });

  const onGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    setBusy(false);
    if (error) toast.error(
      error.message.includes("provider is not enabled")
        ? "Google login is not enabled — configure it in your Supabase dashboard under Authentication → Providers."
        : error.message ?? "Google sign-in failed"
    );
  };

  const onGitHub = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    setBusy(false);
    if (error) toast.error(
      error.message.includes("provider is not enabled")
        ? "GitHub login is not enabled — configure it in your Supabase dashboard under Authentication → Providers."
        : error.message ?? "GitHub sign-in failed"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-primary)] shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl">
            StoryForge <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="glass-strong rounded-2xl p-8 shadow-elegant">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <form onSubmit={onSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" {...signIn.register("email")} />
                  {signIn.formState.errors.email && (
                    <p className="text-xs text-destructive">{signIn.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <button
                      type="button"
                      onClick={async () => {
                        const email = signIn.getValues("email");
                        if (!email) { toast.error("Enter your email first."); return; }
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: window.location.origin + "/auth",
                        });
                        if (error) toast.error(error.message);
                        else toast.success("Password reset email sent.");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input type="password" placeholder="••••••••" {...signIn.register("password")} />
                  {signIn.formState.errors.password && (
                    <p className="text-xs text-destructive">{signIn.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <form onSubmit={onSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input placeholder="Elena the Storyteller" {...signUp.register("displayName")} />
                  {signUp.formState.errors.displayName && (
                    <p className="text-xs text-destructive">{signUp.formState.errors.displayName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" {...signUp.register("email")} />
                  {signUp.formState.errors.email && (
                    <p className="text-xs text-destructive">{signUp.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="At least 6 characters" {...signUp.register("password")} />
                  {signUp.formState.errors.password && (
                    <p className="text-xs text-destructive">{signUp.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Button variant="glass" className="w-full" onClick={onGoogle} disabled={busy}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
              </svg>
              Continue with Google
            </Button>

            <Button variant="glass" className="w-full" onClick={onGitHub} disabled={busy}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
