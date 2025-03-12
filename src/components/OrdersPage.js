import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import "./orders.css";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                // Fetch all users
                const usersSnapshot = await getDocs(collection(db, "users"));
                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                console.log("Users fetched:", users);

                // Fetch all orders
                const orderPromises = users.map(async (user) => {
                    console.log(`Fetching orders for user: ${user.id}`);
                    const ordersSnapshot = await getDocs(collection(db, `users/${user.id}/orders`));
                    return ordersSnapshot.docs.map(doc => {
                        let orderData = { id: doc.id, ...doc.data() };

                        // Convert Firestore Timestamp to Date object
                        if (orderData.createdAt instanceof Timestamp) {
                            orderData.createdAt = orderData.createdAt.toDate();
                        }

                        return { ...orderData, userId: user.id }; // Store userId for fetching later
                    });
                });

                const allOrders = (await Promise.all(orderPromises)).flat();

                // Sort orders by order date (latest first)
                allOrders.sort((a, b) =>
                    new Date(b.orderDetails?.orderDate || 0) - new Date(a.orderDetails?.orderDate || 0)
                );

                setOrders(allOrders);
            } catch (error) {
                console.error("Error fetching users and orders:", error);
                setError("Failed to fetch orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter orders based on search input (by name, order ID, or status)
    const filteredOrders = orders.filter(order =>
        order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.id?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderStatus?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="orders-container">
            <h2>All Orders</h2>

            <input
                type="text"
                placeholder="Search orders by name, ID, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />

            {loading ? (
                <p>Loading orders...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : filteredOrders.length > 0 ? (
                <div className="orders-list">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="order-item"
                            onClick={() => navigate(`/orders/${order.userId}/${order.id}`)} // Navigate to details page
                            style={{ cursor: "pointer" }}
                        >
                            <h3>{order.customer?.name || "Unknown Customer"}</h3>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>Status:</strong> {order.orderStatus || "N/A"}</p>
                            <p><strong>Ordered On:</strong> {order.orderDetails?.orderDate || "N/A"}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default OrdersPage;
