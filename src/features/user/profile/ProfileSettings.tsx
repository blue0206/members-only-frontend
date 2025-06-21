import { Header } from "@/components/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ProfileSettingsTabOptions,
  ProfileSettingsTabOptionsType,
} from "@/lib/constants";
import { AlertTriangle, Lock, Shield, User, UserCog } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import EditProfile from "./edit-details/EditProfile";

export default function ProfileSettings() {
  const isDesktop = useMediaQuery({
    query: "(min-width: 611px)",
  });

  const [activeTab, setActiveTab] = useState<ProfileSettingsTabOptionsType>(
    ProfileSettingsTabOptions.editProfile
  );

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <UserCog className="h-10 w-10 mr-2 text-primary" />
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger
                value={ProfileSettingsTabOptions.editProfile}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value={ProfileSettingsTabOptions.account}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger
                value={ProfileSettingsTabOptions.sessions}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Shield className="h-4 w-4" />
                <span>Sessions</span>
              </TabsTrigger>
              <TabsTrigger
                value={ProfileSettingsTabOptions.dangerZone}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value={ProfileSettingsTabOptions.editProfile}>
              <EditProfile />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <UserCog className="h-10 w-10 mr-2 text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </div>

        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full flex items-center justify-center">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ProfileSettingsTabOptions.editProfile}>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </div>
            </SelectItem>
            <SelectItem value={ProfileSettingsTabOptions.account}>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Account</span>
              </div>
            </SelectItem>
            <SelectItem value={ProfileSettingsTabOptions.sessions}>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Sessions</span>
              </div>
            </SelectItem>
            <SelectItem value={ProfileSettingsTabOptions.dangerZone}>
              <div className={"flex items-center space-x-2"}>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Danger Zone</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-8">
          {/* Profile Tab */}
          {activeTab === ProfileSettingsTabOptions.editProfile && (
            <EditProfile />
          )}
        </div>
      </main>
    </div>
  );
}
