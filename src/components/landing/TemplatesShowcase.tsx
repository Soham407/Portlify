import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const templates = [
  {
    name: "Minimal",
    description: "Clean single-column layout with elegant typography",
    preview: (
      <div className="flex h-full w-full flex-col bg-[hsl(0,0%,98%)] p-4 text-[hsl(0,0%,10%)]">
        <div className="mb-3 text-[6px] font-light tracking-[0.3em] uppercase text-[hsl(0,0%,50%)]">Portfolio</div>
        <div className="mb-2 text-[10px] font-semibold">Sarah Chen</div>
        <div className="mb-3 text-[5px] text-[hsl(0,0%,50%)]">Product Designer</div>
        <div className="mt-auto flex gap-1.5">
          <div className="h-8 w-12 rounded-[2px] bg-[hsl(0,0%,92%)]" />
          <div className="h-8 w-12 rounded-[2px] bg-[hsl(0,0%,88%)]" />
          <div className="h-8 w-12 rounded-[2px] bg-[hsl(0,0%,92%)]" />
        </div>
      </div>
    ),
  },
  {
    name: "Developer",
    description: "Terminal-inspired with code aesthetics & monospace type",
    preview: (
      <div className="flex h-full w-full flex-col bg-[hsl(220,20%,8%)] p-4 font-mono text-[hsl(142,70%,60%)]">
        <div className="mb-1 text-[5px] text-[hsl(220,10%,40%)]">~ /portfolio</div>
        <div className="mb-2 text-[9px] font-bold text-[hsl(0,0%,95%)]">$ alex.dev</div>
        <div className="space-y-1 text-[5px]">
          <div><span className="text-[hsl(270,60%,65%)]">const</span> role = <span className="text-[hsl(35,90%,65%)]">"Full-Stack Dev"</span></div>
          <div><span className="text-[hsl(270,60%,65%)]">const</span> stack = [<span className="text-[hsl(35,90%,65%)]">"React"</span>, <span className="text-[hsl(35,90%,65%)]">"Node"</span>]</div>
        </div>
        <div className="mt-auto flex gap-1">
          <div className="h-6 w-14 rounded-[2px] border border-[hsl(142,70%,60%/0.2)] bg-[hsl(142,70%,60%/0.05)]" />
          <div className="h-6 w-14 rounded-[2px] border border-[hsl(142,70%,60%/0.2)] bg-[hsl(142,70%,60%/0.05)]" />
        </div>
      </div>
    ),
  },
  {
    name: "Creative",
    description: "Bold colors & asymmetric layout for designers",
    preview: (
      <div className="flex h-full w-full bg-[hsl(45,100%,96%)]">
        <div className="w-1/3 bg-[hsl(15,80%,55%)] p-3">
          <div className="mb-2 h-6 w-6 rounded-full bg-[hsl(45,100%,96%)]" />
          <div className="text-[5px] font-bold text-[hsl(45,100%,96%)]">MIA<br/>ROSS</div>
        </div>
        <div className="flex-1 p-3">
          <div className="mb-2 text-[5px] font-bold text-[hsl(15,80%,35%)]">Selected Work</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-7 rounded-[2px] bg-[hsl(15,80%,55%/0.12)]" />
            <div className="h-7 rounded-[2px] bg-[hsl(45,60%,80%)]" />
            <div className="h-7 rounded-[2px] bg-[hsl(45,60%,80%)]" />
            <div className="h-7 rounded-[2px] bg-[hsl(15,80%,55%/0.12)]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "Corporate",
    description: "Professional layout for business & consulting",
    preview: (
      <div className="flex h-full w-full flex-col bg-[hsl(0,0%,100%)] text-[hsl(220,20%,15%)]">
        <div className="flex items-center justify-between border-b border-[hsl(220,13%,91%)] px-4 py-2">
          <div className="text-[6px] font-bold">JW</div>
          <div className="flex gap-2 text-[4px] text-[hsl(220,9%,46%)]"><span>About</span><span>Work</span><span>Contact</span></div>
        </div>
        <div className="flex flex-1 items-center px-4">
          <div>
            <div className="text-[9px] font-bold">James Wilson</div>
            <div className="text-[5px] text-[hsl(220,9%,46%)]">Strategy Consultant</div>
            <div className="mt-2 h-3 w-10 rounded-[2px] bg-[hsl(220,70%,50%)]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "Photography",
    description: "Image-first grid layout for visual portfolios",
    preview: (
      <div className="flex h-full w-full flex-col bg-[hsl(0,0%,5%)] p-3 text-[hsl(0,0%,95%)]">
        <div className="mb-2 text-[7px] font-light tracking-[0.2em]">LENS</div>
        <div className="grid flex-1 grid-cols-3 gap-1">
          <div className="rounded-[1px] bg-[hsl(200,15%,25%)]" />
          <div className="col-span-2 rounded-[1px] bg-[hsl(30,15%,20%)]" />
          <div className="col-span-2 rounded-[1px] bg-[hsl(150,10%,22%)]" />
          <div className="rounded-[1px] bg-[hsl(260,15%,20%)]" />
        </div>
      </div>
    ),
  },
];

const TemplatesShowcase = () => {
  return (
    <section id="templates" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-gradient">Premium</span> Templates
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Professionally designed templates that make your portfolio unforgettable.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-glow"
            >
              <div className="h-48 overflow-hidden">
                {template.preview}
              </div>
              <div className="bg-card p-4">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </motion.div>
          ))}
          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8"
          >
            <p className="mb-4 text-center font-semibold">Ready to build yours?</p>
            <Button variant="hero" asChild>
              <Link to="/signup">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesShowcase;
