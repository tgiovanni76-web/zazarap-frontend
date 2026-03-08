import React from 'react';
import { cn } from '@/lib/utils';
import { Car, Home, Laptop, Sprout, Shirt, Users, Gamepad2, PawPrint, Briefcase, Wrench, Gift, Package } from 'lucide-react';

const ICONS = {
  Car,
  Home,
  Laptop,
  Sprout,
  Shirt,
  Users,
  Gamepad2,
  PawPrint,
  Briefcase,
  Wrench,
  Gift,
  Package,
};

export default function CategoryIcon({ name, className }) {
  const IconComp = (name && ICONS[name]) ? ICONS[name] : Package;
  return <IconComp className={cn('h-5 w-5', className)} aria-hidden="true" focusable="false" />;
}