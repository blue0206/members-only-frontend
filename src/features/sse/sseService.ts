import { apiSlice } from "@/app/services/api";
import { AppDispatch, AppStore, RootState } from "@/app/store";
import { logger } from "@/utils/logger";
import {
  MessageEventPayloadDto,
  MessageEventPayloadSchema,
  MultiEventPayloadDto,
  MultiEventPayloadSchema,
  UserEventPayloadDto,
  UserEventPayloadSchema,
} from "@blue0206/members-only-shared-types/dtos/event.dto";
import { EventReason } from "@blue0206/members-only-shared-types/enums/eventReason.enum";
import { SseEventNames } from "@blue0206/members-only-shared-types/api/event-names";
import { Role } from "@blue0206/members-only-shared-types/enums/roles.enum";
import { addNotification } from "../notification/notificationSlice";
import { authApiSlice } from "@/app/services/authApi";
import * as Sentry from "@sentry/react";
import { clearCredentials } from "../auth/authSlice";
import { accountDeletedByAdminQuery } from "@/lib/constants";

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
      import.meta.env.VITE_SSE_BASE_URL
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

        const dispatch: AppDispatch = this.storeRef.dispatch;

        switch (eventName) {
          case SseEventNames.MULTI_EVENT: {
            const payload: MultiEventPayloadDto =
              MultiEventPayloadSchema.parse(parsedData);
            logger.info("SSE: MULTI_EVENT Payload received.", payload);

            this.handleMultiEvent(payload, state, dispatch);
            break;
          }
          case SseEventNames.USER_EVENT: {
            const payload: UserEventPayloadDto =
              UserEventPayloadSchema.parse(parsedData);
            logger.info("SSE: USER_EVENT Payload received.", payload);

            this.handleUserEvent(state, dispatch);
            break;
          }
          case SseEventNames.MESSAGE_EVENT: {
            const payload: MessageEventPayloadDto =
              MessageEventPayloadSchema.parse(parsedData);
            logger.info("SSE: MESSAGE_EVENT Payload received.", payload);

            this.handleMessageEvent(payload, state, dispatch);
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

  private handleMultiEvent(
    payload: MultiEventPayloadDto,
    state: RootState,
    dispatch: AppDispatch
  ) {
    switch (payload.reason) {
      case EventReason.ROLE_CHANGE: {
        // In this case, the ADMIN has set the role of another user.
        // There are two main tasks to perform:
        // 1. Invalidate affected RTK caches for all users receiving
        //    this event to ensure their data is fresh.
        // 2. If the user receiving this event is the affected user,
        //    then we notify the user with a toast.
        if (payload.targetId === state.auth.user?.id) {
          // For the affected user, we'd need to manually refresh
          // their token so that they can access and fetch data as per their new role.
          dispatch(authApiSlice.endpoints.tokenRefresh.initiate())
            .then(() => {
              dispatch(
                addNotification({
                  type: "info",
                  message: `Your role has been changed to ${
                    payload.targetUserRole ?? ""
                  } by @${payload.originUsername ?? ""}`,
                })
              );
            })
            .catch((e: unknown) => {
              logger.error("SSE MULTI_EVENT: Error refreshing token.", e);
            });
        }

        dispatch(
          apiSlice.util.invalidateTags(["Messages", "Users", "Bookmarks"])
        );

        break;
      }
      case EventReason.USER_DELETED_BY_ADMIN: {
        // In this case, the ADMIN has deleted a user.
        // There are two main tasks to perform:
        // 1. Invalidate affected RTK caches for all users receiving
        //    this event to ensure their data is fresh.
        // 2. If the user receiving this event is the affected user,
        //    then we cleanly log them out from the client-side.
        if (payload.targetId === state.auth.user?.id) {
          dispatch(clearCredentials());
          dispatch(apiSlice.util.resetApiState());
          Sentry.setUser(null);
          window.location.replace(`/?reason=${accountDeletedByAdminQuery}`);
          return;
        }

        dispatch(
          apiSlice.util.invalidateTags(["Messages", "Bookmarks", "Users"])
        );
        break;
      }
      default: {
        // For all other cases, we need only invalidate tags to refresh the
        // cache of users so that they can see the updated data.
        dispatch(
          apiSlice.util.invalidateTags(["Messages", "Bookmarks", "Users"])
        );
      }
    }
  }

  private handleUserEvent(state: RootState, dispatch: AppDispatch) {
    // Currently, there is only one event concerned with the User list: User Registration.
    // Hence we just check if the user receiving this event is admin and update their
    // Users list by invalidating tags.
    if (state.auth.user?.role === Role.ADMIN) {
      dispatch(apiSlice.util.invalidateTags(["Users"]));
    }
  }

  private handleMessageEvent(
    payload: MessageEventPayloadDto,
    state: RootState,
    dispatch: AppDispatch
  ) {
    switch (payload.reason) {
      case EventReason.MESSAGE_CREATED: {
        // A new message has been posted. We simply
        // invalidate tags for all users to get real-time updates.
        dispatch(apiSlice.util.invalidateTags(["Messages"]));
        break;
      }
      default: {
        // This represents two other message-related events: Message edit and Message delete.
        // In this case, a message may even be bookmarked. Hence, we invalidate Bookmarks tag
        // as well. However, if the user has USER role, then we only invalidate Messages tag
        // as they don't can't bookmark messages.
        if (state.auth.user?.role === Role.USER) {
          dispatch(apiSlice.util.invalidateTags(["Messages"]));
        } else {
          dispatch(apiSlice.util.invalidateTags(["Messages", "Bookmarks"]));
        }
      }
    }
  }
}

export const sseService = new SseService();
