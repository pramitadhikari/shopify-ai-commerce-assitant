import fetch from "node-fetch";

export async function fetchRecentOrdersFromShopify({ shop, accessToken, limit = 20 }) {
  // Minimal GraphQL query; adjust fields as needed
  const query = `
    query RecentOrders($first: Int!) {
      orders(first: $first, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet { shopMoney { amount currencyCode } }
            email
            tags
            shippingAddress { city country }
            discountCodes
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  vendor
                  originalUnitPriceSet { shopMoney { amount currencyCode } }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables: { first: limit } })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify GraphQL failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const edges = data?.data?.orders?.edges ?? [];

  return edges.map(({ node }) => {
    const amount = Number(node.totalPriceSet?.shopMoney?.amount ?? 0);
    const currency = node.totalPriceSet?.shopMoney?.currencyCode ?? "USD";

    return {
      id: node.id,               // global ID
      name: node.name,
      created_at: node.createdAt,
      total_price: amount,
      currency,
      customer_email: node.email,
      tags: node.tags,
      shipping_city: node.shippingAddress?.city ?? null,
      shipping_country: node.shippingAddress?.country ?? null,
      discount_codes: node.discountCodes ?? [],
      line_items: (node.lineItems?.edges ?? []).map(e => ({
        title: e.node.title,
        quantity: e.node.quantity,
        vendor: e.node.vendor,
        price: Number(e.node.originalUnitPriceSet?.shopMoney?.amount ?? 0),
        currency: e.node.originalUnitPriceSet?.shopMoney?.currencyCode ?? currency
      }))
    };
  });
}