export function normalizeRole(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return normalizeRole(
      value?.slug ||
        value?.name ||
        value?.role ||
        value?.title ||
        ""
    );
  }

  const role = String(value).trim().toLowerCase();

  if (role === "administrator") return "admin";
  if (role === "admin") return "admin";
  if (role === "super admin") return "admin";
  if (role === "super_admin") return "admin";
  if (role === "super-admin") return "admin";

  if (role === "chief executive officer") return "ceo";
  if (role === "chief-executive-officer") return "ceo";
  if (role === "chief_executive_officer") return "ceo";
  if (role === "ceo") return "ceo";

  if (role === "trainer") return "trainer";
  if (role === "trainers") return "trainer";

  if (role === "student") return "student";
  if (role === "students") return "student";

  if (role === "agent") return "agent";
  if (role === "agents") return "agent";

  if (role === "school owner") return "school_owner";
  if (role === "school-owner") return "school_owner";
  if (role === "school_owner") return "school_owner";
  if (role === "school owners") return "school_owner";
  if (role === "schoolowners") return "school_owner";
  if (role === "schoolowner") return "school_owner";

  return role;
}

export function isKnownRole(role) {
  return [
    "admin",
    "ceo",
    "trainer",
    "student",
    "agent",
    "school_owner",
  ].includes(normalizeRole(role));
}

function parseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getTokenFromStorage(storage) {
  if (!storage) return "";

  return (
    storage.getItem("token") ||
    storage.getItem("auth_token") ||
    storage.getItem("access_token") ||
    ""
  );
}

function getUserFromStorage(storage) {
  if (!storage) return null;

  return (
    parseJson(storage.getItem("user") || "") ||
    parseJson(storage.getItem("auth_user") || "") ||
    null
  );
}

function pickKnownRole(value) {
  const normalized = normalizeRole(value);
  return isKnownRole(normalized) ? normalized : "";
}

export function extractRole(source) {
  if (!source) return "";

  const directCandidates = [
    source?.role?.slug,
    source?.role?.name,
    source?.role,

    source?.user?.role?.slug,
    source?.user?.role?.name,
    source?.user?.role,

    source?.data?.role?.slug,
    source?.data?.role?.name,
    source?.data?.role,

    source?.data?.user?.role?.slug,
    source?.data?.user?.role?.name,
    source?.data?.user?.role,
  ];

  for (const candidate of directCandidates) {
    const found = pickKnownRole(candidate);
    if (found) return found;
  }

  const rolesArrays = [
    Array.isArray(source?.roles) ? source.roles : [],
    Array.isArray(source?.user?.roles) ? source.user.roles : [],
    Array.isArray(source?.data?.roles) ? source.data.roles : [],
    Array.isArray(source?.data?.user?.roles) ? source.data.user.roles : [],
  ];

  const resolvedRoles = [];

  for (const arr of rolesArrays) {
    for (const item of arr) {
      const found = pickKnownRole(item?.slug || item?.name || item);
      if (found) {
        resolvedRoles.push(found);
      }
    }
  }

  const uniqueRoles = [...new Set(resolvedRoles)];

  if (uniqueRoles.length === 1) {
    return uniqueRoles[0];
  }

  return "";
}

function getStorageState(storage) {
  const token = getTokenFromStorage(storage);
  const user = getUserFromStorage(storage);
  const roleFromField = pickKnownRole(storage?.getItem("role") || "");
  const roleFromUser = extractRole(user);
  const role = roleFromField || roleFromUser || "";

  return {
    storage,
    token,
    user,
    role,
    authenticated: !!token && isKnownRole(role),
  };
}

export function getActiveStorage() {
  const sessionState = getStorageState(sessionStorage);
  const localState = getStorageState(localStorage);

  if (sessionState.authenticated) return sessionStorage;
  if (localState.authenticated) return localStorage;

  if (sessionState.token) return sessionStorage;
  if (localState.token) return localStorage;

  return null;
}

export function getAuthState() {
  const sessionState = getStorageState(sessionStorage);
  const localState = getStorageState(localStorage);

  let activeState = null;

  if (sessionState.authenticated) {
    activeState = sessionState;
  } else if (localState.authenticated) {
    activeState = localState;
  } else if (sessionState.token) {
    activeState = sessionState;
  } else if (localState.token) {
    activeState = localState;
  }

  if (!activeState) {
    return {
      storage: null,
      token: "",
      user: null,
      role: "",
      authenticated: false,
    };
  }

  if (
    activeState.storage &&
    !activeState.storage.getItem("role") &&
    activeState.role
  ) {
    activeState.storage.setItem("role", activeState.role);
  }

  if (
    activeState.storage &&
    activeState.user &&
    !activeState.storage.getItem("auth_user")
  ) {
    activeState.storage.setItem("auth_user", JSON.stringify(activeState.user));
  }

  return {
    storage: activeState.storage,
    token: activeState.token,
    user: activeState.user,
    role: isKnownRole(activeState.role) ? activeState.role : "",
    authenticated: !!activeState.token && isKnownRole(activeState.role),
  };
}

export function clearStoredAuth() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem("token");
    storage.removeItem("auth_token");
    storage.removeItem("access_token");
    storage.removeItem("user");
    storage.removeItem("auth_user");
    storage.removeItem("role");
  });
}

export function getDashboardPathByRole(role) {
  switch (normalizeRole(role)) {
    case "admin":
      return "/dashboard/admin";
    case "ceo":
      return "/dashboard/ceo";
    case "trainer":
      return "/dashboard/trainer";
    case "student":
      return "/";
    case "agent":
      return "/dashboard/agent";
    case "school_owner":
      return "/dashboard/agents";
    default:
      return "/login";
  }
}