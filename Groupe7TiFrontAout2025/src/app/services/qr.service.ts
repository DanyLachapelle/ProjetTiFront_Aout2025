import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

export interface QRToken {
  token: string
  expiresAt: Date
  isValid: boolean
  createdAt: Date
}

@Injectable({
  providedIn: "root",
})
export class QrService {
  private currentTokenSubject = new BehaviorSubject<QRToken | null>(null)
  public currentToken$ = this.currentTokenSubject.asObservable()

  constructor() {}

  generateToken(): QRToken {
    const token = this.createSecureToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes from now

    const qrToken: QRToken = {
      token,
      expiresAt,
      isValid: true,
      createdAt: now,
    }

    this.currentTokenSubject.next(qrToken)
    return qrToken
  }

  validateToken(token: string): boolean {
    const currentToken = this.currentTokenSubject.value

    if (!currentToken || currentToken.token !== token) {
      return false
    }

    const now = new Date()
    if (now > currentToken.expiresAt) {
      this.invalidateCurrentToken()
      return false
    }

    return currentToken.isValid
  }

  getCurrentToken(): QRToken | null {
    return this.currentTokenSubject.value
  }

  invalidateCurrentToken(): void {
    const currentToken = this.currentTokenSubject.value
    if (currentToken) {
      currentToken.isValid = false
      localStorage.removeItem('qrToken');
    }
  }

  isTokenExpired(token: QRToken): boolean {
    const now = new Date()
    return now > token.expiresAt
  }

  getTokenTimeRemaining(token: QRToken): number {
    const now = new Date()
    const remaining = token.expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.floor(remaining / 1000)) // Return seconds remaining
  }

  private createSecureToken(): string {
    // In a real implementation, this would be generated server-side with proper JWT signing
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 15)
    const additionalRandom = Math.random().toString(36).substring(2, 15)

    return `mocktail_${timestamp}_${randomPart}_${additionalRandom}`
  }

  // Method to simulate server-side token validation
  validateTokenWithServer(token: string): Observable<boolean> {
    // This would make an HTTP call to your ASP.NET Core API
    // For now, we'll use local validation
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(this.validateToken(token))
        observer.complete()
      }, 500) // Simulate network delay
    })
  }

  saveTokenToLocal(): void {
    const currentToken = this.currentTokenSubject.value;
    if (currentToken) {
      localStorage.setItem('qrToken', JSON.stringify(currentToken));
    }
  }
}
