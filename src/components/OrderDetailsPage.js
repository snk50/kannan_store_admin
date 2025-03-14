import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "./orderDetails.css"; // Import CSS for styling

const OrderDetailsRoute = () => {
    const { userId, orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [updating, setUpdating] = useState(false);
    const statusOptions = ["Pending", "Confirmed", "Rejected"];

    useEffect(() => {
        const fetchOrder = async () => {
            console.log("Fetching order with userId:", userId, "and orderId:", orderId);
            try {
                setLoading(true);
                const orderRef = doc(db, `users/${userId}/orders`, orderId);
                console.log("Order reference path:", orderRef.path);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    let orderData = { id: orderSnap.id, ...orderSnap.data(), userId };
                    console.log("Order data fetched:", orderData);
                    if (orderData.createdAt instanceof Timestamp) {
                        orderData.createdAt = orderData.createdAt.toDate();
                    }
                    setOrder(orderData);
                    setStatus(orderData.orderStatus || "Pending"); // Initialize status
                } else {
                    console.log("Order document does not exist at path:", orderRef.path);
                    setError("Order not found.");
                }
            } catch (error) {
                console.error("Error fetching order:", error.message, error.stack);
                setError("Failed to fetch order details: " + error.message);
            } finally {
                setLoading(false);
                console.log("Loading state set to false, current state:", { loading: false, order, error });
            }
        };

        fetchOrder();
    }, [userId, orderId]);

    const handleClose = () => {
        navigate("/orders");
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value); // Update local status state
    };

    const handleUpdateOrder = async () => {
        if (!order) return;

        try {
            setUpdating(true);
            const orderRef = doc(db, `users/${userId}/orders`, orderId);
            await updateDoc(orderRef, { orderStatus: status });
            const updatedOrder = { ...order, orderStatus: status };
            setOrder(updatedOrder); // Update local state
            console.log("Order updated in Firestore:", updatedOrder);
            alert("Order status updated successfully!");
        } catch (error) {
            console.error("Error updating order status:", error.message, error.stack);
            setError("Failed to update order status: " + error.message);
            setStatus(order.orderStatus); // Revert on error
        } finally {
            setUpdating(false);
        }
    };

    // Helper function to format price with rupees symbol and space
    const formatPrice = (amount) => {
        if (!amount) return "₹ 0.00";
        // If it already starts with ₹ and has a space, use it as-is
        if (amount.startsWith("₹ ") && /^\₹\s\d+(\.\d{2})?$/.test(amount)) {
            return amount;
        }
        // Otherwise, parse the numeric part and reformat
        const numericValue = parseFloat(amount.replace(/[^0-9.]/g, ""));
        return isNaN(numericValue) ? "₹ 0.00" : `₹ ${numericValue.toFixed(2)}`;
    };

    if (loading) {
        return <p>Loading order details...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (!order) {
        return <p>No order data available.</p>;
    }

    return (
        <div className="order-details-container">
            <h2>Order Details</h2>

            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Placed on:</strong> {order.orderDetails?.orderDate || "N/A"}</p>
            <p><strong>Total Amount:</strong> ₹ {order.totals?.total?.toFixed(2) || "0.00"}</p>
            <p><strong>Item Count:</strong> {order.items?.length || 0} Items</p>

            <div className="form-group">
                <label><strong>Status:</strong></label>
                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="status-select"
                    disabled={updating}
                >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button
                    onClick={handleUpdateOrder}
                    className="update-btn"
                    disabled={updating}
                >
                    {updating ? "Updating..." : "Update"}
                </button>
            </div>

            <h3>Items Ordered</h3>
            <ul className="items-list">
                {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                        <li key={index} className="item">
                            <img src={item.cartFoodImage} alt={item.cartFoodName} className="item-img" />
                            <div>
                                <p>{item.cartFoodName} - {formatPrice(item.cartFoodAmount)}</p>
                                <p>Quantity: {item.cartQuantity || item.cartFoodQuantity}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No items found.</p>
                )}
            </ul>

            <button onClick={handleClose} className="close-btn">Close</button>
        </div>
    );
};

export default OrderDetailsRoute;