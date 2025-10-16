"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorBackground: "#242424",
            colorInputBackground: "#2d2d2d",
            colorPrimary: "#5eb97e",
            colorText: "#f2f2f2",
            colorTextSecondary: "#808080",
            colorNeutral: "#808080",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "shadow-xl border border-[rgba(128,128,128,0.15)]",
            rootBox: "shadow-xl",
          },
        }}
      />
    </div>
  );
}
