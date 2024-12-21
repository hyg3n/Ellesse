
# **Ellesse**

Ellesse is a React Native application designed to connect users with local service providers, such as plumbers, tutors, and more. The app includes a map view for displaying nearby providers, a search functionality for specific services, and cross-platform compatibility for both Android and iOS.

---

## **Features**

- Search for service providers based on location and service type.
- View detailed provider information, including name, service, rating, and distance.
- Interactive map displaying user and provider locations with clickable markers.
- Cross-platform support for Android and iOS.

---


### **Prerequisites**

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org) (16+ recommended) and npm
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)
- [CocoaPods](https://cocoapods.org) (for iOS dependencies)
- PostgreSQL (for the backend database)

---

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd <project_directory>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up the Backend**
   - Navigate to the `backend` folder and install dependencies:
     ```bash
     cd backend
     npm install
     ```

4. **Install iOS Dependencies**
   - If testing on iOS, navigate to the `frontend/ios` folder and install CocoaPods dependencies:
     ```bash
     cd ../frontend/ios
     pod install
     ```

## **Database Setup**

   1. Import the schema from backend\db\db_schema.sql

   2. Populate with initial data from backend\db\db_data.sql


   - Configure the `.env` file with your PostgreSQL credentials:
     ```env
     DB_USER=your_user
     DB_PASSWORD=your_password
     DB_NAME=your_database
     DB_HOST=localhost
     DB_PORT=5432
     ```


   - Start the backend server:
     ```bash
     node server.js
     ```


---

## **Running the App**

### **Android**

1. Start the development server:
   ```bash
   npm start
   ```
2. Launch the app on an Android emulator or connected device:
   ```bash
   npm run android
   ```

### **iOS**

1. Ensure you have access to a macOS system with Xcode installed.
2. Start the development server:
   ```bash
   npm start
   ```
3. Launch the app on an iOS simulator:
   ```bash
   npm run ios
   ```

---

## **iOS Testing Instructions**

If you have access to macOS, follow these steps to test the app on iOS:

1. Open the project in Xcode:
   ```bash
   open frontend/ios/frontend.xcworkspace
   ```

2. Configure signing in Xcode:
   - Go to **Signing & Capabilities** in the project settings.
   - Select a development team for the app.

3. Build and run the app:
   - Select a target simulator (e.g., iPhone 14).
   - Click the **Run** button to launch the app.

4. Verify functionality:
   - Ensure Google Maps loads correctly.
   - Test the search and map features for displaying providers.

---

## **Configuration**

### **Google Maps API Key**

Add your API key to the following files:

- **Android**: Add it to `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_GOOGLE_MAPS_API_KEY" />
  ```

- **iOS**: Add it to `AppDelegate.mm`:
  ```objc
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
  ```

---