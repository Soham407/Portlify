import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LandingAuthState } from "@/components/landing/types";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#templates", label: "Templates" },
];

type HeaderProps = {
  authState: LandingAuthState;
};

const Header = ({ authState }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const authenticated = authState === "authenticated";
  const authResolved = authState !== "loading";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-border/70" : "bg-transparent"}`}>
      <div className="container relative flex h-16 items-center gap-3">
        <Link to="/" className="group z-10 flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-sm transition-transform group-hover:scale-105">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Portlify</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle compact />
          {!authResolved ? (
            <>
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </>
          ) : authenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/builder">Continue Building</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              <div className="mb-2 flex justify-end border-b border-border/70 pb-3">
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                {!authResolved ? (
                  <>
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </>
                ) : authenticated ? (
                  <>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button variant="hero" size="sm" className="w-full" asChild>
                      <Link to="/builder" onClick={() => setMobileOpen(false)}>Continue Building</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                    </Button>
                    <Button variant="hero" size="sm" className="w-full" asChild>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
