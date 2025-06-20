import { AppStore, RootState } from "@/app/store";
import { logger } from "@/utils/logger";
import {
  MessageEventPayloadDto,
  MessageEventPayloadSchema,
  MultiEventPayloadDto,
  MultiEventPayloadSchema,
  SseEventNames,
  UserEventPayloadDto,
  UserEventPayloadSchema,
} from "@blue0206/members-only-shared-types";
import { authApiSlice } from "@/app/services/authApi";
import * as Sentry from "@sentry/react";

class SseService {
  private eventSource: EventSource | null = null;
  private currentToken: string | null = null;
  private storeRef: AppStore | null = null;
  private REAUTH_TRIES = 0;
  private readonly MAX_REAUTH_TRIES = 5;

  // Initializes the SSE service with the provided store.
  initializeService(store: AppStore) {
    this.storeRef = store;
  }

  // Starts the Server-Sent Events (SSE) connection if the store is initialized
  // and the user is authenticated. Manages token refresh attempts in case of errors.
  // Handles specific SSE events and dispatches actions based on event data.
  startSseConnection(): void {
    if (!this.storeRef) {
      logger.error("SSE: Store not initialized. Cannot start SSE connection.");
      return;
    }

    if (
      this.eventSource &&
      this.eventSource.readyState !== EventSource.CLOSED
    ) {
      logger.info("SSE: Event source connection already active or connecting.");
      return;
    }

    const state: RootState = this.storeRef.getState();
    const newToken = state.auth.accessToken;

    if (!state.auth.authStatus || !newToken) {
      logger.error("SSE: User not authenticated. Cannot start SSE connection.");
      return;
    }

    if (
      this.currentToken &&
      this.currentToken !== newToken &&
      this.eventSource
    ) {
      logger.info("SSE: Access token changed. Restarting connection....");
      this.eventSource.close();
    }
    this.currentToken = newToken;

    const sseUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/events?accessToken=${newToken}`;
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      logger.info("SSE: Connection opened.");
      this.REAUTH_TRIES = 0;
    };

    // The onerror listener does not tell us the statusCode of error or any other details.
    // Therefore it is not possible to ascertain 401 errors. To mitigate this, we try
    // refreshing the tokens a fixed number of times (5) so that if the error is because of 401,
    // the token is refreshed. If even after refresh the error persists, this is a string indicator
    // that error is not from authentication.
    this.eventSource.onerror = (errorEvent) => {
      logger.error("SSE: EventSource error occurred.", errorEvent);

      if (this.REAUTH_TRIES < this.MAX_REAUTH_TRIES && this.storeRef) {
        // We only attempt refresh if we have not reached the maximum number of reauth tries.
        logger.info("SSE: Attempting refresh.");

        this.storeRef
          .dispatch(authApiSlice.endpoints.tokenRefresh.initiate())
          .then(() => {
            logger.info("SSE: Refresh successful.");
          })
          .catch((e: unknown) => {
            logger.error(
              `SSE: Refresh unsuccessful. ${(
                this.MAX_REAUTH_TRIES -
                this.REAUTH_TRIES -
                1
              ).toString()} attempts left`,
              e
            );
          })
          .finally(() => {
            this.REAUTH_TRIES++;
          });
      } else {
        logger.error(
          "SSE: Max reauth attempts reached or store not initialized. Cannot start SSE connection."
        );
        this.stopSseConnection();
      }
    };

    // Handles incoming SSE events.
    const sseEventHandler = (
      eventName: string,
      rawEvent: MessageEvent<string>
    ) => {
      logger.info(`SSE: Event received: ${eventName}`, { data: rawEvent.data });
      if (!this.storeRef) {
        return;
      }

      try {
        const parsedData: unknown = JSON.parse(rawEvent.data);

        switch (eventName) {
          case SseEventNames.MULTI_EVENT: {
            const payload: MultiEventPayloadDto =
              MultiEventPayloadSchema.parse(parsedData);
            logger.info("SSE: MULTI_EVENT Payload received.", payload);
            break;
          }
          case SseEventNames.USER_EVENT: {
            const payload: UserEventPayloadDto =
              UserEventPayloadSchema.parse(parsedData);
            logger.info("SSE: USER_EVENT Payload received.", payload);

            break;
          }
          case SseEventNames.MESSAGE_EVENT: {
            const payload: MessageEventPayloadDto =
              MessageEventPayloadSchema.parse(parsedData);
            logger.info("SSE: MESSAGE_EVENT Payload received.", payload);

            break;
          }
          default: {
            logger.warn("SSE: Unhandled event type: ", eventName);
          }
        }
      } catch (error) {
        logger.error("SSE: Error processing event data: ", error, {
          eventName,
          data: rawEvent.data,
        });

        Sentry.captureException(error, {
          extra: {
            eventName,
            data: rawEvent.data,
          },
        });
      }
    };

    this.eventSource.addEventListener(
      SseEventNames.MULTI_EVENT,
      (e: MessageEvent<string>) => {
        sseEventHandler(SseEventNames.MULTI_EVENT, e);
      }
    );

    this.eventSource.addEventListener(
      SseEventNames.USER_EVENT,
      (e: MessageEvent<string>) => {
        sseEventHandler(SseEventNames.USER_EVENT, e);
      }
    );

    this.eventSource.addEventListener(
      SseEventNames.MESSAGE_EVENT,
      (e: MessageEvent<string>) => {
        sseEventHandler(SseEventNames.MESSAGE_EVENT, e);
      }
    );
  }

  stopSseConnection(): void {
    if (this.eventSource) {
      logger.info("SSE: Closing EventSource connection...");
      this.eventSource.close();
      this.eventSource = null;
      this.currentToken = null;
    }
  }
}

export const sseService = new SseService();
