import { useState } from "react";
import AuthForm from "./components/AuthForm";
import BookingForm from "./components/BookingForm";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import { auth } from "./firebase";

function App() {
  const [tab, setTab] = useState("agendar");

  return (
    <div className="min-h-screen bg-gray-100 flex
