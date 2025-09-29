import { ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
export function AuthLayout() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent to-70% dark:from-primary/10" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4 mb-8 z-10"
      >
        <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-gray-50">
          PitchPal
        </h1>
        <p className="text-muted-foreground">Your Soccer Team, Managed.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md z-10"
      >
        <Outlet />
      </motion.div>
    </main>
  );
}