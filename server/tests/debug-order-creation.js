// Debug: POST /api/orders agregado (cabeçalho + items em uma transação).
// Uso: npm run debug:order  (Express em API_BASE_URL, ex. :3001)

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

async function debugOrderCreation() {
  console.log("🔍 POST /api/orders com items (transação única)\n");
  console.log(`   → ${API_BASE_URL}/api/orders\n`);

  const orderData = {
    name: "John",
    lastname: "Doe",
    email: "debug.test@example.com",
    phone: "+1-555-123-4567",
    company: "Test Company Inc",
    adress: "123 Main Street",
    apartment: "Apt 4B",
    city: "New York",
    country: "United States",
    postalCode: "10001",
    total: 9999,
    status: "pending",
    orderNotice: "Debug test order",
    items: [{ productId: "10", quantity: 3 }],
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (!res.ok) {
      console.log("❌ Falha:", res.status, data);
      process.exitCode = 1;
      return;
    }
    console.log("✅ Pedido criado:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("❌ Erro de rede ou servidor:", err?.message || err);
    process.exitCode = 1;
  }
}

debugOrderCreation();
