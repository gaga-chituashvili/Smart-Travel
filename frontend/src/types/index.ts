export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  location?: string
  createdAt: string
}

export interface Trip {
  id: string
  name: string
  description?: string
  coverImage?: string
  startDate?: string
  endDate?: string
  totalBudget: number
  currency: string
  status: 'PLANNING' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  isPublic: boolean
  owner: User
  members: TripMember[]
  days: TripDay[]
  _count?: { days: number; expenses: number }
}

export interface TripMember {
  id: string
  role: 'OWNER' | 'EDITOR' | 'MEMBER' | 'VIEWER'
  user: User
}

export interface TripDay {
  id: string
  dayNumber: number
  date?: string
  title?: string
  notes?: string
  activities: Activity[]
}

export interface Activity {
  id: string
  name: string
  type: 'HOTEL' | 'FLIGHT' | 'TRANSPORT' | 'FOOD' | 'SIGHT' | 'ACTIVITY' | 'SHOPPING' | 'OTHER'
  startTime?: string
  endTime?: string
  cost: number
  notes?: string
  address?: string
  lat?: number
  lng?: number
  order: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: 'HOTEL' | 'FLIGHT' | 'TRANSPORT' | 'FOOD' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER'
  date: string
  paidBy: User
}

export interface Comment {
  id: string
  text: string
  createdAt: string
  author: User
  reactions: Reaction[]
}

export interface Reaction {
  id: string
  emoji: string
  userId: string
}

export interface Destination {
  id: string
  name: string
  country: string
  countryCode: string
  city?: string
  description?: string
  imageUrl?: string
  lat: number
  lng: number
  avgCost?: number
  rating: number
  reviewCount: number
  category: string[]
  isTrending: boolean
}
