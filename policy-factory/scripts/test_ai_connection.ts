
import ai from '../lib/ai';

async function testConnection() {
    console.log("🤖 Testing connection to Local LM Studio...");
    try {
        const completion = await ai.chat.completions.create({
            messages: [{ role: "user", content: "Hello! Are you ready to validate policies?" }],
            model: "local-model", // LM Studio ignores this usually
        });

        console.log("✅ AI Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ Connection Failed:", error);
        console.log("💡 Tip: Ensure LM Studio is running inside the 'Local Server' tab on port 1234.");
    }
}

testConnection();
