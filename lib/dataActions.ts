"use client";

import { Schema } from "@/amplify/data/resource";
import { Mutex } from "async-mutex";
import { generateClient } from "aws-amplify/api";
import { AuthSession, fetchAuthSession } from "aws-amplify/auth";
import { Property, PropertyCreate, PropertyUpdate } from "./types";

type DbClientType = ReturnType<typeof generateClient<Schema>>;

type SessionCache = {
  session: AuthSession | null;
  client: DbClientType | null;
  userTabId: string | null;
};

const sessionCache: SessionCache = {
  session: null,
  client: null,
  userTabId: null,
};

const getUserTabIdLock = new Mutex();

async function getSessionCache(session?: AuthSession) {
  const newSession = session ?? (await fetchAuthSession());
  if (newSession === sessionCache.session) {
    return sessionCache;
  }

  sessionCache.session = newSession;
  sessionCache.client = null;
  sessionCache.userTabId = null;

  return sessionCache;
}

async function getDbClient(session?: AuthSession) {
  const sessionCache = await getSessionCache(session);
  if (sessionCache.client) {
    return sessionCache.client;
  }

  const authMode = !sessionCache.session!.userSub ? "identityPool" : "userPool";
  sessionCache.client = generateClient<Schema>({ authMode });
  return sessionCache.client;
}

export async function getUserTabId(session?: AuthSession) {
  return await getUserTabIdLock.runExclusive(async () => {
    const sessionCache = await getSessionCache(session);
    if (sessionCache.userTabId) {
      return sessionCache.userTabId;
    }

    if (!sessionCache.session!.userSub) {
      return null;
    }

    const client = await getDbClient(sessionCache.session!);

    let response;
    response = await client.models.User.list({
      filter: {
        owner: {
          beginsWith: sessionCache.session!.userSub,
        },
      },
    });
    if (response.errors) {
      throw new Error(JSON.stringify(response.errors));
    }
    if (response.data.length === 0) {
      response = await client.models.User.create({});
      if (response.errors || response.extensions || !response.data) {
        throw new Error(JSON.stringify(response.errors));
      }
    }
    if (response.data instanceof Array && response.data.length === 1) {
      sessionCache.userTabId = response.data[0].id;
      return response.data[0].id;
    }
    if (response.data instanceof Object && "id" in response.data) {
      sessionCache.userTabId = response.data.id;
      return response.data.id;
    }

    throw new Error("Unhandled response: " + JSON.stringify(response));
  });
}

export async function fetchAllProperties() {
  const client = await getDbClient();
  const response = await client.models.Property.list({ limit: 1000 });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data;
}

export async function createProperty(property: PropertyCreate) {
  const client = await getDbClient();
  const response = await client.models.Property.create(property);
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data;
}

export async function updateProperty(property: PropertyUpdate) {
  const client = await getDbClient();
  const response = await client.models.Property.update(property);
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data;
}

export async function deleteProperty(id: string) {
  const client = await getDbClient();
  const response = await client.models.Property.delete({ id });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data;
}

export async function fetchProperty(id: string) {
  const client = await getDbClient();

  const response = await client.models.Property.get({ id });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data as Property;
}

export async function fetchFavoriteProperties() {
  const session = await fetchAuthSession();
  if (!session.userSub) {
    return [];
  }

  const client = await getDbClient(session);
  const userTabId = (await getUserTabId(session))!;

  const response = await client.models.User.get({ id: userTabId });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  const favoritesResponse = await response.data.favorites();
  if (favoritesResponse.nextToken || favoritesResponse.extensions) {
    throw new Error(JSON.stringify(favoritesResponse));
  }

  return await Promise.all(
    favoritesResponse.data.map(async (it) => {
      const propertyResponse = await it.property();
      if (
        propertyResponse.errors ||
        propertyResponse.extensions ||
        !propertyResponse.data
      ) {
        throw new Error(JSON.stringify(propertyResponse.errors));
      }
      return propertyResponse.data as Property;
    })
  );
}

export async function addFavoriteProperty(propertyId: string) {
  const session = await fetchAuthSession();
  if (!session.userSub) {
    throw new Error("User not authenticated");
  }

  const client = await getDbClient(session);
  const userTabId = (await getUserTabId(session))!;

  const response = await client.models.FavoriteProperty.list({
    filter: {
      propertyId: {
        eq: propertyId,
      },
      userId: {
        eq: userTabId,
      },
    },
  });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  if (response.data.length > 0) {
    return;
  }

  await client.models.FavoriteProperty.create({
    propertyId,
    userId: userTabId,
  });
}

export async function deleteFavoriteProperty(propertyId: string) {
  const session = await fetchAuthSession();
  if (!session.userSub) {
    throw new Error("User not authenticated");
  }

  const client = await getDbClient(session);
  const userTabId = (await getUserTabId(session))!;

  const response = await client.models.FavoriteProperty.list({
    filter: {
      propertyId: {
        eq: propertyId,
      },
      userId: {
        eq: userTabId,
      },
    },
  });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  if (response.data.length === 0) {
    return;
  }

  await Promise.all(
    response.data.map((it) =>
      client.models.FavoriteProperty.delete({ id: it.id })
    )
  );
}

export async function deleteUserTab() {
  const session = await fetchAuthSession();
  if (!session.userSub) {
    throw new Error("User not authenticated");
  }

  const client = await getDbClient(session);

  const response = await client.models.User.list({
    filter: {
      owner: {
        beginsWith: session.userSub,
      },
    },
  });
  if (response.errors || response.extensions || !response.data) {
    throw new Error(JSON.stringify(response.errors));
  }

  await Promise.all(
    response.data.map((it) => client.models.User.delete({ id: it.id }))
  );
}
