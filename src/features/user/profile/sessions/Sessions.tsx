import { useGetSessionsQuery } from "@/app/services/authApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeviceType, UserDeviceType } from "@/lib/constants";
import {
  getBrowser,
  getDevice,
  getDeviceType,
  getOs,
  isValidIp,
} from "@/utils/sessionManagementUtils";
import { getDateFromTimestamp, getTimeElapsed } from "@/utils/timestampFormat";
import { UserSessionsResponseDto } from "@blue0206/members-only-shared-types";
import {
  Calendar,
  LogOut,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Timer,
  Trash2,
  Tv,
} from "lucide-react";
import RevokeSession from "./RevokeSession";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import RevokeAllSessions from "./RevokeAllSessions";
import { useMediaQuery } from "react-responsive";

function GetDeviceIcon(ua: string) {
  const deviceType: UserDeviceType = getDeviceType(ua);
  switch (deviceType) {
    case DeviceType.desktop:
      return <Monitor className="h-4 w-4" />;
    case DeviceType.mobile:
      return <Smartphone className="h-4 w-4" />;
    case DeviceType.tablet:
      return <Tablet className="h-4 w-4" />;
    case DeviceType.smarttv:
      return <Tv className="h-4 w-4" />;
  }
}

export default function Sessions() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const [revokeAllDialog, setRevokeAllDialog] = useState<boolean>(false);
  const [revokeDialog, setRevokeDialog] = useState<boolean>(false);
  const [revokeSessionId, setRevokeSessionId] = useState<string>("");

  const navigate = useNavigate();

  const { data, isError, error } = useGetSessionsQuery();
  const errorDetails = useApiErrorHandler(error);

  // Make the session in data array with currentSession === true the first element.
  const sessions: UserSessionsResponseDto = [
    ...(data?.filter((session) => session.currentSession) ?? []),
    ...(data?.filter((session) => !session.currentSession) ?? []),
  ];

  // Handle api call error.
  useEffect(() => {
    if (isError) {
      void navigate("/error", {
        state: {
          statusCode: errorDetails.statusCode ?? 500,
          message: errorDetails.message,
        } satisfies ErrorPageDetailsType,
      });
    }
  }, [isError, errorDetails, navigate]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl">Active Sessions</span>

            <Button
              variant={"destructive"}
              className="cursor-pointer flex items-center space-x-2"
              disabled={sessions.length <= 1}
              onClick={() => {
                setRevokeAllDialog(true);
              }}
            >
              <LogOut className="h-4 w-4" />
              {isDesktop ? "Logout All Other Sessions" : "Logout All"}
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0 bg-background/50"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{GetDeviceIcon(session.userAgent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium truncate">
                        {getDevice(session.userAgent)}
                      </p>
                      {session.currentSession && (
                        <Badge
                          variant={"secondary"}
                          className="text-xs rounded-md"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        {getBrowser(session.userAgent)} •{" "}
                        {getOs(session.userAgent)}
                      </p>

                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{session.userLocation}</span>
                        <span>•</span>
                        <span>
                          {isValidIp(session.userIp)
                            ? session.userIp
                            : "Unknown IP"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {session.currentSession
                            ? "Active Now"
                            : getTimeElapsed(session.lastUsedOn)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="h-3.5 w-3.5" />
                        <span>
                          Expires {getDateFromTimestamp(session.expires)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  {!session.currentSession && (
                    <Button
                      variant={"destructive"}
                      size={"sm"}
                      onClick={() => {
                        setRevokeSessionId(session.sessionId);
                        setRevokeDialog(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span>Logout</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <RevokeAllSessions
        revokeAllDialog={revokeAllDialog}
        setRevokeAllDialog={setRevokeAllDialog}
      />

      <RevokeSession
        sessionId={revokeSessionId}
        revokeDialog={revokeDialog}
        setRevokeDialog={setRevokeDialog}
      />
    </>
  );
}
