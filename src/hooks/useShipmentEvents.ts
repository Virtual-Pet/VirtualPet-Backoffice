"use client";

import { useEffect, useRef } from "react";
import {
  backofficeService,
  type ShipmentEventHandlers,
} from "@/lib/services/backoffice";

/**
 * Subscribes to live shipment status changes for as long as the component is
 * mounted and a token is present. Handlers are read through a ref so the
 * subscription isn't torn down and rebuilt every render.
 */
export function useShipmentEvents(
  token: string | null | undefined,
  handlers: ShipmentEventHandlers,
  orderId?: string,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!token) return;
    return backofficeService.subscribeShipmentEvents(
      {
        onUpdate: (e) => handlersRef.current.onUpdate(e),
        onConnected: () => handlersRef.current.onConnected?.(),
        onDisconnected: (err) => handlersRef.current.onDisconnected?.(err),
      },
      { token, orderId },
    );
  }, [token, orderId]);
}
