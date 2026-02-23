export const sampleOrders = [
  {
    id: "1001",
    created_at: "2026-02-01T10:15:00Z",
    total_price: 129.99,
    currency: "USD",
    customer_email: "alex@example.com",
    line_items: [
      { title: "Running Shoes", quantity: 1, price: 99.99, vendor: "Acme" },
      { title: "Socks Pack", quantity: 1, price: 30.0, vendor: "Acme" }
    ],
    tags: ["new_customer"],
    shipping_city: "Irvine",
    discount_codes: [{ code: "WELCOME10", amount: 10.0 }]
  },
  {
    id: "1002",
    created_at: "2026-02-02T18:40:00Z",
    total_price: 59.99,
    currency: "USD",
    customer_email: "jamie@example.com",
    line_items: [
      { title: "Yoga Mat", quantity: 1, price: 59.99, vendor: "ZenCo" }
    ],
    tags: ["repeat_customer"],
    shipping_city: "Seattle",
    discount_codes: []
  },
  {
    id: "1003",
    created_at: "2026-02-04T09:05:00Z",
    total_price: 199.0,
    currency: "USD",
    customer_email: "taylor@example.com",
    line_items: [
      { title: "Winter Jacket", quantity: 1, price: 199.0, vendor: "NorthPro" }
    ],
    tags: ["return_risk"],
    shipping_city: "Denver",
    discount_codes: [{ code: "WINTER15", amount: 15.0 }]
  }
];