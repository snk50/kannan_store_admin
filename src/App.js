import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import CategoriesPage from "./components/CategoriesPage";
import ProductsPage from "./components/ProductsPage";
import OrdersPage from "./components/OrdersPage";
import OrderDetailsPage from "./components/OrderDetailsPage";
import UsersPage from "./components/UsersPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login/>}/> {/* Set Login as the home page */}
                <Route path="/home" element={<Homepage/>}/>
                <Route path="/categories" element={<CategoriesPage/>} />
                <Route path="/products/:categoryId" element={<ProductsPage />} />
                <Route path="/users/:userId/orders" element={<OrdersPage />} />
                <Route path="/orders/:userId/:orderId" element={<OrderDetailsPage />} />
                <Route path="/users" element={<UsersPage />} /> {/* New route */}
            </Routes>
        </Router>
    );
}

export default App;
