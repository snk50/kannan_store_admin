import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { db } from "../config/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./categories.css";

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        photoUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [adding, setAdding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const querySnapshot = await getDocs(collection(db, "products/categories/items"));
                const categoryList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/products/${categoryId}`, { state: { categoryName } });
    };

    const handleAddCategoryClick = () => {
        setNewCategory({ name: '', photoUrl: '' });
        setErrors({});
        setShowAddDialog(true);
    };

    const validateFields = (category) => {
        const newErrors = {};
        if (!category.name.trim()) newErrors.name = "Category name is required";
        if (!category.photoUrl.trim()) newErrors.photoUrl = "Photo URL is required";
        return newErrors;
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();

        const validationErrors = validateFields(newCategory);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setAdding(true);
            const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '-'); // Generate ID from name
            const categoryRef = doc(db, "products/categories/items", categoryId);
            const categoryData = {
                name: newCategory.name,
                photoUrl: newCategory.photoUrl
            };

            await setDoc(categoryRef, categoryData);

            setCategories([...categories, { id: categoryId, ...categoryData }]);
            setShowAddDialog(false);
            setNewCategory({ name: '', photoUrl: '' });
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Error adding category. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    const handleCancel = () => {
        setShowAddDialog(false);
        setNewCategory({ name: '', photoUrl: '' });
        setErrors({});
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2>Categories</h2>
                <button
                    onClick={handleAddCategoryClick}
                    className="add-category-button"
                >
                    Add Category
                </button>
                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="loader" />
                    </div>
                ) : (
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id, category.name)}
                                className="category-card"
                            >
                                <span>{category.name}</span>
                                <img src={category.photoUrl} alt={category.name} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Dialog */}
            {showAddDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">Add New Category</div>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label className="form-label">Category Name *</label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="form-input"
                                    placeholder="Category Name"
                                />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo URL *</label>
                                <input
                                    type="text"
                                    value={newCategory.photoUrl}
                                    onChange={(e) => setNewCategory({ ...newCategory, photoUrl: e.target.value })}
                                    className="form-input"
                                    placeholder="Photo URL"
                                />
                                {errors.photoUrl && <span className="text-red-500 text-sm">{errors.photoUrl}</span>}
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-cancel"
                                    disabled={adding}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={adding}
                                >
                                    {adding ? "Adding..." : "Add Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;