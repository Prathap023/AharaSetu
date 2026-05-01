# 🍽️ AharaSetu

AharaSetu is a full-stack web platform that connects restaurants with surplus food to people in need.
It aims to reduce food waste while addressing hunger by enabling food sharing, donation, and low-cost distribution.

---

## 🌍 Problem Statement

Every day, restaurants and food outlets waste large amounts of food, while many people struggle to find meals.
AharaSetu bridges this gap by creating a system where:

* Restaurants can list leftover food
* NGOs, volunteers, or individuals can claim or purchase it
* Food waste is minimized, and hunger is reduced

---

## 🎯 Features

* 🏪 Restaurant Dashboard

  * Post available leftover food
  * Set price (free or discounted)
  * Manage orders

* 👤 User/Volunteer Access

  * Browse available food
  * Place orders or claim donations
  * Track order status

* 🔐 Authentication System

  * Secure login/signup
  * Role-based access (Admin / User)

* 💳 Payment Integration

  * Integrated with Stripe (test mode)

* 📦 Order Management

  * Admin can update order status
  * Real-time tracking

---

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML, CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### Other Tools

* Git & GitHub
* Stripe API
* Brevo (Email service)

---

## 📁 Project Structure

```
AharaSetu/
│
├── client/        # Frontend (React)
├── server/        # Backend (Node + Express)
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/Prathap023/AharaSetu.git
cd AharaSetu
```

---

### 2️⃣ Install dependencies

#### Backend

```
cd server
npm install
```

#### Frontend

```
cd client
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file inside `/server`:

```
PORT=5000
MONGO_URI=your_mongodb_connection
STRIPE_SECRET_KEY=your_stripe_key
BREVO_API_KEY=your_brevo_key
JWT_SECRET=your_secret
```

---

### 4️⃣ Run the project

#### Start backend

```
cd server
npm run server
```

#### Start frontend

```
cd client
npm start
```

---

## 🔐 Security Note

Sensitive data such as API keys are stored in `.env` and are **not pushed to GitHub**.
If any keys are exposed, they should be regenerated immediately.

---

## 🌱 SDG Alignment

This project supports:

* **SDG 2 – Zero Hunger**
* **SDG 12 – Responsible Consumption and Production**

---

## 🚀 Future Enhancements

* 📍 Location-based food discovery
* 📱 Mobile app version
* 🤝 NGO integration
* 🧠 AI-based demand prediction

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repository and submit a pull request.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Prathap Reddy**
BCA Student | Full Stack Developer

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
