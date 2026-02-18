
async function testApi() {
  console.log("🚀 Testing /api/ai endpoint...");
  try {
    const response = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: "Say 'System Operational' if you can hear me.",
        system: "You are a system status bot."
      })
    });

    console.log(`HTTP Status: ${response.status}`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log("✅ API Validation Passed");
    } else {
      console.error("❌ API Validation Failed");
    }
  } catch (error) {
    console.error("❌ Connection Failed:", error);
  }
}

testApi();
