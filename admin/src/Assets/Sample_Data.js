export const incomingOrders = [
  {
    name: "John Doe",
    email: "john@example.com",
    items: [
      {
        jigId: "JIG1",
        quantity: 2,
        price: 5,
        color: "Red",
      },
    ],
  },
  {
    name: "Sarah Lee",
    email: "sarah@example.com",
    items: [
      {
        jigId: "JIG2",
        quantity: 1,
        price: 5,
        color: "Black",
      },
      {
        jigId: "JIG2",
        quantity: 3,
        price: 10,
        color: "Blue",
      },
    ],
  },
];

export const finishedOrders = [
  {
    name: "Mike Chen",
    email: "mike@example.com",
    items: [
      {
        jigId: "JIG4",
        quantity: 1,
        price: 5,
        color: "Green",
      },
    ],
  },
];

export const missingStock = [
  { jigId: "JIG1", status: "Out of stock" },
  { jigId: "JIG5", status: "Out of stock" },
];

export const lowStock = [
  { jigId: "JIG2", remaining: 3 },
  { jigId: "JIG3", remaining: 5 },
];

export const bestSellers = ["JIG1", "JIG4"];
export const hotSellers = ["JIG2", "JIG3"];