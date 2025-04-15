import { env } from "@/data/env/server"
import { Cookies } from "../session"
import { z } from "zod"
import crypto from "crypto"
import { OAuthProvider } from "@/app/db/schema"
import { createDiscordOAuthClient } from "./discord"
import { createGithubOAuthClient } from "./github"
import { createGoogleOAuthClient } from "./google"

// Constants for cookies and expiration times
const STATE_COOKIE_KEY = "oAuthState"
const CODE_VERIFIER_COOKIE_KEY = "oAuthCodeVerifier"
const COOKIE_EXPIRATION_SECONDS = 60 * 10 

// OAuthClient Class to handle the OAuth flow
export class OAuthClient<T> {
  private readonly provider: OAuthProvider
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly scopes: string[]
  private readonly urls: {
    auth: string
    token: string
    user: string
  }
  private readonly userInfo: {
    schema: z.ZodSchema<T>
    parser: (data: T) => { id: string; email: string; name: string, image?: string  }
  }
  private readonly tokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
  })

  constructor({
    provider,
    clientId,
    clientSecret,
    scopes,
    urls,
    userInfo,
  }: {
    provider: OAuthProvider
    clientId: string
    clientSecret: string
    scopes: string[]
    urls: {
      auth: string
      token: string
      user: string
    }
    userInfo: {
      schema: z.ZodSchema<T>
      parser: (data: T) => { id: string; email: string; name: string, image?: string  }
    }
  }) {
    this.provider = provider
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.scopes = scopes
    this.urls = urls
    this.userInfo = userInfo
  }

  private get redirectUrl() {
    return new URL(this.provider, env.OAUTH_REDIRECT_URL_BASE)
  }

  // Generates the authorization URL
  createAuthUrl(cookies: Pick<Cookies, "set">) {
    const state = this.createState(cookies)
    const codeVerifier = this.createCodeVerifier(cookies)
    const url = new URL(this.urls.auth)
    url.searchParams.set("client_id", this.clientId)
    url.searchParams.set("redirect_uri", this.redirectUrl.toString())
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", this.scopes.join(" "))
    url.searchParams.set("state", state)
    url.searchParams.set("code_challenge_method", "S256")
    url.searchParams.set(
      "code_challenge",
      crypto.createHash("sha256").update(codeVerifier).digest("base64url")
    )
    return url.toString()
  }

  // Fetch user information from the OAuth provider
  async fetchUser(code: string, state: string, cookies: Pick<Cookies, "get">) {
    const isValidState = await this.validateState(state, cookies)
    if (!isValidState) throw new InvalidStateError()

    const { accessToken, tokenType } = await this.fetchToken(code, this.getCodeVerifier(cookies))

    const user = await fetch(this.urls.user, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((rawData) => {
        const { data, success, error } = this.userInfo.schema.safeParse(rawData)
        if (!success) throw new InvalidUserError(error)
        return data
      })

    return this.userInfo.parser(user)
  }

  // Exchange the authorization code for a token
  private async fetchToken(code: string, codeVerifier: string) {
    const response = await fetch(this.urls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: this.redirectUrl.toString(),
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: codeVerifier,
      }),
    })
    const rawData = await response.json()
    const { data, success, error } = this.tokenSchema.safeParse(rawData)
    if (!success) throw new InvalidTokenError(error)

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
    }
  }

  // Create a random state and set it in cookies for CSRF protection
  private createState(cookies: Pick<Cookies, "set">) {
    const state = crypto.randomBytes(64).toString("hex").normalize()
    this.setCookie(STATE_COOKIE_KEY, state, cookies)
    return state
  }

  // Create a random code verifier and set it in cookies for PKCE
  private createCodeVerifier(cookies: Pick<Cookies, "set">) {
    const codeVerifier = crypto.randomBytes(64).toString("hex").normalize()
    this.setCookie(CODE_VERIFIER_COOKIE_KEY, codeVerifier, cookies)
    return codeVerifier
  }

  // Set cookies with the given key, value, and options
  private setCookie(key: string, value: string, cookies: Pick<Cookies, "set">) {
    cookies.set(key, value, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: Date.now() + COOKIE_EXPIRATION_SECONDS * 1000,
    })
  }

  // Validate the state received from the OAuth provider
  private async validateState(state: string, cookies: Pick<Cookies, "get">) {
    const cookieState = cookies.get(STATE_COOKIE_KEY)?.value
    console.log('All cookies:', cookies);
  console.log('State from OAuth provider:', state);
  console.log('State from cookie:', cookieState);
    return cookieState === state
  }

  // Retrieve the code verifier from cookies
  private getCodeVerifier(cookies: Pick<Cookies, "get">) {
    const codeVerifier = cookies.get(CODE_VERIFIER_COOKIE_KEY)?.value
    if (codeVerifier == null) throw new InvalidCodeVerifierError()
    return codeVerifier
  }
}

// Function to return the correct OAuth client based on the provider
export function getOAuthClient(provider: OAuthProvider) {
  switch (provider) {
    case "discord":
      return createDiscordOAuthClient()
    case "github":
      return createGithubOAuthClient()
    case "google":
      return createGoogleOAuthClient()
    default:
      throw new Error(`Invalid provider: ${provider}`)
  }
}

// Custom Error classes for handling different OAuth errors
class InvalidTokenError extends Error {
  constructor(zodError: z.ZodError) {
    super("Invalid Token")
    this.cause = zodError
  }
}

class InvalidUserError extends Error {
  constructor(zodError: z.ZodError) {
    super("Invalid User")
    this.cause = zodError
  }
}

class InvalidStateError extends Error {
  constructor() {
    super("Invalid State - The state parameter does not match the expected value.")
  }
}

class InvalidCodeVerifierError extends Error {
  constructor() {
    super("Invalid Code Verifier - The code verifier doesn't match the stored value.")
  }
}
