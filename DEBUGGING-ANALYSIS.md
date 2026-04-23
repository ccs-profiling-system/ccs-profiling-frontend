# Root Cause Analysis: TypeError: schedules.map is not a function

## Problem Summary
The error occurs because `schedules` is not an array when `.map()` or `.filter()` is called on it.

## Root Causes (in order of likelihood)

### 1. **Unvalidated Prop in SchedulingAside** ⚠️ PRIMARY CAUSE
**Location:** `src/features/admin/scheduling/SchedulingAside.tsx` lines 56-72

**What's happening:**
```typescript
// SchedulingAside receives schedules as a prop
const todaySchedules = useMemo(
  () =>
    schedules  // ← No type check! Could be undefined, null, or an object
      .filter((s) => isToday(s.startTime))
      .sort(...)
  [schedules]
);
```

**Why it fails:**
- The component expects `schedules: Schedule[]` but doesn't validate it
- If the parent passes `undefined`, `null`, or an object, `.filter()` will fail
- TypeScript types are stripped at runtime - they don't prevent this

### 2. **Asynchronous Data Loading Race Condition**
**Timeline:**
1. Component mounts → `schedules = []` (initial state)
2. `useEffect` triggers `fetchSchedules()`
3. **Meanwhile:** Component renders with `schedules = []` ✓ (works)
4. API call completes → `setSchedules(data)` 
5. **But if data is not an array:** `schedules = { data: [...] }` ✗ (fails)

**Why this happens:**
- The API response might be wrapped: `{ success: true, data: [...] }`
- If `getSchedules()` returns the wrong structure, `setSchedules()` receives an object
- The component re-renders with a non-array value

### 3. **Type Mismatch in useSchedules Hook**
**Location:** `src/features/admin/scheduling/useSchedules.ts`

**Potential issue:**
```typescript
const data = await getSchedules(params);
setSchedules(Array.isArray(data) ? data : []); // ← This should work
```

**But if `getSchedules()` returns:**
- `undefined` → becomes `[]` ✓
- `null` → becomes `[]` ✓
- `{ data: [...] }` → becomes `[]` ✗ (loses data!)
- `[...]` → stays as `[...]` ✓

## Why It Happens on Refresh

**Initial Load:**
1. Component mounts
2. `schedules = []` (empty array from useState)
3. `useMemo` runs → `[].filter()` works ✓
4. Page renders blank (no data yet)

**After Refresh:**
1. Browser cache clears
2. Component mounts fresh
3. `fetchSchedules()` called
4. **If API returns wrapped response:** `setSchedules({ data: [...] })`
5. Component re-renders with `schedules = { data: [...] }`
6. `useMemo` runs → `{ data: [...] }.filter()` fails ✗

## The Real Issue

The problem is **defensive coding is incomplete**:

✓ SchedulingPage has checks: `Array.isArray(schedules) ? schedules : []`
✗ SchedulingAside has NO checks: `schedules.filter(...)` directly

**Why this matters:**
- SchedulingPage is protected
- SchedulingAside receives the same prop but doesn't validate it
- One component crashes while the other is safe

## Solution Strategy

### Level 1: Immediate Fix (Defensive Coding)
Add type validation in SchedulingAside:
```typescript
const todaySchedules = useMemo(
  () => {
    if (!Array.isArray(schedules)) return [];
    return schedules
      .filter((s) => isToday(s.startTime))
      .sort(...)
  },
  [schedules]
);
```

### Level 2: Root Cause Fix (Data Normalization)
Ensure `getSchedules()` ALWAYS returns an array:
```typescript
export async function getSchedules(...): Promise<Schedule[]> {
  try {
    const response = await axios.get(BASE_URL, { params });
    const data = response.data;
    
    // Normalize: extract array from any response structure
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.schedules && Array.isArray(data.schedules)) return data.schedules;
    
    return []; // Fallback
  } catch (error) {
    return mockSchedules; // Fallback
  }
}
```

### Level 3: Type Safety (TypeScript)
Use stricter types:
```typescript
interface SchedulingAsideProps {
  schedules: Schedule[] | undefined; // Explicit about possibility
  loading: boolean;
}

export function SchedulingAside({ schedules = [], loading }: SchedulingAsideProps) {
  // Now schedules is guaranteed to be an array
}
```

## Best Practices to Prevent This

1. **Always validate external data:**
   ```typescript
   const isValidArray = (value: unknown): value is any[] => Array.isArray(value);
   ```

2. **Use type guards:**
   ```typescript
   if (!isValidArray(schedules)) {
     console.error('Expected array, got:', typeof schedules);
     return null;
   }
   ```

3. **Normalize API responses early:**
   - Do it in the service layer, not in components
   - Components should assume data is always in the expected format

4. **Test edge cases:**
   - Empty array: `[]`
   - Undefined: `undefined`
   - Null: `null`
   - Wrong type: `{}`, `"string"`, `123`

5. **Use optional chaining carefully:**
   ```typescript
   // ✗ Bad: Still crashes if schedules is not an array
   schedules?.map(...)
   
   // ✓ Good: Checks type first
   Array.isArray(schedules) && schedules.map(...)
   ```

## Summary

| Cause | Location | Fix |
|-------|----------|-----|
| No validation in SchedulingAside | Component prop usage | Add `Array.isArray()` check |
| API response not normalized | schedulesService.ts | Ensure always returns array |
| Incomplete defensive coding | SchedulingAside.tsx | Validate all array operations |

