# 🔮 Aura Regex Platform

![Aura Regex Platform Banner]<img width="1747" height="927" alt="image" src="https://github.com/user-attachments/assets/485b7b19-7a46-4569-b85d-f75af4c5f29b" />

> **The Ultimate AI-Powered Regular Expression Assistant.**  
> Generate, test, debug, and share regex patterns with the power of AI and a vibrant community.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📖 About The Project

**Aura Regex Platform** is a cutting-edge tool designed to demystify Regular Expressions for developers, data scientists, and students. By leveraging advanced AI (Google Gemini), Aura allows users to generate complex regex patterns from simple natural language descriptions.

Beyond generation, Aura offers a robust testing environment, an academic mode for theoretical analysis, and a social platform where users can share, like, and comment on useful regex patterns.

### 🌟 Key Features

*   **🤖 AI-Powered Generation**: Describe what you want to match in plain English, and let our AI generate the perfect Regex for you.
*   **🧪 Interactive Testing**: Real-time validation of your regex against test strings with visual highlighting.
*   **🎓 Academic Mode**: Get theoretical explanations and formal notation for your regex patterns, perfect for learning.
*   **🌍 Community & Social**: Share your best rules, discover patterns from others, like, and comment.
*   **📂 Smart Organization**: Save your rules into custom folders to keep your workflow organized.
*   **🛡️ Admin Dashboard**: Comprehensive user management and real-time system statistics for administrators.
*   **⚡ Modern UI/UX**: Built with React, TailwindCSS, and Shadcn UI for a sleek, responsive, and accessible experience.

---

## 🛠️ Built With

### Frontend
*   **Framework**: [React](https://reactjs.org/) (Vite)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components**: [Shadcn UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Routing**: [Wouter](https://github.com/molefrog/wouter)
*   **State Management**: React Hooks & Context

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **AI**: [Google Generative AI SDK](https://ai.google.dev/)
*   **Authentication**: JWT & Bcrypt

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or pnpm
*   PostgreSQL database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/aura-regex-platform.git
    cd aura-regex-platform
    ```

2.  **Install Dependencies**
    ```bash
    # Install backend dependencies
    cd apps/backend
    npm install

    # Install frontend dependencies
    cd ../aura-regex-platform-frontend
    npm install
    ```

3.  **Environment Setup**

    Create a `.env` file in `apps/backend` with the following:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/aura_db"
    JWT_SECRET="your_super_secret_key"
    GEMINI_API_KEY="your_google_gemini_api_key"
    PORT=8000
    ```

4.  **Database Setup**
    ```bash
    cd apps/backend
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the Application**

    *Backend:*
    ```bash
    cd apps/backend
    npm run dev
    ```

    *Frontend:*
    ```bash
    cd apps/aura-regex-platform-frontend
    npm run dev
    ```

---

## 📱 Usage

1.  **Register/Login**: Create an account to save your rules.
2.  **Dashboard**: Use the input box to describe your regex needs (e.g., "Match all valid email addresses").
3.  **Test**: Enter test strings to verify the generated regex.
4.  **Save**: Save the rule to a folder for later use.
5.  **Community**: Visit the Community page to browse, like, and comment on public rules.
6.  **Share**: Toggle your rules to "Public" from the "My Rules" page to share them with the world.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact


Project Link: [https://github.com/7amed3li/aura-regex-platform](https://github.com/7amed3li/aura-regex-platform)
