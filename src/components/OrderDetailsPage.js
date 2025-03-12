import React, { useState } from "react";
import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import "./orderDetails.css";

const OrderDetailsPage = ({ order, onClose, onUpdateOrder }) => {
    const [status, setStatus] = useState(order?.orderStatus || "Pending");
    const [updating, setUpdating] = useState(false);
    const statusOptions = ["Pending", "Confirmed", "Delivered", "Rejected"];

    if (!order) {
        return (
            <div className="order-details-container">
                <button onClick={onClose} className="close-btn">Close</button>
                <h2>Order Details</h2>
                <p>Loading order details...</p>
            </div>
        );
    }

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        try {
            setUpdating(true);
            const orderRef = doc(db, `users/${order.userId}/orders`, order.id);
            await updateDoc(orderRef, { orderStatus: newStatus });
            const updatedOrder = { ...order, orderStatus: newStatus };
            onUpdateOrder(updatedOrder); // Update parent state
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update status. Please try again.");
            setStatus(order.orderStatus); // Revert on error
        } finally {
            setUpdating(false);
        }
    };

    const handleCallSupport = () => {
        window.location.href = "tel:9380958581";
    };

    const handleEmailSupport = () => {
        const subject = encodeURIComponent("Order Related");
        const body = encodeURIComponent(`Order ID: ${order.id}`);
        window.location.href = `mailto:shreekannanstores75@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="order-details-container">
            <button onClick={onClose} className="close-btn">Close</button>
            <h2>Order Details</h2>

            <p><strong>Order ID:</strong> {order.id}</p>
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
                {updating && <span className="updating">Updating...</span>}
            </div>

            <h3>Customer</h3>
            <p><strong>Name:</strong> {order.customer?.name || "N/A"}</p>
            <p><strong>Email:</strong> {order.customer?.email || "N/A"}</p>
            <p><strong>Phone:</strong> {order.customer?.phone || "N/A"}</p>

            <h3>Order Details</h3>
            <p><strong>Order Date:</strong> {order.orderDetails?.orderDate || "N/A"}</p>
            <p><strong>Payment Method:</strong> {order.orderDetails?.payment?.method || "N/A"}</p>
            <p><strong>Payment Status:</strong> {order.orderDetails?.payment?.status || "N/A"}</p>
            <p><strong>Transaction ID:</strong> {order.orderDetails?.payment?.transactionId || "N/A"}</p>
            <p><strong>Delivery Date:</strong> {order.orderDetails?.delivery?.deliveryDate || "N/A"}</p>
            <p><strong>Shipping Method:</strong> {order.orderDetails?.delivery?.shippingMethod || "N/A"}</p>
            <p><strong>Tracking Number:</strong> {order.orderDetails?.delivery?.trackingNumber || "N/A"}</p>
            <p><strong>Carrier:</strong> {order.orderDetails?.delivery?.carrier || "N/A"}</p>

            <h3>Delivery Address</h3>
            <p>{order.deliveryAddress?.address || "No Address"}</p>

            <h3>Items Ordered ({order.items?.length || 0} Items)</h3>
            <ul>
                {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                        <li key={index}>
                            <img src={item.cartFoodImage} alt={item.cartFoodName} className="item-img" />
                            <div>
                                <p>{item.cartFoodName} - ₹{item.cartFoodAmount}</p>
                                <p>Quantity: {item.cartQuantity || item.cartFoodQuantity}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No items found.</p>
                )}
            </ul>

            <h3>Totals</h3>
            <p><strong>Subtotal:</strong> ₹{order.totals?.subtotal?.toFixed(2) || "0.00"}</p>
            <p><strong>Tax:</strong> ₹{order.totals?.tax?.toFixed(2) || "0.00"}</p>
            <p><strong>Shipping:</strong> ₹{order.totals?.shipping?.toFixed(2) || "0.00"}</p>
            <p><strong>Discount:</strong> ₹{order.totals?.discount?.toFixed(2) || "0.00"}</p>
            <p><strong>Total:</strong> ₹{order.totals?.total?.toFixed(2) || "0.00"}</p>

            <div className="help-container">
                <button onClick={handleCallSupport} className="help-btn">Call Support</button>
                <button onClick={handleEmailSupport} className="help-btn">Email Support</button>
            </div>
        </div>
    );
};

export default OrderDetailsPage;