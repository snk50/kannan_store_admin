import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {db} from "../config/firebase"; // Firestore instance
import {collection, getDocs} from "firebase/firestore";
import "./home.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");

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

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <ul>
                    <li>Home</li>
                    <li onClick={() => navigate("/categories")}>Categories</li>
                    <li
                        onClick={() => userId && navigate(`/users/${userId}/orders`)}
                        className={userId ? "" : "disabled"} // Disable if userId is empty
                    >
                        Orders
                    </li>
                    <li>Users</li>
                    <li onClick={handleLogout} className="logout">Logout</li>
                </ul>
            </nav>
            <div className="content">
                <h1>Welcome to the Dashboard</h1>
                <p>Manage your store efficiently.</p>
            </div>
        </div>
    );
};

export default HomePage;
