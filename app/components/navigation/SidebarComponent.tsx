"use client";

import React, { useContext, useEffect, useState } from "react";

import { SocketContext } from "../contexts/SocketContext";

import { MdChatBubbleOutline } from "react-icons/md";
import { GoDatabase } from "react-icons/go";
import { AiOutlineExperiment } from "react-icons/ai";
import { FaCircle } from "react-icons/fa6";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";

import HomeSubMenu from "@/app/components/navigation/HomeSubMenu";
import DataSubMenu from "@/app/components/navigation/DataSubMenu";
import EvalSubMenu from "@/app/components/navigation/EvalSubMenu";

import { useUser, useClerk, useOrganization } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { checkIsAdmin } from "@/lib/utils/checkIsAdmin";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingsSubMenu from "./SettingsSubMenu";
import { RouterContext } from "../contexts/RouterContext";
import { CollectionContext } from "../contexts/CollectionContext";
import { SessionContext } from "../contexts/SessionContext";
import { ToastContext } from "../contexts/ToastContext";
import packageJson from "../../../package.json";

const SidebarComponent: React.FC = () => {
  const { socketOnline } = useContext(SocketContext);
  const { changePage, currentPage } = useContext(RouterContext);
  const { collections, loadingCollections } = useContext(CollectionContext);
  const { unsavedChanges } = useContext(SessionContext);
  const { showConfirmModal } = useContext(ToastContext);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { organization, isLoaded } = useOrganization();

  console.log('[SidebarComponent] isLoaded:', isLoaded, 'organization:', organization);

  // Wait for organization to load before checking admin
  const isAdmin = isLoaded ? checkIsAdmin(organization) : false;

  const [items, setItems] = useState<
    {
      title: string;
      mode: string[];
      icon: React.ReactNode;
      warning?: boolean;
      loading?: boolean;
      onClick: () => void;
    }[]
  >([]);

  useEffect(() => {
    // Always show Chat section
    const _items: {
      title: string;
      mode: string[];
      icon: React.ReactNode;
      warning?: boolean;
      loading?: boolean;
      onClick: () => void;
    }[] = [
      {
        title: "Chat",
        mode: ["chat"],
        icon: <MdChatBubbleOutline />,
        onClick: () => changePage("chat", {}, true, unsavedChanges),
      },
    ];

    // Only add admin sections if user is admin
    if (isAdmin) {
      _items.push(
        {
          title: "Data",
          mode: ["data", "collection"],
          icon: !collections?.some((c) => c.processed === true) ? (
            <IoIosWarning className="text-warning" />
          ) : (
            <GoDatabase />
          ),
          warning: !collections?.some((c) => c.processed === true),
          loading: loadingCollections,
          onClick: () => changePage("data", {}, true, unsavedChanges),
        },
        {
          title: "Settings",
          mode: ["settings", "elysia"],
          icon: <MdOutlineSettingsInputComponent />,
          onClick: () => changePage("settings", {}, true, unsavedChanges),
        },
        {
          title: "Evaluation",
          mode: ["eval", "feedback", "display"],
          icon: <AiOutlineExperiment />,
          onClick: () => changePage("eval", {}, true, unsavedChanges),
        }
      );
    }

    setItems(_items);
  }, [collections, unsavedChanges, isAdmin, changePage, loadingCollections]);

  const openNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  const handleLogout = () => {
    showConfirmModal(
      "Sign Out",
      "Are you sure you want to sign out?",
      async () => {
        await signOut();
        window.location.reload();
      }
    );
  };

  return (
    <Sidebar className="fade-in">
      <SidebarHeader>
        <div className={`flex items-center gap-2 w-full justify-between p-2`}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-primary">RiskGuard</p>
          </div>
          <div className="flex items-center justify-center gap-1">
            {socketOnline ? (
              <FaCircle scale={0.2} className="text-lg pulsing_color w-5 h-5" />
            ) : (
              <FaCircle scale={0.2} className="text-lg pulsing w-5 h-5" />
            )}
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground">
                v{packageJson.version}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    variant={
                      item.mode.includes(currentPage)
                        ? "active"
                        : item.warning
                          ? "warning"
                          : "default"
                    }
                    onClick={item.onClick}
                  >
                    <p className="flex items-center gap-2">
                      {item.loading ? (
                        <FaCircle
                          scale={0.2}
                          className="text-lg pulsing_color"
                        />
                      ) : item.warning ? (
                        <IoIosWarning className="text-warning" />
                      ) : (
                        item.icon
                      )}
                      <span>{item.title}</span>
                    </p>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {currentPage === "chat" && <HomeSubMenu />}
        {isAdmin && (currentPage === "data" || currentPage === "collection") && (
          <DataSubMenu />
        )}
        {isAdmin &&
          (currentPage === "eval" ||
            currentPage === "feedback" ||
            currentPage === "display") && <EvalSubMenu />}
        {isAdmin && (currentPage === "settings" || currentPage === "elysia") && (
          <SettingsSubMenu />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-error transition-colors p-1"
                  title="Sign out"
                >
                  <IoLogOutOutline className="h-5 w-5" />
                </button>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton onClick={() => openNewTab("https://buildright.ai")}>
                  <p>Powered by Buildright</p>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
