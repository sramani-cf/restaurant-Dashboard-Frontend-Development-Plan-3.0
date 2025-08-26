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

// Live Feed Data
export const LIVE_KITCHEN_ORDERS = [
  {
    id: "ORD-101",
    table: "12",
    items: ["Wagyu Steak", "Caesar Salad", "Red Wine"],
    orderTime: "15:32",
    cookTime: "18:42",
    estimatedTime: 25,
    elapsed: 12,
    status: "cooking",
    priority: "high",
    chef: "Sarah Johnson",
    temperature: "medium-rare"
  },
  {
    id: "ORD-102",
    table: "8",
    items: ["Lobster Thermidor", "Truffle Pasta", "White Wine"],
    orderTime: "15:28",
    cookTime: "18:38",
    estimatedTime: 30,
    elapsed: 16,
    status: "plating",
    priority: "normal",
    chef: "Mike Chen",
    notes: "Customer allergic to nuts"
  },
  {
    id: "ORD-103",
    table: "15",
    items: ["Caesar Salad", "House Wine"],
    orderTime: "15:35",
    cookTime: null,
    estimatedTime: 15,
    elapsed: 5,
    status: "pending",
    priority: "normal",
    chef: null,
    notes: "Extra dressing on side"
  }
]

export const LIVE_SERVICE_UPDATES = [
  {
    id: 1,
    type: "table_seated",
    table: "14",
    timestamp: "18:45",
    server: "Emma Davis",
    guests: 4,
    details: "Anderson party seated, menus provided"
  },
  {
    id: 2,
    type: "order_taken",
    table: "22",
    timestamp: "18:43",
    server: "Tom Wilson",
    guests: 2,
    details: "Order taken, sent to kitchen"
  },
  {
    id: 3,
    type: "payment_processing",
    table: "18",
    timestamp: "18:41",
    server: "Emma Davis",
    guests: 6,
    amount: 245.80,
    details: "Processing credit card payment"
  },
  {
    id: 4,
    type: "table_cleaning",
    table: "5",
    timestamp: "18:39",
    server: "Cleaning Staff",
    details: "Table being prepared for next guests"
  }
]

export const LIVE_FINANCIAL_STREAM = [
  {
    id: 1,
    type: "sale",
    amount: 89.50,
    table: "12",
    timestamp: "18:45",
    paymentMethod: "Credit Card",
    server: "Emma Davis"
  },
  {
    id: 2,
    type: "sale",
    amount: 156.75,
    table: "8",
    timestamp: "18:42",
    paymentMethod: "Cash",
    server: "Tom Wilson"
  },
  {
    id: 3,
    type: "milestone",
    amount: 5000.00,
    timestamp: "18:40",
    details: "Daily revenue milestone reached"
  },
  {
    id: 4,
    type: "refund",
    amount: -25.00,
    table: "15",
    timestamp: "18:38",
    reason: "Item not available",
    server: "Emma Davis"
  }
]

export const LIVE_ALERTS = [
  {
    id: 1,
    type: "critical",
    title: "Kitchen Equipment Alert",
    message: "Grill #2 temperature running high - needs attention",
    timestamp: "18:44",
    acknowledged: false,
    category: "equipment"
  },
  {
    id: 2,
    type: "warning",
    title: "Long Wait Time",
    message: "Table 12 has been waiting 45+ minutes for food",
    timestamp: "18:43",
    acknowledged: false,
    category: "service"
  },
  {
    id: 3,
    type: "info",
    title: "Inventory Alert",
    message: "Wagyu beef stock running low (8 portions remaining)",
    timestamp: "18:40",
    acknowledged: true,
    category: "inventory"
  },
  {
    id: 4,
    type: "critical",
    title: "Staff Alert",
    message: "Server called in sick - dining room understaffed",
    timestamp: "18:35",
    acknowledged: false,
    category: "staff"
  }
]

export const LIVE_METRICS = {
  currentRevenue: 4567.89,
  ordersToday: 87,
  avgWaitTime: 22,
  tableOccupancy: 72,
  kitchenEfficiency: 94,
  customerSatisfaction: 4.8,
  staffPerformance: 89
}

export const CAMERA_FEEDS = [
  {
    id: "kitchen-main",
    name: "Kitchen - Main Station",
    status: "active",
    location: "Kitchen",
    description: "Main cooking station and grill area"
  },
  {
    id: "kitchen-prep",
    name: "Kitchen - Prep Area",
    status: "active", 
    location: "Kitchen",
    description: "Food preparation and plating station"
  },
  {
    id: "dining-overview",
    name: "Dining Room - Overview",
    status: "active",
    location: "Dining Room",
    description: "General dining area and customer tables"
  },
  {
    id: "entrance-lobby",
    name: "Entrance & Waiting Area",
    status: "active",
    location: "Entrance",
    description: "Front entrance and customer waiting area"
  },
  {
    id: "bar-area",
    name: "Bar & Lounge",
    status: "maintenance",
    location: "Bar",
    description: "Bar counter and lounge seating area"
  }
]