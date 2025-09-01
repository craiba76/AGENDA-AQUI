import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
      {user ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Bem-vindo, {user.email}</h2>
          <button onClick={handleLogout} className="w-full bg-red-500 text-white px-4 py-2 rounded-md">
            Sair
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded-md"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md">
            {isRegister ? "Cadastrar" : "Entrar"}
          </button>
          <p
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-gray-600 cursor-pointer text-center mt-2"
          >
            {isRegister ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
          </p>
        </form>
      )}
    </div>
  );
}
