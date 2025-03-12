"use client"

import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { db } from "../config/firebase"
import { collection, getDocs, doc, updateDoc, deleteField, getDoc, setDoc } from "firebase/firestore"
import "./products.css"

const ProductsPage = () => {
    const { categoryId } = useParams()
    const location = useLocation()
    const categoryName = location.state?.categoryName || "Products"

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        totalStocks: '',
        photoUrl: '',
        discount: '',
        categoryId: categoryId,
        isWishlist: false,
        itemId: '',
        quantity: '1',
        type: 'Piece' // Default value for dropdown
    })
    const [errors, setErrors] = useState({})
    const [updating, setUpdating] = useState(false)
    const [adding, setAdding] = useState(false)

    // Dropdown options for type
    const typeOptions = ["Piece", "Solid", "Liquid", "Pack"]

    useEffect(() => {
        fetchProducts()
    }, [categoryId])

    const fetchProducts = async () => {
        if (!categoryId) {
            console.error("Invalid category ID")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const itemsDetailsRef = collection(
                db,
                "products",
                "categories",
                "items",
                categoryName.toLowerCase(),
                "itemsDetails"
            )

            const querySnapshot = await getDocs(itemsDetailsRef)
            const itemList = []

            querySnapshot.forEach((document) => {
                const data = document.data()
                Object.entries(data).forEach(([itemKey, itemData]) => {
                    itemList.push({
                        id: document.id,
                        itemKey: itemKey,
                        ...itemData,
                    })
                })
            })

            setProducts(itemList)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (itemId, itemKey) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this item?")
        if (!confirmDelete) return

        try {
            const docRef = doc(db, "products", "categories", "items", categoryName.toLowerCase(), "itemsDetails", itemId)
            const updateData = {}
            updateData[itemKey] = deleteField()
            await updateDoc(docRef, updateData)
            setProducts(products.filter((item) => !(item.id === itemId && item.itemKey === itemKey)))
        } catch (error) {
            console.error("Error deleting item:", error)
        }
    }

    const handleEdit = (item) => {
        setEditingItem({ ...item })
        setShowUpdateDialog(true)
    }

    const handleUpdate = async (event) => {
        event.preventDefault()
        if (!editingItem) return

        try {
            setUpdating(true)
            const itemRef = doc(db, "products", "categories", "items", categoryName.toLowerCase(), "itemsDetails", editingItem.id)
            const updateData = {}
            updateData[editingItem.itemKey] = {
                name: editingItem.name,
                description: editingItem.description,
                price: parseFloat(editingItem.price),
                totalStocks: parseInt(editingItem.totalStocks),
                photoUrl: editingItem.photoUrl || "",
                discount: parseFloat(editingItem.discount) || 0,
                cartQuantity: parseInt(editingItem.cartQuantity) || 0,
                categoryId: editingItem.categoryId || categoryId,
                isWishlist: editingItem.isWishlist || false,
                itemId: editingItem.itemId,
                quantity: parseInt(editingItem.quantity) || 1,
                type: editingItem.type || "Piece"
            }

            await updateDoc(itemRef, updateData)

            setProducts(products.map(product =>
                (product.id === editingItem.id && product.itemKey === editingItem.itemKey)
                    ? { ...product, ...updateData[editingItem.itemKey] }
                    : product
            ))

            setShowUpdateDialog(false)
            setEditingItem(null)
        } catch (error) {
            console.error("Error updating item:", error)
            alert("Error updating product. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleCancel = () => {
        setShowUpdateDialog(false)
        setEditingItem(null)
    }

    const handleAddProductClick = () => {
        setNewProduct({
            name: '',
            description: '',
            price: '',
            totalStocks: '',
            photoUrl: '',
            discount: '',
            categoryId: categoryId,
            isWishlist: false,
            itemId: '',
            quantity: '1',
            type: 'Piece'
        })
        setErrors({})
        setShowAddDialog(true)
    }

    const validateFields = (product) => {
        const newErrors = {}
        if (!product.name.trim()) newErrors.name = "Product name is required"
        if (!product.price || product.price <= 0) newErrors.price = "Valid price is required"
        if (!product.totalStocks || product.totalStocks < 0) newErrors.totalStocks = "Valid stock quantity is required"
        if (product.discount && (product.discount < 0 || product.discount > 100)) newErrors.discount = "Discount must be between 0 and 100"
        if (!product.itemId.trim()) newErrors.itemId = "Item ID is required"
        if (!product.quantity || product.quantity < 1) newErrors.quantity = "Valid quantity is required"
        if (!product.type) newErrors.type = "Type is required" // Updated to check for falsy value
        return newErrors
    }

    const handleAddProduct = async (event) => {
        event.preventDefault()

        const validationErrors = validateFields(newProduct)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            setAdding(true)
            const itemsDetailsRef = doc(
                db,
                "products",
                "categories",
                "items",
                categoryName.toLowerCase(),
                "itemsDetails",
                categoryId
            )

            const newItemKey = `item_${Date.now()}`
            const newProductData = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                totalStocks: parseInt(newProduct.totalStocks),
                photoUrl: newProduct.photoUrl || "",
                discount: parseFloat(newProduct.discount) || 0,
                cartQuantity: 0,
                categoryId: newProduct.categoryId,
                isWishlist: newProduct.isWishlist,
                itemId: newProduct.itemId,
                quantity: parseInt(newProduct.quantity),
                type: newProduct.type
            }

            const docSnapshot = await getDoc(itemsDetailsRef)
            if (docSnapshot.exists()) {
                await updateDoc(itemsDetailsRef, {
                    [newItemKey]: newProductData
                })
            } else {
                await setDoc(itemsDetailsRef, {
                    [newItemKey]: newProductData
                })
            }

            setProducts([...products, {
                id: categoryId,
                itemKey: newItemKey,
                ...newProductData
            }])

            setShowAddDialog(false)
            setNewProduct({
                name: '',
                description: '',
                price: '',
                totalStocks: '',
                photoUrl: '',
                discount: '',
                categoryId: categoryId,
                isWishlist: false,
                itemId: '',
                quantity: '1',
                type: 'Piece'
            })
        } catch (error) {
            console.error("Error adding product:", error)
            alert("Error adding product. Please try again.")
        } finally {
            setAdding(false)
        }
    }

    const handleAddCancel = () => {
        setShowAddDialog(false)
        setNewProduct({
            name: '',
            description: '',
            price: '',
            totalStocks: '',
            photoUrl: '',
            discount: '',
            categoryId: categoryId,
            isWishlist: false,
            itemId: '',
            quantity: '1',
            type: 'Piece'
        })
        setErrors({})
    }

    return (
        <div className="products-container">
            <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
            <button
                onClick={handleAddProductClick}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mb-6"
            >
                Add Product
            </button>

            {loading ? (
                <div className="loader-container">
                    <Loader2 className="loader" />
                </div>
            ) : (
                <div className="items-grid">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={`${product.id}-${product.itemKey}`} className="item-card">
                                {product.photoUrl && (
                                    <img src={product.photoUrl || "/placeholder.svg"} alt={product.name} className="item-card-img" />
                                )}
                                <h3>{product.name}</h3>
                                <p>{product.description || "No description available"}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold">${Number.parseFloat(product.price).toFixed(2)}</span>
                                    <span className="text-gray-500">Stock: {product.totalStocks}</span>
                                </div>
                                {product.discount > 0 && (
                                    <div className="text-green-600 text-sm mt-1">Discount: {product.discount}%</div>
                                )}
                                {product.cartQuantity > 0 && (
                                    <div className="text-blue-600 text-sm mt-1">In Cart: {product.cartQuantity}</div>
                                )}
                                <div className="flex mt-4 gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, product.itemKey)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-items">No products found in this category.</div>
                    )}
                </div>
            )}

            {/* Update Dialog */}
            {showUpdateDialog && editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">Update Product</div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input
                                    type="text"
                                    value={editingItem.name || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="form-input"
                                    placeholder="Product Name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Item ID *</label>
                                <input
                                    type="text"
                                    value={editingItem.itemId || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, itemId: e.target.value })}
                                    className="form-input"
                                    placeholder="Item ID"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={editingItem.description || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="form-textarea"
                                    placeholder="Description"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-col">
                                    <div className="form-group">
                                        <label className="form-label">Price ($)</label>
                                        <input
                                            type="number"
                                            value={editingItem.price || 0}
                                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                            className="form-input"
                                            placeholder="Price"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-col">
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input
                                            type="number"
                                            value={editingItem.totalStocks || 0}
                                            onChange={(e) => setEditingItem({ ...editingItem, totalStocks: e.target.value })}
                                            className="form-input"
                                            placeholder="Total Stocks"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount (%)</label>
                                <input
                                    type="number"
                                    value={editingItem.discount || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, discount: e.target.value })}
                                    className="form-input"
                                    placeholder="Discount"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo URL</label>
                                <input
                                    type="text"
                                    value={editingItem.photoUrl || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, photoUrl: e.target.value })}
                                    className="form-input"
                                    placeholder="Photo URL"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    value={editingItem.quantity || 1}
                                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                                    className="form-input"
                                    placeholder="Quantity"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type *</label>
                                <select
                                    value={editingItem.type || "Piece"}
                                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    {typeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Wishlist</label>
                                <input
                                    type="checkbox"
                                    checked={editingItem.isWishlist || false}
                                    onChange={(e) => setEditingItem({ ...editingItem, isWishlist: e.target.checked })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-cancel"
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={updating}
                                >
                                    {updating ? "Updating..." : "Update Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Product Dialog */}
            {showAddDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">Add New Product</div>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="form-input"
                                    placeholder="Product Name"
                                />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Item ID *</label>
                                <input
                                    type="text"
                                    value={newProduct.itemId}
                                    onChange={(e) => setNewProduct({ ...newProduct, itemId: e.target.value })}
                                    className="form-input"
                                    placeholder="Item ID"
                                />
                                {errors.itemId && <span className="text-red-500 text-sm">{errors.itemId}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="form-textarea"
                                    placeholder="Description"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-col">
                                    <div className="form-group">
                                        <label className="form-label">Price ($) *</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="form-input"
                                            placeholder="Price"
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                                    </div>
                                </div>
                                <div className="form-col">
                                    <div className="form-group">
                                        <label className="form-label">Stock *</label>
                                        <input
                                            type="number"
                                            value={newProduct.totalStocks}
                                            onChange={(e) => setNewProduct({ ...newProduct, totalStocks: e.target.value })}
                                            className="form-input"
                                            placeholder="Total Stocks"
                                            min="0"
                                        />
                                        {errors.totalStocks && <span className="text-red-500 text-sm">{errors.totalStocks}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount (%)</label>
                                <input
                                    type="number"
                                    value={newProduct.discount}
                                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                                    className="form-input"
                                    placeholder="Discount"
                                    min="0"
                                    max="100"
                                />
                                {errors.discount && <span className="text-red-500 text-sm">{errors.discount}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo URL</label>
                                <input
                                    type="text"
                                    value={newProduct.photoUrl}
                                    onChange={(e) => setNewProduct({ ...newProduct, photoUrl: e.target.value })}
                                    className="form-input"
                                    placeholder="Photo URL"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    value={newProduct.quantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                    className="form-input"
                                    placeholder="Quantity"
                                    min="1"
                                />
                                {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type *</label>
                                <select
                                    value={newProduct.type}
                                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    {typeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && <span className="text-red-500 text-sm">{errors.type}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Wishlist</label>
                                <input
                                    type="checkbox"
                                    checked={newProduct.isWishlist}
                                    onChange={(e) => setNewProduct({ ...newProduct, isWishlist: e.target.checked })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleAddCancel}
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
                                    {adding ? "Adding..." : "Add Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsPage