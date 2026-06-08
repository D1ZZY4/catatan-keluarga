---
name: Onboarding biometric redirect fix
description: How to show a post-setup biometric step without being redirected by the auth state change
---

## The Problem
OnboardingPage has an early guard: `if (state.status === "unlocked") return <Navigate to="/" />`.
When `completeOnboarding()` resolves, auth state becomes "unlocked" and React navigates away BEFORE any state set after the await can render — including the biometric setup step.

## The Fix
Lift a `showBiometric` boolean state to the parent (OnboardingPage level).
Change the guard to: `if (state.status === "unlocked" && !showBiometric) return <Navigate />`.
Call `setShowBiometric(true)` (via `onShowBiometric` callback prop) BEFORE the `await completeOnboarding(...)` call.
This ensures: on the next render tick when auth state flips to "unlocked", `showBiometric` is already `true`, blocking the redirect.

**Why:**
React state updates are synchronous in terms of being enqueued. Calling `setShowBiometric(true)` before an `await` guarantees it is batched into the render before the auth state changes from the awaited promise.

**How to apply:**
Any time you need to show a post-async-state-change UI (biometric, confirmation, etc.) before a navigation guard fires: set the blocking flag synchronously before the async call that triggers the guard.
