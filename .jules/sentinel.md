# Sentinel's Journal

## 2025-02-23 - Hardcoded Default APIs and Missing Input Sanitization
**Vulnerability:** The `EdgeWARNAPI` client in `src/utils/edgewarn-api.ts` constructs URLs by directly appending parameters (like `timestamp`) without encoding, leading to potential parameter injection if the input is malicious.
**Learning:** While the inputs (timestamps, cell IDs) are often seemingly safe or come from other API calls, assuming they are safe without validation or encoding is a security anti-pattern.
**Prevention:** Always use `encodeURIComponent` when constructing query strings, even for internal or expected-safe data.
