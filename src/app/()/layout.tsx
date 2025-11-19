import React from "react";
import Shell from "@/components/Shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
            <Shell>{children}</Shell>
      </body>
    </html>
  );
}
