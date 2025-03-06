import crypto from "crypto"

export function hashPassword(password: string, salt: string): Promise<string> {
  console.log("hashPassword called"); // Log function entry
  console.log("Hashing password with salt"); // Inform about the hashing process

  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) {
        console.error("Error hashing password:", error); // Log error in hashing process
        reject(error)
      } else {
        const hashed = hash.toString("hex").normalize();
        console.log("Password hashed successfully"); // Log success
        resolve(hashed)
      }
    })
  })
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: {
  password: string
  salt: string
  hashedPassword: string
}) {
  console.log("comparePasswords called"); // Log function entry
  console.log("Comparing provided password with stored hash"); // Log that comparison is being made

  try {
    const inputHashedPassword = await hashPassword(password, salt)
    console.log("Hashed input password successfully"); // Log success in hashing the input

    const result = crypto.timingSafeEqual(
      Buffer.from(inputHashedPassword, "hex"),
      Buffer.from(hashedPassword, "hex")
    )
    console.log("Password comparison result:", result); // Log the result of the comparison

    return result
  } catch (error) {
    console.error("Error comparing passwords:", error); // Log error in comparison process
    throw error
  }
}

export function generateSalt() {
  console.log("generateSalt called"); // Log function entry
  const salt = crypto.randomBytes(16).toString("hex").normalize()
  console.log("Generated salt:", salt); // Log generated salt (not sensitive since it's random)
  return salt
}
