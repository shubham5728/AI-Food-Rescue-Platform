"use client";

/**
 * Thin fetch wrapper shared by every client action. It normalises the API's
 * error envelope so components can surface a real message instead of a generic
 * failure, and never throws a bare `TypeError` at the UI on a network drop.
 */

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "RequestError";
  }
}

export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new RequestError(
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  const text = await response.text();
  const body = text ? (JSON.parse(text) as T & ApiError) : ({} as T & ApiError);

  if (!response.ok) {
    throw new RequestError(
      body.error || "Something went wrong. Please try again.",
      response.status,
      body.fields,
    );
  }

  return body as T;
}
