import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from 'lucide-react';

export default function SubscriptionBadge({ user, size = 'default' }) {
  if (!user) return null;

  const isActive = user.subscriptionActive;
  const plan = user.subscriptionPlan;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };

  if (!isActive) {
    return (
      <Badge variant="outline" className={`border-gray-300 text-gray-600 ${sizeClasses[size]}`}>
        <XCircle className={`mr-1 ${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        Free User
      </Badge>
    );
  }

  const colorMap = {
    'basic': 'bg-blue-100 text-blue-800 border-blue-300',
    'premium': 'bg-purple-100 text-purple-800 border-purple-300',
    'business': 'bg-orange-100 text-orange-800 border-orange-300'
  };

  const planLower = (plan || 'premium').toLowerCase();
  const colorClass = colorMap[planLower] || 'bg-green-100 text-green-800 border-green-300';

  return (
    <Badge className={`${colorClass} ${sizeClasses[size]}`}>
      <CheckCircle className={`mr-1 ${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      {plan || 'Premium'}
    </Badge>
  );
}