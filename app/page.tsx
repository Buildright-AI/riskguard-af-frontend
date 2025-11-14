"use client";

import React, { useContext } from "react";

import { RouterContext } from "./components/contexts/RouterContext";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import DataPage from "./pages/DataPage";
import CollectionPage from "./pages/CollectionPage";
import SettingsPage from "./pages/SettingsPage";
import EvalPage from "./pages/EvalPage";
import FeedbackPage from "./pages/FeedbackPage";
import DisplayPage from "./pages/DisplayPage";
import { ToastContext } from "./components/contexts/ToastContext";
import ConfirmationModal from "./components/dialog/ConfirmationModal";
import { useOrganization } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/utils/checkIsAdmin";

export default function Home() {
  const { currentPage } = useContext(RouterContext);
  const { isConfirmModalOpen } = useContext(ToastContext);
  const { organization, isLoaded } = useOrganization();

  const isAdmin = isLoaded ? checkIsAdmin(organization) : false;

  return (
    <>
      {isConfirmModalOpen && <ConfirmationModal />}

      {currentPage === "dashboard" && <DashboardPage />}
      {currentPage === "chat" && <ChatPage />}

      {isAdmin && (
        <>
          {currentPage === "data" && <DataPage />}
          {currentPage === "collection" && <CollectionPage />}
          {currentPage === "settings" && <SettingsPage />}
          {currentPage === "eval" && <EvalPage />}
          {currentPage === "feedback" && <FeedbackPage />}
          {currentPage === "display" && <DisplayPage />}
        </>
      )}
    </>
  );
}
