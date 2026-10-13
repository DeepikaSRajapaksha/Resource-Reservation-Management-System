import ReservationForm from "@/components/reservations/ReservationForm";

export default function NewReservationPage() {
  return (
    <main style={{ padding: "32px" }}>
      <h1>Create New Reservation</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Enter the reservation details below.
      </p>

      <ReservationForm />
    </main>
  );
}