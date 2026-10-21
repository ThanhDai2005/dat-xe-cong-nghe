/**
 * Script tạo cặp khóa RS256 (Private + Public Key).
 * Chạy 1 lần duy nhất, copy output vào file be/src/.env
 
 * Lệnh: node scripts/generateKeys.js
 */

const crypto = require("crypto");

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding:  { type: "spki",   format: "pem" },
  privateKeyEncoding: { type: "pkcs8",  format: "pem" },
});

// Encode sang 1 dòng để dễ dán vào be/src/.env
const encode = (key) => key.replace(/\n/g, "\\n");

console.log("\n✅ Cặp khóa RS256 đã tạo xong! Copy 2 dòng dưới vào file be/src/.env:\n");
console.log("─".repeat(70));
console.log(`JWT_PRIVATE_KEY="${encode(privateKey)}"`);
console.log(`JWT_PUBLIC_KEY="${encode(publicKey)}"`);
console.log("─".repeat(70));
console.log("\n⚠️  KHÔNG commit JWT_PRIVATE_KEY lên Git!\n");
