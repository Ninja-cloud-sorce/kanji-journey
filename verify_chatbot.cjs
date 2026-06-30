const assert = require("node:assert");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-only-not-a-secret";

const { requiresContext, getStaticRoute, chatResponseCache } = require("./server/lib/gemini.cjs");

console.log("🚀 STARTING CHATBOT ARCHITECTURE OPTIMIZATION VERIFICATION SUITE\n");

// ----------------------------------------------------
// TEST 1: STATIC ROUTING (STEP 6)
// ----------------------------------------------------
console.log("Testing Step 6: Tool/Static Routing...");

const jlptReply = getStaticRoute("When is the next closest JLPT exam?");
assert.ok(jlptReply && jlptReply.includes("first Sunday of July"), "JLPT schedule routing failed");
console.log(" ✅ JLPT Exam Date correctly intercepted and routed.");

const bookReply = getStaticRoute("Which books and grammar resources should I refer to?");
assert.ok(bookReply && bookReply.includes("Genki"), "Book recommendations routing failed");
console.log(" ✅ Book Recommendations correctly intercepted and routed.");

const srsReply = getStaticRoute("how does the SRS flashcard system work?");
assert.ok(srsReply && srsReply.includes("Spaced Repetition"), "SRS FAQ routing failed");
console.log(" ✅ SRS FAQ correctly intercepted and routed.");

const noStaticReply = getStaticRoute("Tell me a story about Mount Fuji");
assert.equal(noStaticReply, null, "General tutoring query falsely intercepted as static");
console.log(" ✅ General queries correctly bypass static routing.");

// ----------------------------------------------------
// TEST 2: CONTEXT INJECTION TRIGGER (STEP 3)
// ----------------------------------------------------
console.log("\nTesting Step 3: Context Injection Triggers...");

assert.equal(requiresContext("How do I remember kanji?"), false, "General tutoring query falsely required context");
assert.equal(requiresContext("Best way to learn particles?"), false, "General grammar query falsely required context");
console.log(" ✅ General learning queries correctly categorized as NO CONTEXT needed.");

assert.equal(requiresContext("What should I revise based on my weak topics?"), true, "Personalized query missed context trigger");
assert.equal(requiresContext("How is my daily streak looking?"), true, "Streak query missed context trigger");
assert.equal(requiresContext("What was my readiness score again?"), true, "Readiness score query missed context trigger");
console.log(" ✅ Personalized queries successfully detected and trigger context injection.");

// ----------------------------------------------------
// TEST 3: RESPONSE CACHE (STEP 5)
// ----------------------------------------------------
console.log("\nTesting Step 5: Response Cache System...");

chatResponseCache.clear();
assert.equal(chatResponseCache.get("hello"), null, "Cache not clear initially");

chatResponseCache.set("hello", "Konnichiwa!");
assert.equal(chatResponseCache.get("hello"), "Konnichiwa!", "Cache retrieve failed");

// Test TTL / Expirations
const quickCache = new (require("/Users/praful/kanji-journey/server/lib/gemini.cjs").SimpleCache)(10, 2); // 10ms TTL, max size 2
quickCache.set("test-key", "expired-val");
assert.equal(quickCache.get("test-key"), "expired-val");

setTimeout(() => {
  assert.equal(quickCache.get("test-key"), null, "TTL Cache eviction failed after expiry");
  console.log(" ✅ Cache TTL expiration works perfectly.");

  // Test Eviction policy
  quickCache.set("key1", "val1");
  quickCache.set("key2", "val2");
  quickCache.set("key3", "val3"); // evicts key1 because max size is 2
  assert.equal(quickCache.get("key1"), null, "LRU Eviction failed to remove oldest key");
  assert.equal(quickCache.get("key2"), "val2", "Eviction removed wrong key");
  assert.equal(quickCache.get("key3"), "val3", "Eviction failed for third key");
  console.log(" ✅ Cache size limitation and eviction works perfectly.");
  console.log("\n🎉 ALL UNIT ASSERTS PASSED! Chatbot optimized architecture is fully sound and functional!");
}, 20);
