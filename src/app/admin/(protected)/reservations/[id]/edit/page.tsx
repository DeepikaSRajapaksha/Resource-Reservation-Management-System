import { notFound } from "next/navigation";
import ReservationForm from "@/components/reservations/ReservationForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditReservationPage({ params }: Props) {
  const { id } = await params;
  const reservationId = Number(id);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    notFound();
  }

  return (
    <main style={{ padding: "32px" }}>
      <h1>Edit Reservation</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Update the reservation details below.
      </p>

      <ReservationForm reservationId={reservationId} />
    </main>
  );
}