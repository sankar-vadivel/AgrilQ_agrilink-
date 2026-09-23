# AgriLink

AgriLink is a web application created to connect farmers and customers through an online agricultural marketplace.

The main idea of the project is to make it easier for customers to find agricultural products directly from farmers. The application also provides product verification, market price information, price comparison, ordering, and location-based features.

## What the project does

The application has separate features for farmers and customers.

### For Farmers

- Create an account and login
- Manage their profile
- Add agricultural products
- Add product details such as price and quantity
- Provide pickup location
- Manage their listed products through the dashboard

### For Customers

- Create an account and login
- Browse agricultural products
- View product details
- Check market prices
- Compare prices
- Verify products
- Place orders
- View farmer and pickup location details

## Main Features

### Product Marketplace

Farmers can list their agricultural products with details such as product name, price, quantity and location. Customers can browse these products and place orders.

### Market Prices

The application has a market price section where users can check agricultural product prices.

### Product Verification

AgriLink includes a product verification section. The project also contains a Python-based scanning API and machine learning model files for the verification part.

### Price Comparison

Customers can compare the prices of available agricultural products before making a purchase.

### Farmer Dashboard

Farmers have a dashboard where they can manage their products and view their activities.

### Location

The project includes a map feature using Leaflet and OpenStreetMap. It can use the browser's location service to display the user's current location.

## Technologies Used

### Frontend

- React
- TypeScript
- JavaScript
- HTML
- CSS
- Tailwind CSS
- Vite

### Backend and AI

- Python
- REST API
- Ultralytics YOLO
- PyTorch
- Machine Learning

### Map

- Leaflet
- OpenStreetMap
- Browser Geolocation API

## Project Structure

```text
AGRILINK-MAIN
│
├── public
├── src
│   ├── components
│   ├── pages
│   ├── contexts
│   ├── hooks
│   └── ...
│
├── scanner_api.py
├── convert_model.py
├── inspect_model.py
├── verify_yolo.py
│
├── model.pkl
├── model_fixed.pt
├── model_test.pt
│
├── free-live-map.html
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── ...
