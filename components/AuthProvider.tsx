"use client";

import amplify_outputs from "@/amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { Amplify } from "aws-amplify";
import {
  AuthUser,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";
import { getUrl, list, uploadData } from "aws-amplify/storage";
import { Hub } from "aws-amplify/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

Amplify.configure(amplify_outputs);

type AuthContextType = {
  user: AuthUser | null;
  signOut: () => void;
  avatarUrl: string;
  email: string;
  fullname: string;
  groups: string[];
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
  avatarUrl: "",
  email: "",
  fullname: "",
  groups: [],
  isAdmin: false,
});

async function hasExistingAvatar() {
  const { items } = await list({
    path: ({ identityId }) => `profile-pictures/${identityId}/`,
  });
  return items.length > 0;
}

async function setAvatarAttribute(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  uploadData({
    path: ({ identityId }) => `profile-pictures/${identityId}/avatar.png`,
    data: blob,
  });
}

async function getAvatarOrSetDefault() {
  const hasAvatar = await hasExistingAvatar();

  if (!hasAvatar) {
    const randomAvatar = faker.image.avatar();
    setAvatarAttribute(randomAvatar);

    return randomAvatar;
  }

  const url = await getUrl({
    path: ({ identityId }) => `profile-pictures/${identityId}/avatar.png`,
  });

  return url.url.toString();
}

function AuthProviderInter({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const cleanUser = () => {
    setUser(null);
    setAvatarUrl("");
    setEmail("");
    setFullname("");
    setGroups([]);
    setIsAdmin(false);
  };

  const setUserAttrs = useCallback(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);

        fetchUserAttributes().then((attributes) => {
          console.log(attributes);

          setEmail(attributes?.email ?? "");
          setFullname(attributes?.name ?? "");

          hasExistingAvatar().then((hasAvatar) => {
            if (!hasAvatar && attributes?.picture) {
              setAvatarAttribute(attributes?.picture);
              console.log("Set avatar url:", attributes?.picture);
              setAvatarUrl(attributes?.picture);
            } else {
              getAvatarOrSetDefault().then((url) => {
                console.log("Set avatar url:", url);
                setAvatarUrl(url);
              });
            }
          });
        });

        fetchAuthSession().then((session) => {
          const groups = (session.tokens?.accessToken?.payload[
            "cognito:groups"
          ] || []) as string[];
          setGroups(groups || []);
          setIsAdmin(groups.includes("admin"));
        });
      })
      .catch(() => {
        cleanUser();
      });
  }, []);

  useEffect(() => {
    const cancelListener = Hub.listen("auth", () => {
      setUserAttrs();
    });
    return () => {
      cancelListener();
    };
  }, [setUserAttrs]);

  useEffect(() => {
    setUserAttrs();
  }, [setUserAttrs]);

  return (
    <AuthContext.Provider
      value={{ user, signOut, avatarUrl, email, fullname, groups, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <AuthProviderInter>{children}</AuthProviderInter>
    </Authenticator.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
