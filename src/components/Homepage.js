import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./home.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                if (!usersSnapshot.empty) {
                    const firstUser = usersSnapshot.docs[0].id; // Get first user ID
                    setUserId(firstUser);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true); // Show the modal
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        navigate("/");
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <ul>
                    <li>Home</li>
                    <li onClick={() => navigate("/categories")}>Categories</li>
                    <li
                        onClick={() => userId && navigate(`/users/${userId}/orders`)}
                        className={userId ? "" : "disabled"}
                    >
                        Orders
                    </li>
                    <li onClick={() => navigate("/users")}>Users</li>
                    <li onClick={handleLogoutClick} className="logout">Logout</li>
                </ul>
            </nav>
            <div className="content">
                <h1>Welcome to the Dashboard</h1>
                <p>Manage your store efficiently.</p>
            </div>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmLogout} className="confirm-btn">Yes</button>
                            <button onClick={cancelLogout} className="cancel-btn">No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;