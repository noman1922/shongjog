# Shongjog (সংযোগ) — University Student & Alumni Network

[![Live Demo](https://img.shields.io/badge/Live_Deployment-Vercel-blue?style=for-the-badge&logo=vercel)](https://noman1922-shongjog.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

🔗 **Live Platform URL:** [https://noman1922-shongjog.vercel.app/](https://noman1922-shongjog.vercel.app/)

Database Image: https://drive.google.com/drive/folders/161OP5GgIEOCVN5RWpSieWA8CHgMBVyXN?usp=sharing

---

## Overview

**Shongjog (সংযোগ)** is a full-stack academic networking and mentorship ecosystem designed to bridge the gap between university students, alumni, and faculty. It facilitates seamless collaboration, campus story sharing, career discovery, direct messaging, and institutional moderation within a unified, high-performance web platform.

---

## Core Features

* **Authentication & Dual-Role Onboarding:** Automated onboarding flows tailored specifically for students and alumni with instant profile photo uploads.
* **Interactive Stories Engine:** Expiring photo stories with live canvas rendering, headline text overlays, and connection-based feed distribution.
* **Academic Discussion Feed:** Rich community feed supporting media uploads, real-time post interactions, comments, and university topic filters.
* **Smart Connections & Peer Discovery:** University-wide directory to search, connect, and collaborate with verified peers and alumni mentors.
* **Real-time Direct Messaging:** Zero-latency optimistic messaging interface powered by Supabase Realtime subscriptions.
* **Institutional Moderation Panel:** Dedicated `/admin` dashboard featuring real-time KPI metrics, user management controls, content moderation, and campus announcements.

---

## System Architecture & Software Engineering Specifications

* 📊 **Activity Diagram:** [View on Google Drive](https://drive.google.com/file/d/12wZiJhFOMasdtSo7SxBUUyLo7OQKWeQo/view?usp=sharing)
* 🏊 **Swimlane Diagram:** [View on MockFlow](https://app.mockflow.com/iview/Mee2d895c1237fb18b1838b1b5317f13b1786473137938#/mode/view)
* 🔄 **Sequence Diagram:** [View on Google Drive](https://drive.google.com/file/d/1nLBtwyhV4y6JHoTbqqBjhwbNCO0SM4a8/view?usp=sharing)

---

## Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router, Server Actions, Server Components) |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Database & Auth** | Supabase (PostgreSQL, Transaction Pooler, Row Level Security, Realtime) |
| **Media & CDN Storage** | Cloudinary API |
| **Deployment** | Vercel Serverless Edge (Collocated Singapore `sin1` Region) |

---

## Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/noman1922/shongjog.git](https://github.com/noman1922/shongjog.git)
cd shongjog
