
import UserNavbar from "@/components/layout/UserNavbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <UserNavbar />
      <main>{children}</main>
    </>
  );
}
