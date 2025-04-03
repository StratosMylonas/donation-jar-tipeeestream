# Donation Jar

A real-time donation tracker that displays total donations visually in a jar. Built with Node.js, Express, and Socket.IO.

## Features

- Real-time donation updates using WebSocket.
- Dynamic and animated donation jar visualization.
- Configurable donation goals and initial values via `.env` file.

## Installation

1. Clone the repository:
  ```sh
  git clone https://github.com/StratosMylonas/donation-jar-tipeeestream.git
  cd donation-jar
  ```
2. Install dependencies:
  ```sh
  npm install
  ```

3. Create a .env file in the root directory and configure
  ```sh
  PORT=3000
  TIPEEESTREAM_API_KEY=<your-api-key>
  GOAL_TITLE="Your Goal Title"
  INITIAL_GOAL=0
  TOTAL_GOAL=1000
  ```

4. Start the server:
  ```sh
  npm start
  ```

5. Open your browser and navigate to (or add a new Browser Source to OBS pointing to):
  ```sh
  http://localhost:3000
  ```

## Environment Variables
* PORT: The port on which the server runs (default: 3000).
* TIPEEESTREAM_API_KEY: API key for TipeeeStream WebSocket integration.
* GOAL_TITLE: Title of the donation goal.
* INITIAL_GOAL: Initial donation amount.
* TOTAL_GOAL: Target donation amount.

## Dependencies
* Express: Web server framework.
* Socket.IO: Real-time WebSocket communication.
* Axios: HTTP client for API requests.
* dotenv: Environment variable management.

## How It Works
1. The server connects to the TipeeeStream WebSocket API to listen for donation events.
2. When a new donation is received, the server updates the total donation amount and broadcasts the update to all connected clients.
3. The client-side script dynamically updates the donation jar visualization.

## Screenshots
![Screenshot 2025-04-03 105740](https://github.com/user-attachments/assets/d89779ad-cda3-48e3-aadc-0274ee6ed0f0)
![Screenshot 2025-04-03 105905](https://github.com/user-attachments/assets/1021204f-3d59-4a70-9d94-b97e4fb45e82)
![Screenshot 2025-04-03 105958](https://github.com/user-attachments/assets/2f27b660-7a69-458b-929d-692e6f321cf6)

## License
This project is licensed under the MIT License. See the LICENSE file for details.
