# Expense Manager

A secure and visually insightful full-stack web application that helps users manage their personal finances by tracking income and expenses, showing dynamic charts, and giving them a clear financial summary.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Frontend:** EJS, CSS, JavaScript  

---

## 🔐 Key Features

- ✅️**User Authentication** using JWT and hashed passwords with bcrypt.
- ✅️**Add**, **Edit**, **Delete** income and expense entries.
- ✅️**Visual Charts** to show income vs. expenses using dynamic data.
- ✅️**Financial Summary** with total income, expenses, and savings calculation.
- ✅️**Category Breakdown** to analyze where the user spends the most.
- ✅️**Logout Functionality** to end secure sessions.

---

## What Makes It a Good One

- Uses the **MVC structure** for better code organization and scalability
- **Secure login system** with tokens and encrypted passwords
- **Insightful dashboards** that let users visually understand their spending habits — even without reading individual entries
- Smooth, user-friendly UI with clear data breakdowns

---

## 🛠️ Run Locally

> Follow these steps to run the project on your machine.

1. Clone the Repository

git clone https://github.com/your-username/expense-manager.git

cd expense-manager

2. Install Dependencies

npm install

3. Create a .env File

-> Add your environment variables in a .env file in the root folder:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

4. Run the Server

npm start

or if you're using nodemon:

nodemon server.js

5. Visit in Browser

http://localhost:3000

---

📁 Folder Structure (Simplified)

expense-manager/
│
├── controllers/       
├── models/           
├── routes/             
├── views/             
├── public/            
├── middleware/      
├── .env                
├── server.js          
└── package.json

---

🧑‍💻 Author 

Bhumika Singh
https://www.linkedin.com/in/bhumikaaasingh

---

📜 License

This project is licensed under the MIT License.
