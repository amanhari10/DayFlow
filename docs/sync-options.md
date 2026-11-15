# DayFlow sync storage options

DayFlow currently stores records and attachments in the browser's IndexedDB. Cross-device sync requires storing or relaying data somewhere; a "login-only" service cannot synchronize records without a data path.

## Options

| Approach | Data flow | Privacy | Offline and conflicts | Likely costs |
| --- | --- | --- | --- | --- |
| User-owned cloud storage (for example, Google Drive or OneDrive) | The browser authenticates with the chosen provider and uploads/downloads a DayFlow backup or sync document. | The provider stores the user's content. Client-side encryption can reduce provider access, but requires careful key creation, recovery, and sharing across devices. OAuth scopes and token handling must be reviewed. | Local IndexedDB remains usable offline; changes queue until online. Sync needs versioning and conflict resolution, such as per-record timestamps plus explicit conflict copies. | Usually no separate DayFlow storage bill within the user's provider quota. Hosting, OAuth verification, and support still have costs. |
| DayFlow-managed backend | The app authenticates users and sends records to DayFlow-operated databases and object storage. | DayFlow controls the storage and is responsible for access controls, encryption, retention, backups, incident response, and privacy disclosures. | Local edits can queue offline. A server-authoritative revision model or per-record conflict copies are needed for simultaneous edits. | Ongoing hosting, database, storage, bandwidth, monitoring, and security costs; free tiers can change or be exceeded. |
| Temporary relay between devices | A source device sends data through a short-lived relay or transfer session to a destination device. | A relay can still observe data unless the transfer is end-to-end encrypted. Session expiry, abuse prevention, and secure pairing are required. | Both devices must be online for transfer. This is a one-time copy, not continuous sync; concurrent edits need a later merge/import step. | Potentially low for small transfers, but relay bandwidth, hosting, and abuse controls are not guaranteed to remain free. |

## Recommendation and approval gate

Evaluate user-owned provider storage first if avoiding a DayFlow-held content database is the priority. It still means the provider stores the content, and it requires an explicit encryption, recovery, OAuth-scope, and conflict strategy. If neither Google Drive nor OneDrive is acceptable, a manual encrypted export/import workflow is safer and simpler than pretending login alone can sync data.

No authentication, cloud storage, relay, deployment, or paid resource should be implemented until the owner selects and approves a storage approach. Google Drive versus OneDrive and the encryption/key-recovery model remain undecided.
