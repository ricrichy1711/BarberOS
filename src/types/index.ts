export type UserRole = 'visitor' | 'client' | 'barber' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  birthday?: string;
  bio?: string;
  createdAt: string;
  barbershopId?: string; // for barber/owner
}

export interface Barbershop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  plan: 'free' | 'basic' | 'pro' | 'premium' | 'premium_pro';
  rating: number;
  reviewCount: number;
  createdAt: string;
  // New physical chairs management
  chairs?: number;
  services?: { name: string; price: number; duration: number }[];
  businessHours?: Record<string, { open: string; close: string; closed: boolean }>;
  closedDates?: { date: string; reason: string }[];
  featuredReviewId?: string;
  planExpiresAt?: string;
}

export interface Barber {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  barbershopId: string;
  barbershopName: string;
  specialty: string;
  bio: string;
  isPublic: boolean;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  // Chair assignment
  chairId?: string;
  isIndependent?: boolean;
  offDays?: string[]; // Días de descanso (ej: ['1', '2'] para Lunes y Martes)
  lunchBreak?: { start: string; end: string }; // Hora de comida (ej: { start: '14:00', end: '15:00' })
}

export interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  barberId: string;
  barberName: string;
  barbershopId: string;
  barbershopName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'lost';
  price: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  barbershopId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  barberId: string;
  barbershopId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ProductSale {
  id: string;
  barbershopId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  barbershopId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface Chair {
  id: string;
  barbershopId: string;
  name: string;
  barberId: string | null;
  createdAt: string;
}

export interface IntegrationRequest {
  id: string;
  barberId: string;
  barberName: string;
  barbershopId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Transaction {
  id: string;
  barbershopId: string;
  mercadoPagoId?: string;
  amount: number;
  currency: string;
  status: string;
  planId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  message: string;
  emoji: string;
  color: 'amber' | 'blue' | 'green' | 'purple' | 'red';
  style: 'banner' | 'card' | 'hero' | 'toast';
  target: 'all' | 'owner' | 'barber' | 'client';
  isActive: boolean;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  advertiser?: string;
  priority: 1 | 2 | 3;
  scheduledAt?: string;
  expiresAt?: string;
  createdAt: string;
}
