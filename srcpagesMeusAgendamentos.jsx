import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function MeusAgendamentos() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newService, setNewService] = useState("");
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = async (id) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await deleteDoc(doc(db, "bookings", id));
        // Notificação WhatsApp de cancelamento
        await fetch("http://localhost:3000/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ service: "Cancelado", date: "Cancelamento" }),
        });
        alert("❌ Agendamento cancelado e notificação enviada!");
      } catch (error) {
        alert("Erro ao cancelar: " + error.message);
      }
    }
  };

  const startEditing = (booking) => {
    setEditingId(booking.id);
    setNewService(booking.service);
    setNewDate(booking.date?.toDate().toISOString().split("T")[0]);
  };

  const handleUpdate = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        service: newService,
        date: new Date(newDate),
      });
      // Notificação WhatsApp de edição
      await fetch("http://localhost:3000/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: newService, date: newDate }),
      });
      alert("✅ Agendamento atualizado e notificação enviada!");
      setEditingId(null);
      setNewService("");
      setNewDate("");
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 mt-10 text-center">
        <h2 className="text-lg font-semibold">⚠️ Acesso restrito</h2>
        <p className="text-gray-600">Faça login para ver seus agendamentos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-bold mb-4">📅 Meus Agendamentos</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">Você ainda não fez nenhum agendamento.</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {bookings.map((booking) => (
            <li key={booking.id} className="py-3">
              {editingId === booking.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="border p-2 rounded-md"
                  />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="border p-2 rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(booking.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Serviço: {booking.service}</p>
                    <p>Data: {booking.date?.toDate().toLocaleDateString("pt-BR")}</p>
                    <p className="text-sm text-gray-500">
                      Criado em: {booking.createdAt?.toDate().toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(booking)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
