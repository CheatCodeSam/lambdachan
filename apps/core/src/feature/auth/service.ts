import crypto from "node:crypto"

export const generateTripCode = (username: string, password: string) => {
  const salt = "a_unique_salt_value"
  const hash = crypto
    .createHmac("sha256", salt)
    .update(username + password)
    .digest("hex")
  return `${username}!!${hash}`
}
