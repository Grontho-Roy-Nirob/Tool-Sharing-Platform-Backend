# 🛠️ ToolShare Platform

**ToolShare Platform** is a web-based tool-sharing and rental management system that connects tool owners with renters through a simple, convenient digital platform.

Owners can list and manage their tools, while renters can browse available tools, place rental orders, track their rentals, and pay securely online through **Stripe**.

🌐 **Live Demo:** 👉 **[Visit ToolShare Platform](https://tool-sharing-platform-frontend.vercel.app/)**

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [User Roles &amp; Features](#-user-roles--features)
- [Authentication &amp; Security](#-authentication--security)
- [Payment Workflow](#-payment-workflow)
- [Database](#-database)
- [Deployment](#-deployment)
- [Project Outcome](#-project-outcome)
- [Future Improvements](#-future-improvements)
- [Conclusion](#-conclusion)

---

## 🧰 Tech Stack

| Category            | Technology |
| ------------------- | ---------- |
| Frontend            | Next.js    |
| Backend             | NestJS     |
| Database            | PostgreSQL |
| Online Database     | NeonDB     |
| Authentication      | JWT        |
| Password Security   | bcrypt     |
| Payment Gateway     | Stripe     |
| Frontend Deployment | Vercel     |
| Backend Deployment  | Render     |

---

## ✨ User Roles & Features

### 👤 Renter

- Create an account and log in securely
- Browse available tools
- Search and filter tools
- View detailed tool information
- Place rental orders
- Track order status
- Make online payments using Stripe
- View payment status
- Manage profile information
- View rental history

### 🧑‍🔧 Owner

- Secure owner authentication
- Create and manage tool listings
- Upload tool images
- Update tool information
- Delete tools
- View rental orders
- Approve or reject rental requests
- Manage rental tools and availability

### 🛡️ Admin

- Manage platform users
- Manage tool categories
- Review and approve or reject tool listings
- Monitor platform activities
- Manage system information
- Access administrative features

---

## 🔐 Authentication & Security

- **JWT-based authentication** protects user accounts and private routes.
- **bcrypt** encrypts passwords before they are stored in the database.
- **Role-based access control** and authentication guards protect each user role (Renter, Owner, Admin).

---

## 💳 Payment Workflow

ToolShare integrates **Stripe** for online rental payments.

```text
Rental Request
      |
      v
Owner Approval
      |
      v
Approved Order
      |
      v
Stripe Payment
      |
      v
Payment Successful
      |
      v
Active Rental
      |
      v
Rental Completed
```

> Payment status is tracked separately from the rental order status, giving renters accurate payment information.

---

## 🗄️ Database

The application uses **PostgreSQL** as its primary database. In production, **NeonDB** provides the hosted PostgreSQL instance.

The database manages:

- Users
- Owners
- Renters
- Tools
- Categories
- Orders
- Payments
- Rental information

---

## 🚀 Deployment

| Layer    | Platform | Notes                                                             |
| -------- | -------- | ----------------------------------------------------------------- |
| Frontend | Vercel   | [Live Website](https://tool-sharing-platform-frontend.vercel.app/) |
| Backend  | Render   | NestJS API                                                        |
| Database | NeonDB   | Production PostgreSQL                                             |

---

## 🎯 Project Outcome

ToolShare Platform provides a complete digital solution for tool rental and sharing. Owners can easily publish and manage their tools, while renters can discover suitable tools, request rentals, track orders, and complete payments online.

The system brings the entire rental process into one place — from tool listing and order approval to online payment and rental management — and demonstrates a practical full-stack implementation using **Next.js, NestJS, PostgreSQL, JWT authentication, and Stripe**.

---

## 🔮 Future Improvements

- [ ] Real-time notifications
- [ ] Tool reviews and ratings
- [ ] Advanced search and filtering
- [ ] Location-based tool discovery
- [ ] Email notifications for order updates
- [ ] Rental reminders
- [ ] Improved payment and refund management

---

## 📌 Conclusion

ToolShare Platform makes tool sharing and rental easier, more organized, and more accessible through a modern web-based solution. It combines frontend development, backend API development, database management, authentication, authorization, deployment, and online payment integration in a single full-stack application.
