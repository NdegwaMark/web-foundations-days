# SnapShare Photo-App Scaling Plan

## 1. Assumptions & Daily Active Users (DAU)
*   **Total Registered Users:** 10,000,000
*   **Daily Active Users (DAU):** 10% of 10,000,000 = **1,000,000 DAU**
*   **Daily Uploads:** 1 upload per active user = **1,000,000 uploads/day**
*   **Daily Feed Views:** 50 feed views per active user = **50,000,000 views/day**
*   **Average Photo Size:** 2 MB
*   **Thumbnail Size:** 50 KB

---

## 2. Scale & Storage Calculations
*   **Uploads per Second (Average):** 1,000,000 uploads / 86,400 seconds ≈ **11.57 uploads/sec**
*   **Uploads per Second (Peak - 5x):** 11.57 * 5 ≈ **57.85 uploads/sec**
*   **Feed Views per Second (Average):** 50,000,000 views / 86,400 seconds ≈ **578.70 views/sec**
*   **Feed Views per Second (Peak - 5x):** 578.70 * 5 ≈ **2,893.50 views/sec**
*   **Photo Storage per Year:** 
    *   Storage per image (Raw + Thumbnail) = 2.05 MB
    *   Daily Storage = 1,000,000 * 2.05 MB = 2,050,000 MB (≈ 2.05 TB/day)
    *   Yearly Storage = 2.05 TB * 365 days ≈ **748.25 TB/year**

---

## 3. System Load Characteristics
The system is overwhelmingly **read-heavy**. With **50,000,000 feed views** compared to **1,000,000 uploads** per day, the read-to-write ratio is **50:1**. 

### Design Implications:
To support this distribution, the design must prioritize heavy application caching layers (like Redis) to serve feeds instantly and utilize database read replicas to prevent read queries from choking the primary transactional database.

---

## 4. Storage Strategy
Photos **should not be stored inside the database** as BLOBs because large binary files bloat database indexes, dramatically slow down backups, degrade query performance, and make database scaling incredibly expensive. 

Instead, photos must be stored in an external cloud **Object Storage** service (such as AWS S3 or Google Cloud Storage). The database should only store lightweight metadata text strings containing the URLs pointing to those external files.

---

## 5. Architecture Diagram

```text
                  [ User / Client Browser ]
                     │                 ▲
       Upload/Read   │                 │ Cached Static Images
       (Cache Miss)  ▼                 │ & Thumbnails
               ┌───────────┐     ┌───────────┐
               │    LB     │     │    CDN    │
               └─────┬─────┘     └─────▲─────┘
                     │                 │
                     ▼                 │ Fetches Assets
               ┌───────────┐           │
               │App Servers├───────────┤
               └─────┬─────┘           │
                     │                 │
        ┌────────────┴────────────┐    │
        ▼                         ▼    │
  ┌───────────┐             ┌──────────┴┐
  │Primary DB │             │  Object   │
  │  (Writes) │             │  Storage  │
  └─────┬─────┘             └─────▲─────┘
        │                         │
        ▼ (Replication)           │ Saves Thumbnail
  ┌───────────┐             ┌─────┴─────┐
  │Read Repl. │             │  Worker   │
  │ (Reads)   │             └─────▲─────┘
  └─────▲─────┘                   │
        │                         │ Pulls Job
  ┌─────┴─────┐             ┌─────┴─────┐
  │   Cache   │             │  Message  │
  │  (Redis)  │             │   Queue   │
  └───────────┘             └─────▲─────┘
                                  │
                                  └─ Pushes Job (Async)
```

---

## 6. Component Explanations
*   **CDN:** Delivers images and thumbnails quickly to global users by caching files closer to their physical geographic locations.
*   **Load Balancer (LB):** Distributes incoming user requests evenly across multiple application servers to prevent server overload.
*   **App Servers:** Handles core business logic, authenticates users, routes traffic, and handles database queries.
*   **Cache:** Stores frequently accessed data (like user feeds) in-memory to provide ultra-fast read responses.
*   **Primary Database:** Acts as the single source of truth that safely handles all write activities and metadata updates.
*   **Read Replica:** Clones data from the primary database to exclusively handle high volumes of read-only traffic.
*   **Object Storage:** Securely stores unstructured raw photo binaries and thumbnails with near-infinite scalability.
*   **Message Queue:** Buffers long-running image processing tasks asynchronously so users don't have to wait during uploads.
*   **Worker:** Consumes image jobs from the message queue in the background to automatically crop and resize photos into thumbnails.

---

## 7. Step-by-Step Upload Flow
1. **Upload Request:** The user sends a 2 MB raw photo to the App Server through the Load Balancer.
2. **Raw Storage Save:** The App Server uploads the 2 MB raw binary array straight to Object Storage and receives a storage URL string back.
3. **Primary Record Entry:** The App Server creates a metadata row inside the Primary Database with the User ID, metadata details, and the raw file URL.
4. **Queue Dispatch:** The App Server publishes an asynchronous background message containing the metadata into the Message Queue and immediately tells the user "Upload Success".
5. **Background Generation:** A Worker node pulls the message out of the queue, downloads the raw photo, processes it down to a 50 KB thumbnail, and uploads that thumbnail to Object Storage.
6. **Metadata Finalization:** The Worker updates the Database metadata record with the new thumbnail asset URL link.

---

## 8. Architectural Trade-offs
1. **Asynchronous vs. Synchronous Image Processing:** Handing off thumbnail creation to a background message queue makes the API upload endpoint lightning-fast for the client. The trade-off is **eventual consistency**; the user might load their feed immediately after uploading and see a missing thumbnail placeholder until the worker finishes its job.
2. **Object Storage vs. Local Filesystem Storage:** Storing files in specialized cloud Object Storage provides absolute infrastructure durability and easy CDN attachment without bloating our server disks. The trade-off is an increase in initial **network transfer latency** during uploads since the application server must stream the file to an external cloud endpoint.
