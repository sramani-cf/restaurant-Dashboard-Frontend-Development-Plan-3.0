// Demo data for restaurant management dashboard

export const RESTAURANT_DATA = {
  name: "Aura Restaurant",
  location: "Downtown Seattle",
  type: "Fine Dining",
  capacity: 120,
  tables: 25
}

export const SALES_DATA = [
  { name: 'Mon', sales: 4200, orders: 42 },
  { name: 'Tue', sales: 3800, orders: 38 },
  { name: 'Wed', sales: 5200, orders: 52 },
  { name: 'Thu', sales: 6800, orders: 68 },
  { name: 'Fri', sales: 9200, orders: 92 },
  { name: 'Sat', sales: 11500, orders: 115 },
  { name: 'Sun', sales: 8900, orders: 89 }
]

export const MENU_ITEMS = [
  {
    id: 1,
    name: "Wagyu Steak",
    category: "Entrees",
    price: 89.99,
    cost: 35.20,
    popularity: 85,
    profit: 54.79
  },
  {
    id: 2,
    name: "Lobster Thermidor",
    category: "Entrees", 
    price: 76.99,
    cost: 28.40,
    popularity: 72,
    profit: 48.59
  },
  {
    id: 3,
    name: "Caesar Salad",
    category: "Appetizers",
    price: 18.99,
    cost: 4.20,
    popularity: 95,
    profit: 14.79
  },
  {
    id: 4,
    name: "Truffle Pasta",
    category: "Entrees",
    price: 42.99,
    cost: 12.80,
    popularity: 88,
    profit: 30.19
  }
]

export const INVENTORY_ITEMS = [
  { name: "Prime Beef", stock: 85, par: 100, unit: "lbs", cost: 12.50 },
  { name: "Fresh Salmon", stock: 45, par: 60, unit: "lbs", cost: 8.75 },
  { name: "Organic Tomatoes", stock: 25, par: 40, unit: "lbs", cost: 3.20 },
  { name: "Truffle Oil", stock: 8, par: 12, unit: "bottles", cost: 45.00 }
]

export const STAFF_DATA = [
  { id: 1, name: "Sarah Johnson", role: "Head Chef", shift: "Evening", performance: 95 },
  { id: 2, name: "Mike Chen", role: "Sous Chef", shift: "Evening", performance: 88 },
  { id: 3, name: "Emma Davis", role: "Server", shift: "Lunch", performance: 92 },
  { id: 4, name: "Tom Wilson", role: "Bartender", shift: "Evening", performance: 89 }
]

export const RESERVATION_DATA = [
  { 
    id: 1, 
    name: "Anderson Party", 
    time: "7:00 PM", 
    guests: 4, 
    table: 12, 
    status: "confirmed",
    phone: "(555) 123-4567"
  },
  { 
    id: 2, 
    name: "Smith Celebration", 
    time: "7:30 PM", 
    guests: 6, 
    table: 8, 
    status: "seated",
    phone: "(555) 234-5678" 
  },
  { 
    id: 3, 
    name: "Johnson Dinner", 
    time: "8:00 PM", 
    guests: 2, 
    table: 15, 
    status: "confirmed",
    phone: "(555) 345-6789"
  }
]

export const CUSTOMER_DATA = [
  {
    id: 1,
    name: "Robert Anderson",
    email: "robert@email.com", 
    visits: 12,
    totalSpent: 2400,
    avgCheck: 200,
    lastVisit: "2024-01-15",
    loyalty: "Gold"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@email.com",
    visits: 8,
    totalSpent: 1600,
    avgCheck: 200,
    lastVisit: "2024-01-10", 
    loyalty: "Silver"
  },
  {
    id: 3,
    name: "David Smith",
    email: "david@email.com",
    visits: 25,
    totalSpent: 5250,
    avgCheck: 210,
    lastVisit: "2024-01-20",
    loyalty: "Platinum"
  }
]

export const KDS_ORDERS = [
  {
    id: "ORD-001",
    table: "12",
    items: ["Wagyu Steak", "Caesar Salad", "Wine"],
    time: "15:32",
    status: "preparing",
    priority: "normal"
  },
  {
    id: "ORD-002", 
    table: "8",
    items: ["Lobster Thermidor", "Truffle Pasta"],
    time: "15:28",
    status: "ready",
    priority: "high"
  },
  {
    id: "ORD-003",
    table: "15",
    items: ["Caesar Salad", "House Wine"],
    time: "15:35",
    status: "new",
    priority: "normal"
  }
]

export const TABLE_STATUSES = [
  { id: 1, number: 1, seats: 2, status: "available", x: 50, y: 50 },
  { id: 2, number: 2, seats: 4, status: "occupied", x: 150, y: 50 },
  { id: 3, number: 3, seats: 4, status: "reserved", x: 250, y: 50 },
  { id: 4, number: 4, seats: 6, status: "occupied", x: 50, y: 150 },
  { id: 5, number: 5, seats: 2, status: "cleaning", x: 150, y: 150 },
  { id: 6, number: 6, seats: 8, status: "available", x: 250, y: 150 }
]