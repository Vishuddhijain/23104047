# Stage 1

## Objective

Build a Priority Inbox that always displays the top **n** most important unread notifications first, where priority is determined by a combination of **type weight** and **recency (timestamp)**.

---

## Priority Logic

| Notification Type | Weight |
| ----------------- | ------ |
| Placement         | 3      |
| Result            | 2      |
| Event             | 1      |

Placement notifications are the most critical (job opportunities), followed by Results (academic outcomes), and then Events (general campus activities).

If two notifications share the same type weight, the one with the **more recent timestamp** is ranked higher.

---

## Approach

### Step 1 — Fetch Notifications

Notifications are fetched from the provided Notification API using a GET request with a Bearer token for authentication. No database storage is used; all data is held in memory (frontend state).

### Step 2 — Assign Priority Score

Each notification is assigned a composite score:

```
Priority Score = TypeWeight + (Timestamp in ms / 1e12)
```

The timestamp component is scaled down so that **type weight always dominates**, but recency correctly breaks ties between notifications of the same type.

### Step 3 — Sort and Slice Top N

```javascript
const priorityOrder = { Placement: 3, Result: 2, Event: 1 };

function getPriorityScore(notification) {
  const weight = priorityOrder[notification.Type] ?? 0;
  const recency = new Date(notification.Timestamp).getTime() / 1e12;
  return weight + recency;
}

function getTopN(notifications, n) {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, n);
}
```

This returns the top **n** notifications in O(n log n) time.

---

## Data Structures Used

### Array

All notifications are stored in a plain array in frontend state. Sorting and slicing is performed on every render or refresh cycle.

### Object Map (Hash Map)

Type weights are stored in a JavaScript object for **O(1)** priority lookup:

```javascript
const priorityOrder = { Placement: 3, Result: 2, Event: 1 };
```

---

## Time Complexity

| Operation        | Complexity |
| ---------------- | ---------- |
| Fetching n items | O(n)       |
| Priority lookup  | O(1)       |
| Sorting          | O(n log n) |
| Slicing top N    | O(N)       |

Overall: **O(n log n)** per refresh cycle.

---

## Maintaining Top N Efficiently as New Notifications Arrive

The current approach re-sorts all notifications on each fetch. This works for moderate volumes, but as notifications keep arriving continuously, a more efficient approach is needed.

### Proposed Optimisation: Min-Heap of Size N

A **min-heap (priority queue) of fixed size N** can maintain the top N notifications without sorting the entire dataset repeatedly.

**Algorithm:**

1. Initialise an empty min-heap of capacity N.
2. For each incoming notification:
   - Compute its priority score.
   - If the heap has fewer than N items → push directly.
   - Else if the new score > heap's minimum → pop the minimum and push the new notification.
   - Otherwise → discard the notification.
3. The heap always contains the top N notifications.

**Complexity:**

| Operation per new notification | Complexity |
| ------------------------------ | ---------- |
| Score computation              | O(1)       |
| Heap push / pop                | O(log N)   |
| Read top N                     | O(N)       |

This reduces the per-update cost from **O(n log n)** to **O(log N)**, which is significantly more efficient for high-frequency notification streams.

### Why This Matters

The task specifies that **new notifications will keep coming in**. A min-heap ensures the system stays responsive and memory-efficient regardless of how large the total notification pool grows, since only N items are ever held in the heap at once.

---

## Output

The top N notifications are displayed in the UI sorted by priority. The value of N is configurable by the user (e.g. top 10, 15, 20). Screenshots of the output are included in the repository alongside this file.
