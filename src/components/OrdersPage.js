import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { collectionGroup, getDocs, Timestamp } from "firebase/firestore";
import "./orders.css";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                setLoading(true);  
                setError("");

                const ordersRef = collectionGroup(db, "orders");
                const ordersSnapshot = await getDocs(ordersRef);

                if (ordersSnapshot.empty) {
                    console.log("No orders found in any user document");
                    setOrders([]);
                    return;
                }

                console.log(`Found ${ordersSnapshot.size} orders across all users`);

                const allOrders = ordersSnapshot.docs.map(doc => {
                    const fullPath = doc.ref.path;
                    const pathParts = fullPath.split('/');
                    const userId = pathParts[1]; // Index 1 contains the userId

                    let orderData = { id: doc.id, ...doc.data() };

                    // Handle Timestamp conversion if needed
                    if (orderData.createdAt instanceof Timestamp) {
                        orderData.createdAt = orderData.createdAt.toDate();
                    }

                    // Parse the orderDate string into a Date object if it exists
                    if (orderData.orderDetails?.orderDate) {
                        try {
                            // Try to parse the date string (handle different formats)
                            const dateParts = orderData.orderDetails.orderDate.split(' ')[0].split('/');
                            if (dateParts.length === 3) {
                                // Format: DD/MM/YYYY
                                const day = parseInt(dateParts[0]);
                                const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
                                const year = parseInt(dateParts[2]);
                                orderData.orderDateObj = new Date(year, month, day);
                            } else {
                                orderData.orderDateObj = new Date(orderData.orderDetails.orderDate);
                            }
                        } catch (e) {
                            console.warn(`Failed to parse date for order ${orderData.id}:`, e);
                            orderData.orderDateObj = new Date(0); // Default to epoch time
                        }
                    } else {
                        orderData.orderDateObj = new Date(0); // Default to epoch time
                    }

                    return { ...orderData, userId };
                });

                // Sort orders by date (newest first)
                allOrders.sort((a, b) => b.orderDateObj - a.orderDateObj);

                setOrders(allOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                if (error.code === 'failed-precondition' && error.message.includes('index')) {
                    setError("Firestore index required. Check console for the link to create it.");
                    console.log("Please click the link in the error message above to create the required index.");
                } else {
                    setError(`Failed to fetch orders: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.id?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderStatus?.toLowerCase().includes(search.toLowerCase())
    );

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            if (dateString.includes('/')) {
                return dateString.split(' ')[0]; // Just the date part, not time
            }
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString; // Fall back to original string if parsing fails
        }
    };

    // Format price with rupees symbol
    const formatPrice = (amount) => {
        if (!amount && amount !== 0) return "₹ 0.00";
        const numericValue = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, "")) : amount;
        return isNaN(numericValue) ? "₹ 0.00" : `₹ ${numericValue.toFixed(2)}`;
    };

    return (
        <div className="orders-container">
            <h2>All Orders</h2>

            <button
    onClick={() => window.location.href = '/home'}  // Change '/home' to your actual home route
    className="dashboard-button1"
>
    Home
</button>


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
                            onClick={() => navigate(`/orders/${order.userId}/${order.id}`)}
                        >
                            <h3>{order.customer?.name || "Unknown Customer"}</h3>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>Status:</strong> {order.orderStatus || "N/A"}</p>
                            <p><strong>Ordered On:</strong> {formatDate(order.orderDetails?.orderDate)}</p>
                            <p><strong>Total:</strong> {formatPrice(order.totals?.total)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No orders found. {search ? "Try clearing your search filter." : ""}</p>
            )}
        </div>
    );
};

export default OrdersPage;