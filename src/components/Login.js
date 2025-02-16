import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiMail, FiLock } from "react-icons/fi";

const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        setErrorMessage("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            alert("Login Successful!");
        } catch (error) {
            setErrorMessage("Invalid email or password. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

                {errorMessage && <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="email"
                            {...register("email")}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            placeholder="Enter email"
                        />
                        <p className="text-red-500 text-sm">{errors.email?.message}</p>
                    </div>

                    <div className="relative">
                        <FiLock className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            placeholder="Enter password"
                        />
                        <p className="text-red-500 text-sm">{errors.password?.message}</p>
                    </div>

                    <button
                        type="submit"
                        className={`w-full p-3 rounded-lg font-semibold text-white ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
