import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { useEffect } from "react";


const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Navigation hook

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setErrorMessage("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            navigate("/home", { replace: true }); // Replace history entry
        } catch (error) {
            setErrorMessage("Invalid email or password. Please try again.");
        }
        setLoading(false);
    };



    useEffect(() => {
        const disableBack = () => {
            window.history.pushState(null, "", window.location.href);
        };
    
        disableBack(); // Push new history state
    
        window.addEventListener("popstate", () => {
            window.history.pushState(null, "", window.location.href);
        });
    
        return () => {
            window.removeEventListener("popstate", disableBack);
        };
    }, []);
    
    


    return (
        <div className="container">
            <h2>Welcome Back</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group">
                    <FiMail />
                    <input type="email" {...register("email")} placeholder="Enter email" />
                </div>
                <p className="error-message">{errors.email?.message}</p>

                <div className="input-group">
                    <FiLock />
                    <input type="password" {...register("password")} placeholder="Enter password" />
                </div>
                <p className="error-message">{errors.password?.message}</p>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
