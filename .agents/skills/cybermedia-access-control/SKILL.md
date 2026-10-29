---
name: cybermedia-access-control
description: >
  Strict Role-Based Access Control (RBAC) and Publication Isolation rules ("No Cross Access")
  for the CyberMedia AI Editorial Copilot. Activate when touching authentication, user roles,
  article permissions, publication filtering, or review workflows.
---

# CyberMedia Access Control & Publication Isolation Protocol

> [!IMPORTANT]
> **GOVERNING PRINCIPLE: NO CROSS ACCESS BETWEEN PUBLICATIONS.**
> Editorial teams belong to distinct publications. A team member assigned to Voice&Data must NEVER see, edit, review, or create articles for Dataquest, CIOL, or PCQuest. All backend queries and frontend switchers must enforce strict publication isolation.

---

## 1. Access Matrix (Sudhesh Sir's Specification)

| Team | Persona & Role | Username | Allowed Publications | Scope & Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Super Admin** | **Sudesh Prasad** (Admin)<br>**Dhaval Gupta** (Admin)<br>**Ritik** (Admin)<br>**Admin** (Admin) | `sudesh`<br>`dhaval`<br>`ritik`<br>`admin` | `["Dataquest", "Voice&Data", "PCQuest", "CIOL"]` | Full oversight across all 4 publications, all articles, review queues, and ASED Executive Monitoring Tool. |
| **📡 Voice&Data** | **Shubhendu Parth** (Editor)<br>**Ayushi S** (Author) | `shubhendup`<br>`ayushis` | `["Voice&Data"]` | **Strictly Voice&Data Only**.<br>• Switcher shows only Voice&Data.<br>• Forbidden from accessing DQ, CIOL, PCQ stories. |
| **📰 Dataquest & CIOL** | **Shrikanth Govindrajan** (Editor)<br>**Deepali Jain** (Author)<br>**Nikitha S** (Author)<br>**Manisha S** (Author)<br>**Preeti A** (Author) | `shrikanthg`<br>`deepalij`<br>`nikithas`<br>`manishas`<br>`preetia` | `["Dataquest", "CIOL"]` | **Strictly Dataquest & CIOL Only**.<br>• Switcher shows only DQ and CIOL.<br>• Forbidden from accessing V&D or PCQ. |
| **💻 PCQ (PCQuest)** | **Ashok Pandey** (Editor)<br>**Neha Joshi** (Author)<br>**Harsh Sharma** (Author)<br>**Amay S** (Author)<br>**Preeti A** (Author) | `ashokpa`<br>`nehaj`<br>`harshs`<br>`amays`<br>`preetia` | `["PCQuest"]`<br>*(Preeti: DQ, CIOL, PCQ)* | **Strictly PCQuest Only**.<br>• Switcher shows only PCQ.<br>• Forbidden from accessing V&D or DQ. |

---

## 2. Backend Enforcement Rules

1. **`list_articles` Query Filtering**:
   - For all non-admin users, the MongoDB query **MUST** be constrained by:
     ```python
     if current_user.role != "admin" and user_allowed:
         and_conditions.append({"publication": {"$in": user_allowed}})
     ```
   - Never allow a user to override this by passing `?publication=...` for an unauthorized magazine.

2. **`_check_article_access` Ownership & Isolation Gate**:
   - Before returning or mutating any article, verify:
     ```python
     user_allowed = getattr(user, "allowed_publications", []) or []
     if user.role != "admin" and user_allowed and article.publication not in user_allowed:
         raise HTTPException(status_code=403, detail="Access denied: You do not have permission to access articles from this publication.")
     ```

3. **`get_review_queue` Editor Isolation**:
   - An editor's review queue **MUST** only show submitted articles from their own allowed publication:
     ```python
     query_filters["publication"] = {"$in": current_user.allowed_publications}
     ```
   - A Voice&Data editor must never see PCQuest or Dataquest articles in their review queue.

4. **`create_article` Publication Verification**:
   - Prevent any API request from inserting an article into a publication that the creator is not authorized for.

---

## 3. Frontend Enforcement Rules

1. **Publication Switcher**:
   - Filter `magazineList` using `user.allowed_publications`.
   - If a user has only 1 allowed publication, display a static brand badge (`Voice&Data Desk`) instead of clickable tabs.
   - If a user has 2 publications (e.g. DQ & CIOL), show only those 2 tabs.

2. **Initial Form State**:
   - Always initialize the generator with the user's first allowed publication (never default to Dataquest for a Voice&Data user).

3. **Articles Dashboard Filter**:
   - The publication filter dropdown in `/articles` must only present publications present in `user.allowed_publications`.

