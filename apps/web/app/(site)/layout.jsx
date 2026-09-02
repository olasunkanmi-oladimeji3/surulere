import V2Nav from "@/components/v2/V2Nav";
import V2Footer from "@/components/v2/V2Footer";

export const metadata = {
  title: "Surulere LG — v2 concept portal",
  description:
    "A concept redesign of a government portal for Surulere Local Government, Lagos — history, leadership, departments, wards and CDAs.",
};

export default function V2Layout({ children }) {
  return (
    <div className="v2-root min-h-screen flex flex-col">
      <V2Nav />
      <main className="flex-1">{children}</main>
      <V2Footer />
    </div>
  );
}
