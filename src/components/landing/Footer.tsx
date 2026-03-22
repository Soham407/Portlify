import { Link } from "react-router-dom";
import { Briefcase, Globe2, LockKeyhole, Send } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  Account: [
    { label: "Sign Up", href: "/signup", internal: true },
    { label: "Log In", href: "/login", internal: true },
  ],
  Publishing: [
    { label: "Share Options", href: "#publishing" },
    { label: "Public Portfolio", href: "#publishing" },
    { label: "Template Gallery", href: "#templates" },
  ],
};

const publishingHighlights = [
  { icon: Globe2, label: "Public username pages" },
  { icon: Send, label: "Unlisted review links" },
  { icon: LockKeyhole, label: "Protected editing flow" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/70 bg-card/75 backdrop-blur-xl">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,0.7fr)]">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Portlify</span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Build a stunning, recruiter-ready portfolio in minutes with AI-powered tools and premium templates.
            </p>
            <div className="flex flex-wrap gap-2">
              {publishingHighlights.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            Copyright {new Date().getFullYear()} Portlify. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Public URLs</span>
            <span>Unlisted sharing</span>
            <span>Secure sign-in</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
