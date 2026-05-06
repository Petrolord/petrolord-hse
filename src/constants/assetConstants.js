// src/constants/assetConstants.js

export const ASSET_CATEGORIES = [
  { id: 'ppe', name: '👷 Personal Protective Equipment', icon: '👷' },
  { id: 'machinery', name: '⚙️ Machinery & Equipment', icon: '⚙️' },
  { id: 'vehicles', name: '🚗 Vehicles', icon: '🚗' },
  { id: 'tools', name: '🔧 Tools & Instruments', icon: '🔧' },
  { id: 'safety', name: '🚨 Safety Equipment', icon: '🚨' },
  { id: 'electrical', name: '⚡ Electrical Equipment', icon: '⚡' },
  { id: 'chemical', name: '🧪 Chemical Storage', icon: '🧪' },
  { id: 'other', name: '📦 Other', icon: '📦' },
];

export const ASSET_TEMPLATES = [
  {
    id: 'hard-hat',
    name: 'Hard Hat',
    icon: '👷',
    category: 'ppe',
    description: 'Safety hard hat for head protection',
    asset_id: 'HARDHAT-',
    maintenance_schedule: 'annually',
  },
  {
    id: 'safety-vest',
    name: 'Safety Vest',
    icon: '🦺',
    category: 'ppe',
    description: 'High-visibility safety vest',
    asset_id: 'VEST-',
    maintenance_schedule: 'annually',
  },
  {
    id: 'safety-glasses',
    name: 'Safety Glasses',
    icon: '👓',
    category: 'ppe',
    description: 'Eye protection equipment',
    asset_id: 'GLASSES-',
    maintenance_schedule: 'quarterly',
  },
  {
    id: 'gloves',
    name: 'Work Gloves',
    icon: '🧤',
    category: 'ppe',
    description: 'Protective work gloves',
    asset_id: 'GLOVES-',
    maintenance_schedule: 'quarterly',
  },
  {
    id: 'fire-extinguisher',
    name: 'Fire Extinguisher',
    icon: '🧯',
    category: 'safety',
    description: 'Fire safety equipment',
    asset_id: 'FIRE-',
    maintenance_schedule: 'annually',
  },
  {
    id: 'first-aid',
    name: 'First Aid Kit',
    icon: '🏥',
    category: 'safety',
    description: 'Emergency first aid supplies',
    asset_id: 'FIRSTAID-',
    maintenance_schedule: 'quarterly',
  },
  {
    id: 'ladder',
    name: 'Ladder',
    icon: '🪜',
    category: 'tools',
    description: 'Portable ladder for work',
    asset_id: 'LADDER-',
    maintenance_schedule: 'monthly',
  },
  {
    id: 'forklift',
    name: 'Forklift',
    icon: '🏗️',
    category: 'machinery',
    description: 'Material handling equipment',
    asset_id: 'FORKLIFT-',
    maintenance_schedule: 'monthly',
  },
];

export const MAINTENANCE_SCHEDULES = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'annually', name: 'Annually' },
];

export const SAFETY_STATUSES = [
  { id: 'safe', name: 'Safe', color: 'bg-green-900 text-green-100' },
  { id: 'warning', name: 'Warning', color: 'bg-yellow-900 text-yellow-100' },
  { id: 'critical', name: 'Critical', color: 'bg-red-900 text-red-100' },
];