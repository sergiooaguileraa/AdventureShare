// frontend/src/pages/LoginPage.jsx

import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

// ——————————————————————————
// Schemas de validación con Yup
// ——————————————————————————

const loginSchema = yup.object({
  username: yup.string().required("El usuario es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const signupSchema = yup.object({
  username: yup.string().required("El usuario es obligatorio"),
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register: contextRegister } = useContext(AuthContext);

  // Modo: "login" o "signup"
  const [mode, setMode] = useState("login");

  // Mensaje de error genérico (backend) para mostrar "Contraseña incorrecta", "Usuario no existe", etc.
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(mode === "login" ? loginSchema : signupSchema),
  });

  // Cambiar de modo ("login" ↔ "signup") y limpiar mensaje de error
  const switchMode = (newMode) => {
    setMode(newMode);
    setAuthError("");
  };

  const onSubmit = async (data) => {
    setAuthError("");
    try {
      if (mode === "login") {
        // Llamamos a la función login del AuthContext
        await login(data.username, data.password);
      } else {
        // Llamamos a la función register del AuthContext
        await contextRegister(data.username, data.email, data.password);
      }
      // Si todo va bien, redirigimos a /trips
      navigate("/trips", { replace: true });
    } catch (err) {
      // Si el backend devuelve un JSON con { detail: "Mensaje..." }, lo usamos:
      const detail = err.response?.data?.detail || err.message;
      setAuthError(detail);
    }
  };

  return (
    <div
      className="min-h-screen bg-[url('/images/hero-adventure.png')] 
                  bg-cover bg-center flex items-center justify-center"
    >
      {/* Overlap oscuro */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenedor principal del form */}
      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm 
                      rounded-xl shadow-xl w-full max-w-md p-6 mx-4">

        {/* Botones para elegir modo */}
        <div className="flex mb-6 space-x-2">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              mode === "login"
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              mode === "signup"
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Si authError tiene texto, lo mostramos en rojo */}
        {authError && (
          <p className="text-red-600 text-center mb-4">{authError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Usuario
            </label>
            <input
              type="text"
              {...register("username")}
              className="w-full border border-gray-300 rounded px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Solo en modo “signup” mostramos Email */}
          {mode === "signup" && (
            <div>
              <label className="block text-gray-800 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full border border-gray-300 rounded px-3 py-2 
                           focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* Campo Contraseña */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-gray-300 rounded px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-2 
                       rounded-lg hover:bg-primary/90 transition disabled:opacity-40"
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


