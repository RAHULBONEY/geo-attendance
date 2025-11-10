Geo-Verified On-Chain Attendance System

This project is a full-stack decentralized application (dApp) for recording attendance on the Ethereum blockchain. It prevents cheating by verifying that a student is at a specific physical location using a GPS-based, hash-verified check-in.

The system is designed with two main roles: a Teacher, who can start attendance sessions, and a Student, who can check into those sessions.

Core Features

On-Chain Records: All successful check-ins are recorded as immutable transactions on the Sepolia testnet.

Role-Based Access: The smart contract uses OpenZeppelin's AccessControl to ensure only designated "Teacher" wallets can start sessions.

Geo-Verification: A session is locked to the teacher's physical GPS coordinates at the moment of creation.

Zero-Cheating: Students can only check in if their device's current GPS location matches the session's location.

Client-Side Hashing: For privacy and efficiency, raw GPS coordinates are never stored on the blockchain. The location is hashed on the client-side, and the contract only compares the hashes.

How The "Zero-Cheating" Logic Works

The core of the project is ensuring the student is in the same location as the teacher without storing sensitive location data on-chain.

Teacher Starts Session:

The Teacher clicks "Start Session" in the React app.

The browser's Geolocation API fetches their coordinates (e.g., LAT: 19.0760, LON: 72.8777).

The frontend formats and rounds this to create a locationProof string (e.g., "LAT:19.0760,LON:72.8777"). Rounding to 4 decimal places ensures minor GPS drift is tolerated.

This string is hashed locally using keccak256(locationProof).

The Teacher sends a transaction to the startSession function, storing only this locationHash on the smart contract.

Student Checks In:

The Student enters the sessionId (e.g., "1").

They click "Check In." The browser gets their current GPS coordinates.

The frontend performs the exact same formatting and rounding to create their own locationProof string.

The Student sends a transaction to the checkIn function, passing the sessionId and their unhashed locationProof string.

The smart contract receives the student's string, hashes it using keccak256(abi.encodePacked(locationProof)), and compares it to the locationHash the teacher stored for that session.

If the hashes match, require() passes, and the student's address is recorded. If they don't match, the transaction reverts.

Tech Stack

Smart Contract:

Solidity (v0.8.20)

Hardhat (v3) (Development, compilation, and deployment)

OpenZeppelin Contracts (v5) (for AccessControl)

Blockchain:

Ethereum (Sepolia Testnet)

Frontend:

React.js

Ethers.js (v5) (Wallet connection and contract interaction)

qrcode.react (For displaying the Session ID as a QR code)

Project Structure

/geo-attendance
├── /artifacts          # Compiled contract ABIs
├── /contracts
│   └── Attendance.sol  # The main Solidity smart contract
├── /frontend
│   ├── /public
│   ├── /src
│   │   ├── App.js            # Main component, handles wallet connection
│   │   ├── TeacherPanel.js   # UI for starting sessions & viewing attendees
│   │   ├── StudentPanel.js   # UI for checking in
│   │   ├── constants.js      # Stores the Contract Address and ABI
│   │   └── utils.js          # Handles GPS location and hashing logic
│   └── package.json
├── /scripts
│   └── deploy.ts       # Deployment script
├── .env                # Stores private keys and RPC URL
├── hardhat.config.ts   # Hardhat configuration
└── package.json        # Backend dependencies


🚀 Getting Started

Follow these steps to set up and run the project locally.

1. Clone the Repository

git clone <your-repo-url>
cd geo-attendance


2. Install Backend Dependencies

Install Hardhat and all its related packages from the root directory:

npm install


3. Install Frontend Dependencies

Navigate to the frontend directory and install its packages:

cd frontend
npm install
cd ..


4. Set Up Environment Variables

Create a .env file in the root geo-attendance directory. This file will store your secret credentials.

You will need:

An RPC URL from a node provider like Alchemy or Infura for the Sepolia network.

A MetaMask Private Key from a wallet. This wallet must be funded with Sepolia ETH for deploying the contract.

SEPOLIA_RPC_URL="<your_alchemy_https_url>"
PRIVATE_KEY="<your_metamask_private_key>"


5. Get Sepolia Test ETH

You can get Sepolia ETH from a public faucet, such as sepoliafaucet.com or sepolia-faucet.pk910.de.

6. Compile and Deploy the Smart Contract

From the root directory, run:

# Compile the contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia


After a successful deployment, the terminal will output your contract address. Copy this address.

Deploying contract...
Attendance contract deployed to: 0x...

7. Configure the Frontend

Open /artifacts/contracts/Attendance.sol/Attendance.json. Copy the entire abi array.

Open /frontend/src/constants.js.

Paste the contract address (from step 6) into the contractAddress variable.

Paste the ABI (from step 7.1) into the contractABI variable.

8. Run the Application

In a new terminal, navigate to the frontend directory and start the React app:

cd frontend
npm start


Your browser will automatically open to http://localhost:3000.

💻 How to Use (Demo Flow)

Pro-Tip: Use two different browser profiles (e.g., Chrome and Chrome Guest) or two different browsers (Chrome and Firefox) to represent the Teacher and Student with different MetaMask wallets.

Teacher Flow:

Open http://localhost:3000.

Click "Connect MetaMask Wallet".

Connect your "Teacher" account (the one you deployed the contract with).

Make sure MetaMask is set to the Sepolia Testnet.

In the "Teacher Panel," click "Start New Attendance Session".

Your browser will ask for permission to access your location. Allow it.

MetaMask will pop up. Confirm the transaction.

The UI will update to show: "✅ Session Started! Session ID: 1".

Note this Session ID (or use the QR code).

Student Flow:

Open http://localhost:3000 in your second browser (with a different MetaMask wallet).

Click "Connect MetaMask Wallet" and connect your "Student" account.

Make sure this wallet is also on Sepolia and has some test ETH for gas.

In the "Student Panel," enter the Session ID (e.g., "1") that the teacher generated.

Click "Check In".

Your browser will ask for location permission. Allow it.

MetaMask will pop up. Confirm the transaction.

The UI will update: "✅ Successfully checked in to session 1!"

Verification:

Go back to the Teacher's browser.

In the "View Attendance" section, enter the Session ID ("1").

Click "View Attendees".

The list will update and show the wallet address of the Student who just checked in.

⚖️ License

This project is licensed under the MIT License.
