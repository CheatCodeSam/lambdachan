import crypto from "node:crypto"

export const generateTripCode = (username: string, password: string) => {
  const salt = "a_unique_salt_value"
  const hash = crypto
    .createHmac("sha256", salt)
    .update(username + password)
    .digest("hex")
  const numericHash = BigInt("0x" + hash)
    .toString()
    .replace(/\D/g, "")
  const fixedLengthHash = numericHash.substring(0, 60)
  return `${username}!!${fixedLengthHash}`
}
