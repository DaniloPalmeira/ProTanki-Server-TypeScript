# 🚀 ProTanki Server TypeScript

## 🌟 Overview
ProTanki Server TypeScript is a robust, server-side application written in TypeScript to power the multiplayer functionalities of the ProTanki game. Designed with scalability, modularity, and type safety in mind, this project provides a flexible and maintainable infrastructure for handling game client connections, authentication, and real-time communication.

> **Current Phase: Login Page**  
> The server currently supports user authentication, invite code validation, and resource loading for the login interface, with a focus on a seamless and secure user experience.

## ✨ Features
- **TypeScript-Powered**: Leverages TypeScript for type safety, improved developer experience, and modern JavaScript features.
- **Scalable Architecture**: Handles multiple concurrent client connections efficiently using Node.js and WebSocket.
- **Modular Design**: Organized codebase with services, models, and packet handlers for easy extension and maintenance.
- **Real-Time Communication**: Utilizes WebSockets for low-latency, bidirectional communication between server and clients.
- **Dynamic Configuration**: Supports a generic key-value configuration system stored in a database, allowing flexible updates via WebSocket with feedback.
- **Secure Authentication**: Implements user registration, login, and password recovery with bcrypt hashing and CAPTCHA verification.
- **Resource Management**: Dynamically loads game resources (e.g., images) based on configuration, with type-safe resource IDs.
- **Logging**: Comprehensive logging with Winston for debugging and monitoring, with daily log rotation.
- **Database Support**: Configurable for SQLite or PostgreSQL, with Sequelize ORM for robust data management.

## 📋 Prerequisites
Before setting up the ProTanki Server, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (optional, for production) or SQLite (for development)
- **Git** (for cloning the repository)

## 🛠️ Installation
Follow these steps to set up the ProTanki Server locally:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/danilopalmeira/ProTanki-Server-TypeScript.git
    cd ProTanki-Server-TypeScript
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Configure environment variables**:
    Create a `.env` file in the root directory based on `.env.example`. Example configuration:
    ```env
    # Server settings
    PORT=1337
    RESOURCE_PORT=9999
    WEBSOCKET_PORT=9998

    # Database settings (PostgreSQL)
    DB_DIALECT=postgres
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=protanki_db

    # Or use SQLite for development
    # DB_DIALECT=sqlite
    # DB_STORAGE=database.sqlite

    # Logging
    ENABLE_CONSOLE_LOGGING=true
    LOG_LEVEL=info
    ```
    Adjust the variables based on your environment (e.g., use SQLite for quick setup or PostgreSQL for production).

4. **Set up the database**:
    - For PostgreSQL: Create a database and ensure the credentials match your `.env` file.
    - For SQLite: No additional setup is required; the database file will be created automatically.

5. **Generate resource types**:
    Run the script to generate TypeScript types from `resources.json`:
    ```sh
    npm run generate:resources
    ```

6. **Build the project**:
    Compile the TypeScript code to JavaScript:
    ```sh
    npm run build
    ```

7. **Run the server**:
    Start the server:
    ```sh
    npm start
    ```
    The server will listen on the configured port (default: `1337`) for game client connections and on port `9998` for WebSocket-based admin panel communication.

## 🚀 Usage
- **Game Clients**: Configure ProTanki game clients to connect to the server's IP address and port (e.g., `ws://localhost:1337`). The server handles login, registration, and CAPTCHA verification.
- **Admin Panel**: Access the admin panel via WebSocket at `ws://localhost:9998` to update server configurations (e.g., `needInviteCode`, `maxClients`) in real-time. The server provides feedback on configuration updates.
- **Resource Server**: Static game resources (e.g., images) are served from the `.resource` directory on the configured `RESOURCE_PORT` (default: `9999`).
- **Logs**: Check the `logs` directory for detailed server activity logs, rotated daily.

## ⚙️ Configuration
The server uses a dynamic configuration system stored in the database:
- **Initial Config**: Defined in `initial-config.json`. Example:
  ```json
  {
    "needInviteCode": "false",
    "maxClients": "10"
  }
  ```
- **Dynamic Updates**: Configurations can be updated via the WebSocket admin panel, with changes persisted in the database.
- **Extensibility**: Add new configuration keys to `initial-config.json` to support additional settings without code changes.

To add a new configuration:
1. Update `initial-config.json` with the new key-value pair.
2. Restart the server to initialize the new configuration in the database.
3. Use the WebSocket admin panel to modify the value, receiving immediate feedback.

## 🧪 Running Tests
*Note*: Tests are not yet implemented in the current phase. To contribute tests:
1. Add test files in the `tests` directory using a framework like Jest.
2. Update `package.json` with test scripts (e.g., `npm test`).
3. Ensure tests cover services, packet handlers, and database operations.

## 📈 Roadmap
- [x] Implement login page functionality (user authentication, invite codes, CAPTCHA).
- [x] Set up dynamic configuration system with database persistence.
- [x] Enable WebSocket-based admin panel with real-time feedback.
- [ ] Implement garage and battle lobbies.
- [ ] Add game logic for battles and player interactions.
- [ ] Introduce clustering for horizontal scaling.
- [ ] Implement comprehensive test suite.
- [ ] Support additional database backends (e.g., MySQL).

## 🤝 Contributing
We welcome contributions to make ProTanki Server even better! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a clear description of your changes.

Please follow these guidelines:
- Adhere to the existing code style (use ESLint and Prettier).
- Write clear commit messages.
- Include tests for new features when possible.
- Update documentation (e.g., README) for significant changes.

## 📜 License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📬 Contact
For questions, suggestions, or issues, please open an issue on GitHub or contact the maintainer:
- **Danilo Palmeira**: [GitHub](https://github.com/danilopalmeira)

---

### Key Improvements
1. **Clarity and Structure**: Organized sections for easy navigation, with clear instructions for setup, usage, and contribution.
2. **Current Phase Context**: Emphasized the login page focus and detailed its features (authentication, CAPTCHA, invite codes).
3. **Dynamic Configuration**: Highlighted the modular configuration system and how to extend it, aligning with your recent changes.
4. **Feedback Mechanism**: Noted the WebSocket feedback for configuration updates, making the admin panel interactive.
5. **Prerequisites and Database Setup**: Added explicit requirements and database configuration steps for both SQLite and PostgreSQL.
6. **Roadmap**: Included a roadmap to give context on the project's direction and future features.
7. **Professional Tone**: Used engaging yet professional language with emojis for visual appeal, maintaining a welcoming vibe for contributors.
8. **Extensibility**: Covered how to add new configurations and contribute tests, encouraging community involvement.

### Notes
- **Repository URL**: I used `https://github.com/danilopalmeira/ProTanki-Server-TypeScript.git` as a placeholder based on your provided context. Update it to the actual repository URL.
- **License**: Assumed MIT License as a common choice; update the `LICENSE` section if you use a different license.
- **Tests**: Noted that tests are not yet implemented, as I didn't see test files in your codebase. If you plan to add tests, I can help set up a testing framework like Jest.
- **Contact**: Included your GitHub handle; add other contact methods (e.g., email, Discord) if desired.