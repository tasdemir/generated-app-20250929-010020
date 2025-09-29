# PitchPal: Soccer Team Management
PitchPal is a visually stunning, high-performance web application designed for soccer players to seamlessly manage their team activities. Built on Cloudflare's edge network, it offers a fast, responsive, and intuitive interface for joining events, managing participation, tracking performance, and engaging with the team. The application features a minimalist and clean design, prioritizing user experience with smooth animations, clear information hierarchy, and a mobile-first approach that feels native on any device.
## Key Features
-   **Secure Authentication:** Clean, simple, and secure login and registration flows with password protection.
-   **Events Dashboard:** View upcoming and past events in a visually appealing card layout. Join new events with a 6-character short code.
-   **Detailed Event Management:** See event details, including participant lists for Team A and Team B. Update your participation status ('Definitely', 'Maybe', 'Can't') and team preference.
-   **Competitive Leaderboard:** A ranked list of all players based on points to foster friendly competition.
-   **User Profile & Settings:** Manage personal information, soccer positions, contact details, and security settings.
-   **Admin & Coach Tools:** Role-based access for creating events, managing team rosters, and awarding points.
## Technology Stack
-   **Frontend:** React, Vite, React Router, Tailwind CSS
-   **Backend:** Cloudflare Workers, Hono
-   **State Management:** Zustand (Client State), TanStack Query (Server State)
-   **UI:** Shadcn/UI, Framer Motion, Lucide React
-   **Forms:** React Hook Form with Zod for validation
-   **Deployment:** Cloudflare Pages & Workers
## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.
### Installation
1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd pitchpal
    ```
3.  **Install dependencies:**
    ```sh
    bun install
    ```
## Usage
To start the development server, which includes both the Vite frontend and the Hono backend worker, run the following command:
```sh
bun dev
```
This will start the application, typically on `http://localhost:3000`. The frontend is located in the `src` directory, and the backend API routes are in the `worker` directory.
### Demo Credentials & Testing
The login form is pre-filled with the administrator's credentials for easy testing and review:
-   **Email:** `admin@admin.com`
-   **Password:** `admin123`
## Deployment
This project is configured for seamless deployment to Cloudflare.
1.  **Build the application:**
    ```sh
    bun build
    ```
2.  **Deploy to Cloudflare:**
    Make sure you are logged in to Wrangler (`wrangler login`). Then, run the deploy command:
    ```sh
    bun deploy
    ```
    Wrangler will handle the process of deploying your frontend to Cloudflare Pages and your backend to Cloudflare Workers.
## Project Structure
-   `src/`: Contains the React frontend application (pages, components, hooks, etc.).
-   `worker/`: Contains the Hono backend API running on Cloudflare Workers.
-   `shared/`: TypeScript types and mock data shared between the frontend and backend.
-   `public/`: Static assets.
## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
---
*Built with ❤️ at Cloudflare*