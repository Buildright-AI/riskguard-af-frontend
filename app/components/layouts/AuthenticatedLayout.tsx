"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import SidebarComponent from "../navigation/SidebarComponent";
import { SessionProvider } from "../contexts/SessionContext";
import { CollectionProvider } from "../contexts/CollectionContext";
import { ConversationProvider } from "../contexts/ConversationContext";
import { SocketProvider } from "../contexts/SocketContext";
import { EvaluationProvider } from "../contexts/EvaluationContext";
import { ToastProvider } from "../contexts/ToastContext";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RouterProvider } from "../contexts/RouterContext";
import { ProcessingProvider } from "../contexts/ProcessingContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  // For auth pages, render them immediately
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For protected pages, prevent rendering until authenticated
  // The middleware will handle redirecting to /sign-in
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex flex-col w-screen h-screen items-center justify-center">
        <p className="text-primary text-xl shine">Loading...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <RouterProvider>
        <SessionProvider>
          <CollectionProvider>
            <ConversationProvider>
              <SocketProvider>
                <EvaluationProvider>
                  <ProcessingProvider>
                    <SidebarProvider>
                      <SidebarComponent />
                      <main className="flex flex-1 min-w-0 flex-col md:flex-row w-full gap-2 md:gap-6 items-start justify-start p-2 md:p-6 overflow-hidden">
                        <SidebarTrigger className="lg:hidden flex text-secondary hover:text-primary hover:bg-foreground_alt z-50" />
                        {children}
                      </main>
                    </SidebarProvider>
                  </ProcessingProvider>
                  <Toaster />
                </EvaluationProvider>
              </SocketProvider>
            </ConversationProvider>
          </CollectionProvider>
        </SessionProvider>
      </RouterProvider>
    </ToastProvider>
  );
}
