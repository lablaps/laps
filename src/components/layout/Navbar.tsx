'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Sobre', href: '/sobre' },
  { name: 'Equipe', href: '/equipe' },
  { name: 'Home', href: '/', active: true },
  { name: 'Projetos', href: '/projetos' },
  { name: 'Contato', href: '/contato' },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 md:gap-6 pointer-events-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative px-5 py-2.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300
                  flex items-center justify-center min-w-[100px] cursor-pointer
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/50' 
                    : 'bg-white/70 backdrop-blur-md text-slate-700 border border-white/50 hover:bg-white hover:text-blue-600 hover:shadow-xl shadow-slate-200/50'
                  }
                `}
              >
                {item.name}
                {isActive && (
                  <motion.span 
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-md -z-10"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
