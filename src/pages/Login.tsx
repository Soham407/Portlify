import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth, getOnboardingRedirect } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const perks = [
  "AI-powered content polish",
  "5 premium templates",
  "GitHub import in one click",
  "Custom public portfolio URL",
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Invalid credentials";

  useEffect(() => {
    if (!user) return;

    getOnboardingRedirect(user.id).then((path) => navigate(path, { replace: true }));
  }, [user, navigate]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: unknown) {
      toast({ title: "Login failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden p-6 lg:flex">
        <div className="surface-wood flex w-full flex-col justify-center rounded-[2.25rem] p-12">
          <div className="max-w-sm text-foreground">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Briefcase className="h-7 w-7" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">Welcome Back</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Continue building your portfolio and keep your best work ready for the next opportunity.
            </p>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="surface-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Portlify</span>
            </Link>
            <ThemeToggle compact />
          </div>

          <h1 className="mb-1 text-2xl font-bold">Log in to your account</h1>
          <p className="mb-7 text-sm text-muted-foreground">Enter your credentials to continue.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="yourname@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button variant="hero" className="w-full" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
