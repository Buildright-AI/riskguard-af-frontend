/* eslint-disable */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToastContext } from "./ToastContext";
import { useOrganization, useAuth } from "@clerk/nextjs";
import { ADMIN_ONLY_PAGES, VALID_PAGES } from "@/lib/constants/adminPages";
import { checkIsAdmin } from "@/lib/utils/checkIsAdmin";
import { getCurrentParams, navigateToPage } from "@/lib/utils/routerUtils";

export const RouterContext = createContext<{
  currentPage: string;
  changePage: (
    page: string,
    params?: Record<string, any>,
    replace?: boolean,
    guarded?: boolean
  ) => void;
}>({
  currentPage: "chat",
  changePage: () => {},
});

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<string>("chat");

  const { showConfirmModal } = useContext(ToastContext);
  const { isLoaded, orgId } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const searchParams = useSearchParams();

  const isLoading = !isLoaded || !orgLoaded;
  const isAdmin = isLoading ? false : checkIsAdmin(organization);

  const redirectToChat = () => {
    const params = getCurrentParams(searchParams);
    navigateToPage("chat", params, true);
    setCurrentPage("chat");
  };

  const changePageFunction = (
    page: string,
    params: Record<string, any> = {},
    replace: boolean = false
  ) => {
    const finalParams = replace
      ? params
      : { ...getCurrentParams(searchParams), ...params };

    navigateToPage(page, finalParams, replace);
  };

  const changePage = (
    page: string,
    params: Record<string, any> = {},
    replace: boolean = false,
    guarded: boolean = false
  ) => {
    // Check if page requires admin access
    if (!isLoading && ADMIN_ONLY_PAGES.includes(page as any) && !isAdmin) {
      showConfirmModal(
        "Access Denied",
        "You do not have permission to access this page. This page is only available to administrators.",
        redirectToChat
      );
      return;
    }

    if (guarded) {
      showConfirmModal(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave this page? You will lose your changes.",
        () => changePageFunction(page, params, replace)
      );
      return;
    }

    changePageFunction(page, params, replace);
  };

  useEffect(() => {
    // Don't validate pages while authorization is loading
    if (isLoading) return;

    const pageParam = searchParams.get("page");

    // If no page parameter exists, redirect to chat
    if (!pageParam) {
      redirectToChat();
      return;
    }

    // Validate page parameter against known pages
    const validatedPage = VALID_PAGES.includes(pageParam as any)
      ? pageParam
      : "chat";

    // Check if user is trying to access admin-only page without permission
    const isUnauthorizedAccess =
      ADMIN_ONLY_PAGES.includes(validatedPage as any) && !isAdmin;

    // Redirect to chat if invalid page or unauthorized access
    if (pageParam !== validatedPage || isUnauthorizedAccess) {
      redirectToChat();
      return;
    }

    setCurrentPage(validatedPage);
  }, [searchParams, isAdmin, isLoading]);

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        changePage,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};
