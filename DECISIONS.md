# Design Decisions

## Decision: In-memory store as plain Maps and arrays

**Context:** I needed a data store that multiple services could share without spinning up a real database or pulling in an ORM.

**Options Considered:**
- Option A: Plain JavaScript Maps and arrays exported from a single module
- Option B: A lightweight embedded library like lowdb or a SQLite file via better-sqlite3

**Choice:** Plain Maps and arrays.

**Why:** The assignment explicitly calls for an in-memory store with no external database, so any library would be overhead without benefit. A single `store/index.ts` module that exports `carts`, `orders`, and `discountCodes` is easy to reason about, easy to reset in tests with a single `resetStore()` call, and has zero dependencies. The downside is that state disappears on restart, which is fine here since persistence is not a requirement.

---

## Decision: Track nth-order count by checking orders.length at checkout time

**Context:** I needed to know when the store has processed its nth order so a discount code can be generated.

**Options Considered:**
- Option A: Keep a separate global counter that increments each time an order is placed
- Option B: Derive the count from `orders.length` each time checkout runs

**Choice:** Derive from `orders.length`.

**Why:** A separate counter is just a duplicate of information already in the orders array. Any time they get out of sync (bug, test teardown, future refactor) you get wrong behavior. Checking `orders.length % NTH_ORDER_DISCOUNT === 0` after pushing the new order is a single line and is always correct by construction. The only trade-off is a trivial property access instead of reading a counter variable, which does not matter at this scale.

---

## Decision: Validate the discount code before mutating any state in checkout

**Context:** Checkout needs to validate a discount code, create an order, mark the code as used, and clear the cart. If the code is bad, none of that should happen.

**Options Considered:**
- Option A: Validate the code first, then proceed with all mutations only if validation passes
- Option B: Create the order first, then validate and roll back if the code is invalid

**Choice:** Validate first, mutate nothing until the code clears.

**Why:** Rollback logic is messy and error-prone. With in-memory state there is no transaction support, so a half-applied checkout (order saved, cart not cleared) would leave the store in a broken state. Validating upfront keeps the happy path and the error path completely separate. The code in `checkoutService.ts` reflects this: `validateCode` throws before any array is touched, so a bad code is a clean no-op. The one limitation is that this does not protect against two concurrent requests racing to redeem the same code simultaneously, since there are no locks. For a single-process in-memory store that is acceptable.

---

## Decision: Keep services and routes as separate layers

**Context:** I needed to decide how to split business logic from HTTP handling.

**Options Considered:**
- Option A: Put all logic directly in Express route handlers
- Option B: Route handlers are thin (parse request, call service, send response); all business logic lives in services

**Choice:** Thin routes with a services layer.

**Why:** The unit tests need to call business logic without starting an HTTP server. If the logic lives in route handlers the only way to test it is via supertest or similar, which is slower and tests the wrong thing. With a services layer I can import `cartService` or `checkoutService` directly in tests and call functions with plain arguments. The routes become nearly mechanical: read body, call service, return result. This also makes it straightforward to change the transport layer later without touching any business rules.

---

## Decision: Use a single AppError class to carry HTTP status codes out of services

**Context:** Services throw errors when something goes wrong (product not found, discount code invalid, empty cart). The route layer needs to know what HTTP status to respond with.

**Options Considered:**
- Option A: A custom `AppError` class with a `statusCode` field that the error handler middleware reads
- Option B: Have services return result objects with an `error` field instead of throwing
- Option C: Define specific error subclasses per error type (NotFoundError, ValidationError, etc.)

**Choice:** Single `AppError` class with a status code.

**Why:** Returning error objects from services means every caller has to check the result before proceeding, which makes the happy path harder to follow. Throwing is idiomatic and keeps service functions readable. A full hierarchy of error subclasses is more than needed here: there are only two meaningful states (400 bad input, 404 not found), and the error message already describes what went wrong. The global error handler in `app.ts` catches `AppError` and sends `{ error: message }` with the right status. Anything else becomes a 500.

---

## Decision: Discount codes do not expire

**Context:** I had to decide whether generated discount codes should expire after some time or remain valid indefinitely.

**Options Considered:**
- Option A: Codes are valid until used, no expiry
- Option B: Codes expire after N days or after the next order is placed

**Choice:** Codes are valid until used.

**Why:** The spec says codes are single-use but does not mention expiry. Adding an expiry field and the logic to check it would be extra complexity with no stated requirement driving it. The meaningful invariant is "used once, then gone," which is already enforced. If expiry became a requirement, adding a `createdAt` timestamp and a check in `validateCode` would be a small change. For now, leaving codes open-ended also makes the demo easier to work with since you do not have to race against a timer.

---

## Decision: Manage frontend state with plain React state and no state library

**Context:** The frontend needs to hold products, cart contents, a checkout confirmation, and admin stats. I had to decide whether to reach for a state management library.

**Options Considered:**
- Option A: Plain React `useState` and `useCallback` in `App.tsx`, passing state down as props
- Option B: A lightweight library like Zustand or Jotai for shared state

**Choice:** Plain React state lifted into `App.tsx`.

**Why:** The app has one meaningful view (shop) and one auxiliary view (admin). There is no deep prop drilling, no cross-cutting state that multiple unrelated components need to share simultaneously, and no complex derived state. Adding a store library at this scale would mean learning one more abstraction to read the code without gaining anything. The cart state lives in `App.tsx`, gets passed to the cart and product components as props, and updates after each API call. That is the whole model. If the app grew to multiple routes with shared cart state across pages, reaching for Zustand would make sense.
