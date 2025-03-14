import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import "./users.css";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState(null); // Track user being edited
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");
                const usersSnapshot = await getDocs(collection(db, "users"));
                const userList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log("Fetched users:", userList);
                setUsers(userList);
                setFilteredUsers(userList);
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.phoneNumber?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredUsers(filtered);
        console.log("Filtered users:", filtered);
    }, [search, users]);

    const handleBack = () => {
        navigate("/home");
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user }); // Copy user data to edit
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const userRef = doc(db, "users", editingUser.id);
            await updateDoc(userRef, {
                name: editingUser.name,
                address: editingUser.address,
                phoneNumber: editingUser.phoneNumber,
                role: editingUser.role
            });
            const updatedUsers = users.map(u =>
                u.id === editingUser.id ? { ...u, ...editingUser } : u
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(user =>
                user.phoneNumber?.toLowerCase().includes(search.toLowerCase())
            ));
            setEditingUser(null);
            alert("User updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Failed to update user: " + error.message);
        }
    };

    const handleDelete = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        try {
            const userRef = doc(db, "users", userId);
            await deleteDoc(userRef);
            const updatedUsers = users.filter(u => u.id !== userId);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(user =>
                user.phoneNumber?.toLowerCase().includes(search.toLowerCase())
            ));
            alert("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user: " + error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingUser(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="users-container">
            <h2>All Users</h2>
            <input
                type="text"
                placeholder="Search by phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />
            {loading ? (
                <p>Loading users...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : filteredUsers.length > 0 ? (
                <div className="users-list">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="user-item">
                            {editingUser && editingUser.id === user.id ? (
                                <form onSubmit={handleUpdate} className="edit-form">
                                    <p>
                                        <strong>User ID:</strong> {user.id}
                                    </p>
                                    <label>
                                        Name:
                                        <input
                                            type="text"
                                            name="name"
                                            value={editingUser.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                    <label>
                                        Address:
                                        <input
                                            type="text"
                                            name="address"
                                            value={editingUser.address || ""}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                    <label>
                                        Phone Number:
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={editingUser.phoneNumber || ""}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                    <label>
                                        Role:
                                        <input
                                            type="text"
                                            name="role"
                                            value={editingUser.role || ""}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                    <div className="form-buttons">
                                        <button type="submit" className="save-btn">Save</button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingUser(null)}
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <p><strong>User ID:</strong> {user.id}</p>
                                    <p><strong>Name:</strong> {user.name || "N/A"}</p>
                                    <p><strong>Address:</strong> {user.address || "N/A"}</p>
                                    <p><strong>Phone Number:</strong> {user.phoneNumber || "N/A"}</p>
                                    <p><strong>Role:</strong> {user.role || "N/A"}</p>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No users found. {search ? "Try adjusting your search." : ""}</p>
            )}
            <button onClick={handleBack} className="back-btn">Back to Dashboard</button>
        </div>
    );
};

export default UsersPage;