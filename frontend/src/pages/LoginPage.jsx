// frontend/src/pages/LoginPage.jsx
import React, { useContext, useState } from "react";
import { useForm }      from "react-hook-form";
import { yupResolver }  from "@hookform/resolvers/yup";
import * as yup         from "yup";
import { useNavigate }  from "react-router-dom";
import { AuthContext }  from "../contexts/AuthContext";

// Schemas de validación
const loginSchema = yup.object({
  username: yup.string().required("El usuario es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});
const signupSchema = yup.object({
  username: yup.string().required("El usuario es obligatorio"),
  email:    yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register: contextRegister } = useContext(AuthContext);
  const [mode, setMode] = useState("login"); // "login" o "signup"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(mode === "login" ? loginSchema : signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      if (mode === "login") {
        await login(data.username, data.password);
      } else {
        await contextRegister(data.username, data.email, data.password);
      }
      navigate("/trips", { replace: true });
    } catch (err) {
      alert(err.message || "Algo ha fallado. Comprueba los datos.");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/images/hero-adventure.png')] bg-cover bg-center flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex mb-6 space-x-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              mode === "login"
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              mode === "signup"
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-800 font-medium mb-1">Usuario</label>
            <input
              type="text"
              {...register("username")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-gray-800 font-medium mb-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-800 font-medium mb-1">Contraseña</label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-40"
          >
            {isSubmitting
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}


