"use client";

import amplify_outputs from "@/amplify_outputs.json";
import {
  getFromStorage,
  removeFromStorage,
  setToStorage,
} from "@/lib/localStorage";
import { getGroups, isAdmin as isAdminFn } from "@/lib/session";
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

Amplify.configure(amplify_outputs, { ssr: true });

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
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = getFromStorage("auth_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return getFromStorage("auth_avatar_url") || "";
  });
  const [email, setEmail] = useState<string>(() => {
    return getFromStorage("auth_email") || "";
  });
  const [fullname, setFullname] = useState<string>(() => {
    return getFromStorage("auth_fullname") || "";
  });
  const [groups, setGroups] = useState<string[]>(() => {
    const cached = getFromStorage("auth_groups");
    return cached ? JSON.parse(cached) : [];
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return getFromStorage("auth_is_admin") === "true";
  });

  const cleanUser = () => {
    setUser(null);
    setAvatarUrl("");
    setEmail("");
    setFullname("");
    setGroups([]);
    setIsAdmin(false);

    removeFromStorage("auth_user");
    removeFromStorage("auth_avatar_url");
    removeFromStorage("auth_email");
    removeFromStorage("auth_fullname");
    removeFromStorage("auth_groups");
    removeFromStorage("auth_is_admin");
  };

  const setUserAttrs = useCallback(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
        setToStorage("auth_user", JSON.stringify(user));

        fetchUserAttributes().then((attributes) => {
          setEmail(attributes?.email ?? "");
          setToStorage("auth_email", attributes?.email ?? "");

          setFullname(attributes?.name ?? "");
          setToStorage("auth_fullname", attributes?.name ?? "");

          hasExistingAvatar().then((hasAvatar) => {
            if (!hasAvatar && attributes?.picture) {
              setAvatarAttribute(attributes?.picture);
              setAvatarUrl(attributes?.picture);
              setToStorage("auth_avatar_url", attributes?.picture);
            } else {
              getAvatarOrSetDefault().then((url) => {
                setAvatarUrl(url);
                setToStorage("auth_avatar_url", url);
              });
            }
          });
        });

        fetchAuthSession().then((session) => {
          const userGroups = getGroups(session);
          setGroups(userGroups);
          setToStorage("auth_groups", JSON.stringify(userGroups));

          const adminStatus = isAdminFn(session);
          setIsAdmin(adminStatus);
          setToStorage("auth_is_admin", String(adminStatus));
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
      value={{
        user,
        signOut,
        avatarUrl,
        email,
        fullname,
        groups,
        isAdmin,
      }}
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
