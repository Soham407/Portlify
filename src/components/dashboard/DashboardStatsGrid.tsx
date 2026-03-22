import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface DashboardStat {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  progress?: number;
}

interface DashboardStatsGridProps {
  stats: DashboardStat[];
}

const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => (
  <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="surface-panel rounded-[1.5rem] p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
            <stat.icon className="h-4 w-4" />
          </div>
        </div>
        {stat.progress !== undefined && (
          <Progress value={stat.progress} className="mt-3 h-1.5" />
        )}
      </motion.div>
    ))}
  </div>
);

export default DashboardStatsGrid;
