"use client";

import { Schema } from "@/amplify/data/resource";
import amplify_outputs from "@/amplify_outputs.json";
import { getGroups, isAdmin as isAdminFn } from "@/lib/session";
import { Authenticator } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
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

type DbClientType = ReturnType<typeof generateClient<Schema>>;

type AuthContextType = {
  user: AuthUser | null;
  signOut: () => void;
  avatarUrl: string;
  email: string;
  fullname: string;
  groups: string[];
  isAdmin: boolean;
  dbClient: DbClientType | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
  avatarUrl: "",
  email: "",
  fullname: "",
  groups: [],
  isAdmin: false,
  dbClient: null,
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
  const [dbClient, setDbClient] = useState<DbClientType | null>(null);

  const cleanUser = () => {
    setUser(null);
    setAvatarUrl("");
    setEmail("");
    setFullname("");
    setGroups([]);
    setIsAdmin(false);
    setDbClient(generateClient<Schema>({ authMode: "identityPool" }));
  };

  const setUserAttrs = useCallback(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
        setDbClient(generateClient<Schema>({ authMode: "userPool" }));

        fetchUserAttributes().then((attributes) => {
          setEmail(attributes?.email ?? "");
          setFullname(attributes?.name ?? "");

          hasExistingAvatar().then((hasAvatar) => {
            if (!hasAvatar && attributes?.picture) {
              setAvatarAttribute(attributes?.picture);
              setAvatarUrl(attributes?.picture);
            } else {
              getAvatarOrSetDefault().then((url) => {
                setAvatarUrl(url);
              });
            }
          });
        });

        fetchAuthSession().then((session) => {
          setGroups(getGroups(session));
          setIsAdmin(isAdminFn(session));
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
        dbClient,
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
