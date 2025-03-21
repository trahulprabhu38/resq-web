# ResQ - Emergency Medical Information System

ResQ is a MERN stack application that helps in emergency situations by providing quick access to patient medical information through QR codes. Medical staff can scan these QR codes to access vital patient information instantly.

## Features

- Patient registration and profile management
- Secure storage of medical information
- QR code generation for medical information
- QR code scanning for medical staff
- Role-based access control (Patient/Medical Staff)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resq
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/resq
JWT_SECRET=your-secret-key-here
PORT=5000
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
npm run dev
```

3. In a new terminal, start the frontend development server:
```bash
cd client
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### For Patients

1. Register as a patient
2. Log in to your account
3. Add your medical information (blood type, allergies, medications, etc.)
4. Generate your medical QR code
5. Keep your QR code accessible for emergency situations

### For Medical Staff

1. Register as medical staff
2. Log in to your account
3. Use the QR scanner to access patient information in emergency situations

## Security

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints

## Technologies Used

- MongoDB
- Express.js
- React.js
- Node.js
- Material-UI
- QR Code generation and scanning
- JWT for authentication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 