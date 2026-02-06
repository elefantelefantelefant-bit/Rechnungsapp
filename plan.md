# Turkey-to-Order Matching Feature — Implementation Plan

## Overview
Add a dedicated "Zuordnung" (Matching) screen accessible from the session detail. Orders are shown as a dashboard with visual status. Tapping an unmatched order opens a modal with available turkeys sorted by best fit. Matched orders can be unmatched.

---

## Step 1: Add repository methods

### `src/db/turkeyRepository.ts` — Add 2 functions:
- **`getUnmatchedTurkeysBySession(sessionId)`** → returns turkeys where `order_id IS NULL`
- **`getTurkeyForOrder(orderId)`** → returns the turkey matched to a specific order

### `src/db/matchingRepository.ts` — New file, 2 functions:
- **`matchTurkeyToOrder(turkeyId, orderId)`** → in a single transaction:
  - `UPDATE turkeys SET order_id = ? WHERE id = ?`
  - `UPDATE orders SET turkey_id = ?, status = 'matched' WHERE id = ?`
- **`unmatchOrder(orderId, turkeyId)`** → in a single transaction:
  - `UPDATE turkeys SET order_id = NULL WHERE id = ?`
  - `UPDATE orders SET turkey_id = NULL, status = 'pending' WHERE id = ?`

## Step 2: Add types

### `src/models/types.ts` — Add:
```ts
export interface OrderWithCustomerAndTurkey extends OrderWithCustomer {
  actual_weight: number | null; // from matched turkey
}
```

## Step 3: Enhance order query

### `src/db/orderRepository.ts` — Add function:
- **`getOrdersWithMatchingInfo(sessionId)`** → LEFT JOIN turkeys to include `actual_weight` for matched orders

## Step 4: Create the Matching Screen

### `app/session/matching/[id].tsx` — New screen

**Layout:**
- Header: session info (date, price) + stats summary (e.g., "3/5 zugeordnet")
- FlatList of orders, each rendered as a **MatchingCard**:
  - **Unmatched orders**: show customer name + target weight, left border orange/red accent
  - **Matched orders**: show customer name + target weight + actual weight + weight diff, left border green accent, checkmark icon
- Tapping an **unmatched** order → opens turkey selection modal
- Tapping a **matched** order → shows assigned turkey info + "Zuordnung aufheben" (unmatch) button

**Turkey Selection Modal:**
- Title: "Truthahn auswählen für [Customer Name]"
- FlatList of available turkeys, sorted by `ABS(actual_weight - target_weight)` ASC
- Each item shows: actual weight, weight difference from target
- Top item (best fit) highlighted with a "Bester Treffer" badge
- Tapping a turkey → calls `matchTurkeyToOrder`, refreshes list, closes modal

**Unmatch Confirmation:**
- Alert dialog: "Zuordnung von [Turkey weight] kg zu [Customer] wirklich aufheben?"
- On confirm → calls `unmatchOrder`, refreshes list

## Step 5: Add navigation button to session detail

### `app/session/[id].tsx` — Add button:
- New "Zuordnung" button next to existing "Wiegen starten" button
- Routes to `/session/matching/${sessionId}`
- Icon: `swap-horizontal` or `link`

## Step 6: Create MatchingCard component

### `src/components/MatchingCard.tsx` — New component
- Props: `order: OrderWithCustomerAndTurkey`, `onPress: () => void`
- Visual states:
  - **Pending**: orange left border, target weight shown, "Offen" chip
  - **Matched**: green left border, both weights shown + difference, "Zugeordnet" chip

---

## Files Changed (Summary)
1. `src/db/turkeyRepository.ts` — add 2 query functions
2. `src/db/matchingRepository.ts` — **new**, match/unmatch logic
3. `src/db/orderRepository.ts` — add 1 query function
4. `src/models/types.ts` — add 1 interface
5. `src/components/MatchingCard.tsx` — **new**, order card with match status
6. `app/session/matching/[id].tsx` — **new**, main matching screen
7. `app/session/[id].tsx` — add navigation button
