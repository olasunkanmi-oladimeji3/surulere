

import { WARDS, CDAS, getWard, getCda, getCdasForWard } from "./wards";

export { WARDS, CDAS, getWard, getCda, getCdasForWard };

const DB_KEY = "ile-surulere-db-v3";
const SESSION_KEY = "ile-surulere-session-v3";

export const ROLE_LABEL = {
  owner: "Property owner",
  resident: "Tenant",
  cda: "CDA member",
  admin: "LG Staff",
};

/* ------------------------- Label / option lists ------------------------- */

export const BUILDING_TYPE_LABELS = {
  bungalow: "Bungalow",
  "1_storey": "1 Storey Building",
  "2_storey": "2 Storey Building",
  "3_storey": "3 Storey Building",
  "5_storey": "5 Storey Building",
  "5_to_12_storey": "5 to 12 Storey Building",
};

export const PROPERTY_TYPE_LABELS = {
  rented: "Rented",
  private_joint: "Private / Joint",
  family_house: "Family House",
  private_personal: "Private Personal",
};

export const OCCUPANCY_TYPE_LABELS = {
  room_self_contained: "A Room Self Contained",
  room_parlour_self_contained: "A Room & Parlour Self Contained",
  "2_bedroom": "2 Bedroom Apartment",
  "3_bedroom": "3 Bedroom Apartment",
  "4_bedroom_duplex": "4 Bedroom Apartment / Duplex",
  "5_bedroom_duplex": "5 Bedroom Apartment / Duplex",
};

export const TENANCY_TYPE_LABELS = {
  yearly: "Yearly",
  half_yearly: "Half Yearly",
  quarterly: "Quarterly",
  monthly: "Monthly",
};

export const STAFF_ROLE_LABELS = {
  domestic_staff: "Domestic Staff",
  gateman: "Gateman",
  security: "Security",
  other: "Other",
};

export const GENDER_OPTIONS = ["male", "female", "other"];
export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed", "Separated"];
export const EMPLOYMENT_STATUS_OPTIONS = [
  "Employed - Full-time", "Employed - Part-time", "Self-employed",
  "Unemployed", "Student", "Retired", "Other",
];
export const RELATIONSHIP_TO_HEAD_OPTIONS = [
  "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister",
  "Other relative", "Ward / Dependent", "Other",
];
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];
export const BUILDING_TYPES = Object.keys(BUILDING_TYPE_LABELS);
export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS);
export const OCCUPANCY_TYPES = Object.keys(OCCUPANCY_TYPE_LABELS);
export const TENANCY_TYPES = Object.keys(TENANCY_TYPE_LABELS);
export const STAFF_ROLE_TYPES = Object.keys(STAFF_ROLE_LABELS);

export function statusLabel(status) {
  return { verified: "Verified", pending: "Pending review", flagged: "Flagged" }[status] || status;
}

export function displayName(user) {
  if (!user) return "";
  return user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
}

export function navHrefFor(role) {
  return {
    owner: "/dashboard/owner",
    resident: "/dashboard/resident",
    cda: "/dashboard/cda",
    admin: "/dashboard/admin",
  }[role] || "/login";
}

/* ------------------------------ Seed data ------------------------------ */

function wardIdByCode(code) {
  return WARDS.find((w) => w.code === code)?.id;
}
function cdaIdByName(name) {
  return CDAS.find((c) => c.name === name)?.id;
}

function seedData() {
  const wardE1 = wardIdByCode("E1");
  const wardG2 = wardIdByCode("G2");
  const wardG = wardIdByCode("G");
  const wardF3 = wardIdByCode("F3");

  return {
    users: [
      { id: "u-admin-1", role: "admin", name: "Folake Adewale", title: "LG Information Officer", email: "[email protected]", phone: "0803 412 9981", password: "demo1234" },
      { id: "u-cda-1", role: "cda", name: "Tunde Bakare", email: "[email protected]", phone: "0805 221 7740", password: "demo1234", ward_id: wardE1, addedBy: "u-admin-1" },
      { id: "u-cda-2", role: "cda", name: "Chidinma Eze", email: "[email protected]", phone: "0701 998 2210", password: "demo1234", ward_id: wardG2, addedBy: "u-admin-1" },
    ],

    owners: [
      { id: "own-1", role: "owner", name: "Ronke Afolabi", email: "[email protected]", phone: "0806 271 4402", password: "demo1234", nin: "19204837651", created_at: "2025-11-01" },
      { id: "own-2", role: "owner", name: "Musa Garba", email: "[email protected]", phone: "0902 117 6630", password: "demo1234", nin: "18837402915", created_at: "2025-05-29" },
      { id: "own-3", role: "owner", name: "Emeka Obi", email: "[email protected]", phone: "0813 552 9087", password: "demo1234", nin: "20581736294", created_at: "2025-08-20" },
    ],

    properties: [
      {
        id: "prop-1", property_number: "PROP-E1-0001", address: "14 Bode Thomas Street",
        ward_id: wardE1, cda_id: cdaIdByName("Ojuelegba CDA"),
        building_type: "2_storey", property_type: "private_joint",
        owner_id: "own-1", registered_by: "own-1", registered_by_role: "owner",
        status: "verified", created_at: "2025-11-02", updated_at: "2025-11-02",
        staff: [
          { id: "s-1", surname: "Musa", first_name: "Garba", role_type: "gateman", phone: "0810 223 9981", gender: "male", age: 38, state_of_origin: "Katsina", referee_name: "Alhaji Bello", referee_phone: "0803 119 2231", created_at: "2025-11-02" },
        ],
        units: [
          { id: "prop-1-U01", unit_number: "PROP-E1-0001-U01", occupancy_type: "3_bedroom", tenancy_type: undefined, occupancy: "occupied", tenant_id: "res-1" },
          { id: "prop-1-U02", unit_number: "PROP-E1-0001-U02", occupancy_type: "2_bedroom", tenancy_type: "yearly", occupancy: "occupied", tenant_id: "res-2" },
          { id: "prop-1-U03", unit_number: "PROP-E1-0001-U03", occupancy_type: "room_self_contained", tenancy_type: "monthly", occupancy: "vacant", tenant_id: undefined },
        ],
      },
      {
        id: "prop-2", property_number: "PROP-G-0002", address: "9 Livingstone Street",
        ward_id: wardG, cda_id: cdaIdByName("Livingstone CDA"),
        building_type: "bungalow", property_type: "family_house",
        owner_id: "own-2", registered_by: "u-cda-1", registered_by_role: "cda",
        status: "flagged", flagNote: "Name on file does not match resident met on site visit. Awaiting update.",
        created_at: "2025-05-30", updated_at: "2026-06-02",
        staff: [],
        units: [
          { id: "prop-2-U01", unit_number: "PROP-G-0002-U01", occupancy_type: "4_bedroom_duplex", tenancy_type: undefined, occupancy: "occupied", tenant_id: "res-3" },
        ],
      },
      {
        id: "prop-3", property_number: "PROP-F3-0003", address: "5 Gbaja Street",
        ward_id: wardF3, cda_id: cdaIdByName("Gbaja CDA"),
        building_type: "3_storey", property_type: "private_personal",
        owner_id: "own-3", registered_by: "own-3", registered_by_role: "owner",
        status: "verified", created_at: "2025-08-21", updated_at: "2025-08-21",
        staff: [
          { id: "s-2", surname: "Chika", first_name: "Umeh", role_type: "domestic_staff", phone: "0805 119 4471", gender: "female", age: 34, state_of_origin: "Anambra", created_at: "2025-08-21" },
          { id: "s-3", surname: "Yusuf", first_name: "Adamu", role_type: "security", phone: "0816 770 2253", gender: "male", age: 41, state_of_origin: "Sokoto", created_at: "2025-08-21" },
        ],
        units: [
          { id: "prop-3-U01", unit_number: "PROP-F3-0003-U01", occupancy_type: "5_bedroom_duplex", tenancy_type: undefined, occupancy: "occupied", tenant_id: "res-4" },
        ],
      },
      {
        id: "prop-4", property_number: "PROP-G2-0004", address: "21 Adeniran Ogunsanya Street",
        ward_id: wardG2, cda_id: cdaIdByName("New Adeniran Ogunsanya CDA"),
        building_type: "1_storey", property_type: "rented",
        owner_id: "own-1", registered_by: "own-1", registered_by_role: "owner",
        status: "pending", created_at: "2026-02-18", updated_at: "2026-02-18",
        staff: [],
        units: [
          { id: "prop-4-U01", unit_number: "PROP-G2-0004-U01", occupancy_type: "2_bedroom", tenancy_type: "yearly", occupancy: "vacant", tenant_id: undefined },
        ],
      },
    ],

    residents: [
      {
        id: "res-1", resident_id: "RES-000101", role: "resident", password: "demo1234",
        first_name: "Biodun", last_name: "Salako", gender: "male", date_of_birth: "1980-04-12",
        marital_status: "Married", state_of_origin: "Ogun",
        email: "[email protected]", phone: "0708 441 2256", alternative_phone: undefined,
        landmark: "Opposite St. Finbarr's College", years_at_address: "6",
        nin: "21947305812", voter_card_number: "90F1A2B3C4D5",
        property_id: "prop-1", unit_id: "prop-1-U01",
        occupation: "Civil Engineer", employment_status: "Employed - Full-time",
        employer_name: "Lagos State Ministry of Works", employer_address: "Alausa, Ikeja",
        emergency_contact_name: "Bisi Salako", emergency_contact_relationship: "Spouse", emergency_contact_phone: "0816 220 7741",
        disability: false, chronic_illness: false,
        household_members: [
          { id: "m-1", first_name: "Bisi", last_name: "Salako", gender: "female", relationship_to_head: "Spouse", age: 41, occupation: "Trader", state_of_origin: "Ogun", created_at: "2025-11-02" },
          { id: "m-2", first_name: "Tomiwa", last_name: "Salako", gender: "male", relationship_to_head: "Son", age: 14, occupation: "Student", state_of_origin: "Ogun", created_at: "2025-11-02" },
        ],
        added_by: "own-1", status: "verified", created_at: "2025-11-02", updated_at: "2025-11-02",
      },
      {
        id: "res-2", resident_id: "RES-000102", role: "resident", password: "demo1234",
        first_name: "Grace", last_name: "Imafidon", gender: "female", date_of_birth: "1989-02-14",
        marital_status: "Single", state_of_origin: "Edo",
        email: "[email protected]", phone: "0816 220 7741",
        landmark: "Opposite St. Finbarr's College", years_at_address: "2",
        nin: "23410582967", voter_card_number: undefined,
        property_id: "prop-1", unit_id: "prop-1-U02",
        occupation: "Nurse", employment_status: "Employed - Full-time",
        employer_name: "Lagos State Health Service", employer_address: "Surulere",
        emergency_contact_name: "Osaze Imafidon", emergency_contact_relationship: "Brother", emergency_contact_phone: "0909 117 3382",
        disability: false, chronic_illness: false,
        household_members: [],
        added_by: "own-1", status: "verified", created_at: "2024-06-01", updated_at: "2024-06-01",
      },
      {
        id: "res-3", resident_id: "RES-000103", role: "resident", password: "demo1234",
        first_name: "Yusuf", last_name: "Garba", gender: "male", date_of_birth: "1996-01-18",
        marital_status: "Single", state_of_origin: "Kano",
        email: "[email protected]", phone: "0805 119 4471",
        landmark: "Near Livingstone Primary School", years_at_address: "3",
        nin: "23105748296", voter_card_number: undefined,
        property_id: "prop-2", unit_id: "prop-2-U01",
        occupation: "Mechanic", employment_status: "Self-employed",
        emergency_contact_name: "Musa Garba", emergency_contact_relationship: "Brother", emergency_contact_phone: "0902 117 6630",
        disability: false, chronic_illness: true, chronic_illness_type: "Hypertension",
        household_members: [],
        added_by: "u-cda-1", status: "flagged", created_at: "2025-05-30", updated_at: "2026-06-02",
      },
      {
        id: "res-4", resident_id: "RES-000104", role: "resident", password: "demo1234",
        first_name: "Patience", last_name: "Nwosu", gender: "female", date_of_birth: "1973-09-02",
        marital_status: "Married", state_of_origin: "Imo",
        email: "[email protected]", phone: "0817 663 2294",
        landmark: "Off Bode Thomas", years_at_address: "12",
        nin: "22938475601", voter_card_number: "65A1B2C3D4E5",
        property_id: "prop-3", unit_id: "prop-3-U01",
        occupation: "Civil servant", employment_status: "Employed - Full-time",
        employer_name: "Lagos State Civil Service", employer_address: "Alausa",
        emergency_contact_name: "Emeka Obi", emergency_contact_relationship: "Spouse", emergency_contact_phone: "0813 552 9087",
        disability: false, chronic_illness: false,
        household_members: [
          { id: "m-3", first_name: "Chidera", last_name: "Nwosu", gender: "female", relationship_to_head: "Daughter", age: 19, occupation: "Student", state_of_origin: "Imo", created_at: "2025-08-21" },
        ],
        added_by: "own-3", status: "verified", created_at: "2025-08-21", updated_at: "2025-08-21",
      },
    ],

    verificationLogs: [
      { id: "log-1", property_id: "prop-1", actorId: "u-cda-1", outcome: "verified", note: "All units checked. Occupants match records.", date: "2026-05-12" },
      { id: "log-2", property_id: "prop-3", actorId: "u-admin-1", outcome: "verified", note: "Confirmed with owner on site.", date: "2026-04-28" },
      { id: "log-3", property_id: "prop-2", actorId: "u-cda-1", outcome: "flagged", note: "Name on file does not match resident met on site visit.", date: "2026-06-02" },
    ],

    auditLogs: [
      { id: "audit-1", date: "2025-11-02T09:14:00", actorId: "own-1", actorName: "Ronke Afolabi", actorRole: "owner", action: "Registered as a property owner", detail: "[email protected]" },
      { id: "audit-2", date: "2025-11-02T09:20:00", actorId: "own-1", actorName: "Ronke Afolabi", actorRole: "owner", action: "Added a property", detail: "PROP-E1-0001 — 14 Bode Thomas Street" },
      { id: "audit-3", date: "2025-11-02T09:31:00", actorId: "own-1", actorName: "Ronke Afolabi", actorRole: "owner", action: "Added a tenant", detail: "RES-000101 (Biodun Salako) to unit PROP-E1-0001-U01" },
      { id: "audit-4", date: "2025-05-30T11:02:00", actorId: "u-cda-1", actorName: "Tunde Bakare", actorRole: "cda", action: "Registered a property on behalf of an owner", detail: "PROP-G-0002 — owner Musa Garba" },
      { id: "audit-5", date: "2026-05-12T14:45:00", actorId: "u-cda-1", actorName: "Tunde Bakare", actorRole: "cda", action: "Verified a property", detail: "PROP-E1-0001 — All units checked. Occupants match records." },
      { id: "audit-6", date: "2026-06-02T16:10:00", actorId: "u-cda-1", actorName: "Tunde Bakare", actorRole: "cda", action: "Flagged a property", detail: "PROP-G-0002 — Name on file does not match resident met on site visit." },
      { id: "audit-7", date: "2025-08-20T10:00:00", actorId: "u-admin-1", actorName: "Folake Adewale", actorRole: "admin", action: "Added a CDA member", detail: "Chidinma Eze — Ward G2" },
    ],
  };
}

/* ------------------------------ Store / pub-sub ------------------------------ */

function hasStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

const listeners = new Set();
function notify() {
  listeners.forEach((l) => l());
}
export function subscribeToStore(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export const DB = {
  load() {
    if (!hasStorage()) return seedData();
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = seedData();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  },
  save(data) {
    if (!hasStorage()) return;
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    notify();
  },
  reset() {
    if (!hasStorage()) return seedData();
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    notify();
    return this.load();
  },
};

/* ---------------------------- Auth ---------------------------- */

function findAccountByEmail(db, email) {
  const lower = email.toLowerCase();
  return (
    db.users.find((u) => u.email.toLowerCase() === lower) ||
    db.owners.find((o) => o.email.toLowerCase() === lower) ||
    db.residents.find((r) => r.email.toLowerCase() === lower) ||
    null
  );
}

function findAccountById(db, id) {
  return (
    db.users.find((u) => u.id === id) ||
    db.owners.find((o) => o.id === id) ||
    db.residents.find((r) => r.id === id) ||
    null
  );
}

export function emailTaken(db, email) {
  return !!findAccountByEmail(db, email);
}

export const Auth = {
  login(email, password) {
    const db = DB.load();
    const account = findAccountByEmail(db, email);
    if (!account || account.password !== password) {
      return { ok: false, error: "We couldn't match that email and password. Check both and try again." };
    }
    if (hasStorage()) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
    notify();
    return { ok: true, user: account };
  },
  loginAs(userId) {
    if (hasStorage()) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
    notify();
  },
  logout() {
    if (hasStorage()) localStorage.removeItem(SESSION_KEY);
    notify();
  },
  currentUser() {
    if (!hasStorage()) return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return findAccountById(DB.load(), userId);
  },

  /** Owner self-registration. Simple profile — owners just need to be
   *  contactable and identifiable, the rich profile lives on tenants. */
  registerOwner({ name, email, phone, password, nin }) {
    const db = DB.load();
    if (findAccountByEmail(db, email)) {
      return { ok: false, error: "An account already exists with that email." };
    }
    const owner = {
      id: "own-" + Date.now(), role: "owner", name, email, phone, password, nin,
      created_at: new Date().toISOString().slice(0, 10),
    };
    db.owners.push(owner);
    addAuditEntry(db, { actorId: owner.id, action: "Registered as a property owner", detail: owner.email });
    DB.save(db);
    this.loginAs(owner.id);
    return { ok: true, owner };
  },

  changePassword(userId, currentPassword, newPassword) {
    const db = DB.load();
    const account = findAccountById(db, userId);
    if (!account) return { ok: false, error: "Account not found." };
    if (account.password !== currentPassword) {
      return { ok: false, error: "Your current password doesn't match." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: "New password must be at least 6 characters." };
    }
    account.password = newPassword;
    DB.save(db);
    return { ok: true };
  },
};

/* ------------------------- ID generation ------------------------- */

export function nextPropertySeq(db, wardCode) {
  const prefix = `PROP-${wardCode}-`;
  const max = db.properties
    .filter((p) => p.property_number?.startsWith(prefix))
    .reduce((m, p) => Math.max(m, parseInt(p.property_number.slice(prefix.length), 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
}
export function makePropertyNumber(wardCode, db) {
  return `PROP-${wardCode}-${nextPropertySeq(db, wardCode)}`;
}
export function makeUnitNumber(propertyNumber, unitIndex) {
  return `${propertyNumber}-U${String(unitIndex + 1).padStart(2, "0")}`;
}

export function nextResidentSeq(db) {
  const max = db.residents.reduce((m, r) => {
    const n = parseInt((r.resident_id || "").replace("RES-", ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100);
  return max + 1;
}
export function makeResidentId(db) {
  return `RES-${String(nextResidentSeq(db)).padStart(6, "0")}`;
}

export function generateTempPassword() {
  // Demo-only. A real build issues a one-time reset link, not a plaintext password.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ------------------------- Property / tenant operations ------------------------- */

function buildUnits(propertyNumber, unitSpecs) {
  return unitSpecs.map((spec, i) => ({
    id: `${propertyNumber}-u${i}-${Date.now()}`,
    unit_number: makeUnitNumber(propertyNumber, i),
    occupancy_type: spec.occupancyType || undefined,
    tenancy_type: spec.tenancyType || undefined,
    occupancy: "vacant",
    tenant_id: undefined,
  }));
}

function buildStaff(staffForms) {
  const now = new Date().toISOString().slice(0, 10);
  return (staffForms || []).map((s, i) => ({
    id: `s-${Date.now()}-${i}`,
    surname: s.surname, first_name: s.first_name, last_name: s.last_name || undefined,
    phone: s.phone || undefined, address: s.address || undefined,
    referee_name: s.referee_name || undefined, referee_phone: s.referee_phone || undefined,
    referee_address: s.referee_address || undefined, gender: s.gender || undefined,
    age: s.age ? Number(s.age) : undefined, state_of_origin: s.state_of_origin || undefined,
    role_type: s.role_type || "domestic_staff", created_at: now,
  }));
}

/** Owner adds a new property to their own account. */
export function ownerAddProperty(ownerId, form) {
  const db = DB.load();
  const ward = getWard(form.wardId);
  const propertyNumber = makePropertyNumber(ward ? ward.code : "XX", db);
  const now = new Date().toISOString().slice(0, 10);

  const property = {
    id: "prop-" + Date.now(),
    property_number: propertyNumber,
    address: form.address, ward_id: form.wardId, cda_id: form.cdaId,
    building_type: form.buildingType || undefined, property_type: form.propertyType || undefined,
    owner_id: ownerId, registered_by: ownerId, registered_by_role: "owner",
    status: "pending", created_at: now, updated_at: now,
    staff: buildStaff(form.hasDomesticStaff ? form.domesticStaff : []),
    units: buildUnits(propertyNumber, form.units || [{}]),
  };

  db.properties.push(property);
  addAuditEntry(db, { actorId: ownerId, action: "Added a property", detail: `${property.property_number} — ${property.address}` });
  DB.save(db);
  return { ok: true, property };
}

/**
 * CDA registers a property on behalf of an owner who isn't signed up yet.
 * Creates the Owner account too, but does NOT log the CDA out of their own
 * session — the new owner's credentials are returned for emailing them.
 */
export function cdaRegisterProperty(cdaActorId, form) {
  const db = DB.load();
  if (findAccountByEmail(db, form.ownerEmail)) {
    return { ok: false, error: "An owner account already exists with that email." };
  }
  const ward = getWard(form.wardId);
  const propertyNumber = makePropertyNumber(ward ? ward.code : "XX", db);
  const tempPassword = generateTempPassword();
  const now = new Date().toISOString().slice(0, 10);

  const owner = {
    id: "own-" + Date.now(), role: "owner",
    name: form.ownerName, email: form.ownerEmail, phone: form.ownerPhone,
    nin: form.ownerNin || undefined, password: tempPassword, created_at: now,
  };

  const property = {
    id: "prop-" + Date.now() + "-p",
    property_number: propertyNumber,
    address: form.address, ward_id: form.wardId, cda_id: form.cdaId,
    building_type: form.buildingType || undefined, property_type: form.propertyType || undefined,
    owner_id: owner.id, registered_by: cdaActorId, registered_by_role: "cda",
    status: "pending", created_at: now, updated_at: now,
    staff: buildStaff(form.hasDomesticStaff ? form.domesticStaff : []),
    units: buildUnits(propertyNumber, form.units || [{}]),
  };

  db.owners.push(owner);
  db.properties.push(property);
  addAuditEntry(db, {
    actorId: cdaActorId, action: "Registered a property on behalf of an owner",
    detail: `${property.property_number} — owner ${owner.name}`,
  });
  DB.save(db);

  return { ok: true, owner, property, tempPassword };
}

/**
 * Owner (or admin) adds a tenant to a specific vacant unit. Tenants never
 * self-register — this is the only way a Tenant record gets created.
 * Returns the generated credentials for emailing the tenant.
 */
export function addTenantToUnit(actorId, propertyId, unitId, form) {
  const db = DB.load();
  if (findAccountByEmail(db, form.email)) {
    return { ok: false, error: "An account already exists with that email." };
  }
  const property = db.properties.find((p) => p.id === propertyId);
  const unit = property?.units.find((u) => u.id === unitId);
  if (!property || !unit) return { ok: false, error: "Unit not found." };

  const residentId = makeResidentId(db);
  const tempPassword = generateTempPassword();
  const now = new Date().toISOString().slice(0, 10);

  const tenant = {
    id: residentId, resident_id: residentId, role: "resident", password: tempPassword,
    first_name: form.firstName, last_name: form.lastName, middle_name: form.middleName || undefined,
    date_of_birth: form.dateOfBirth || undefined, gender: form.gender || undefined,
    marital_status: form.maritalStatus || undefined, state_of_origin: form.stateOfOrigin || undefined,
    email: form.email, phone: form.phone, alternative_phone: form.alternativePhone || undefined,
    landmark: form.landmark || undefined, years_at_address: form.yearsAtAddress || undefined,
    nin: form.nin || undefined, voter_card_number: form.voterCardNumber || undefined,
    property_id: propertyId, unit_id: unitId,
    occupation: form.occupation || undefined, employment_status: form.employmentStatus || undefined,
    employer_name: form.employerName || undefined, employer_address: form.employerAddress || undefined,
    emergency_contact_name: form.emergencyContactName || undefined,
    emergency_contact_relationship: form.emergencyContactRelationship || undefined,
    emergency_contact_phone: form.emergencyContactPhone || undefined,
    disability: !!form.disability, disability_type: form.disability ? (form.disabilityType || undefined) : undefined,
    chronic_illness: !!form.chronicIllness, chronic_illness_type: form.chronicIllness ? (form.chronicIllnessType || undefined) : undefined,
    photo_url: form.photoDataUrl || undefined,
    id_document_url: form.idDocumentName || undefined,
    proof_of_residence_url: form.proofOfResidenceName || undefined,
    household_members: (form.householdMembers || []).map((m, i) => ({
      id: `m-${Date.now()}-${i}`,
      first_name: m.first_name, last_name: m.last_name, other_names: m.other_names || undefined,
      gender: m.gender || undefined, date_of_birth: m.date_of_birth || undefined,
      age: m.age ? Number(m.age) : undefined, relationship_to_head: m.relationship_to_head || undefined,
      phone: m.phone || undefined, occupation: m.occupation || undefined,
      state_of_origin: m.state_of_origin || undefined, nin: m.nin || undefined,
      created_at: now,
    })),
    added_by: actorId, status: "pending", created_at: now, updated_at: now,
  };

  unit.occupancy = "occupied";
  unit.tenant_id = tenant.id;
  property.updated_at = now;

  db.residents.push(tenant);
  addAuditEntry(db, {
    actorId, action: "Added a tenant",
    detail: `${tenant.resident_id} (${tenant.first_name} ${tenant.last_name}) to unit ${unit.unit_number}`,
  });
  DB.save(db);

  return { ok: true, tenant, tempPassword };
}

export function removeTenantFromUnit(actorId, propertyId, unitId) {
  const db = DB.load();
  const property = db.properties.find((p) => p.id === propertyId);
  const unit = property?.units.find((u) => u.id === unitId);
  if (!property || !unit) return;
  const tenant = db.residents.find((r) => r.id === unit.tenant_id);
  db.residents = db.residents.filter((r) => r.id !== unit.tenant_id);
  unit.occupancy = "vacant";
  unit.tenant_id = undefined;
  property.updated_at = new Date().toISOString().slice(0, 10);
  addAuditEntry(db, {
    actorId, action: "Removed a tenant",
    detail: `${tenant?.resident_id || "Unknown"} from unit ${unit.unit_number}`,
  });
  DB.save(db);
}

/* ------------------------- Helper utilities ------------------------- */

export function maskNIN(nin) {
  if (!nin) return "—";
  return "•••••••" + nin.slice(-4);
}

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Resolves an actor across all three account stores (admin/cda are in
 *  `users`, owners in `owners`, tenants in `residents`). */
function resolveActor(db, actorId) {
  const account =
    db.users.find((u) => u.id === actorId) ||
    db.owners.find((o) => o.id === actorId) ||
    db.residents.find((r) => r.id === actorId);
  if (!account) return { name: "Unknown", role: "unknown" };
  return { name: displayName(account), role: account.role };
}

/**
 * Appends an entry to the audit trail. Call this on the same `db` object
 * right before DB.save() inside any function that changes meaningful data
 * — registrations, tenant/CDA add-or-remove, verification outcomes. Login
 * events and password changes are deliberately not logged here; the trail
 * is for *who changed what*, not session activity.
 */
export function addAuditEntry(db, { actorId, action, detail }) {
  const actor = resolveActor(db, actorId);
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.push({
    id: "audit-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    date: new Date().toISOString(),
    actorId, actorName: actor.name, actorRole: actor.role,
    action, detail,
  });
}

export function ownerProperties(db, ownerId) {
  return db.properties.filter((p) => p.owner_id === ownerId);
}

export function propertyForUnit(db, unitId) {
  return db.properties.find((p) => p.units.some((u) => u.id === unitId));
}

export function tenantAddress(db, tenant) {
  const property = db.properties.find((p) => p.id === tenant.property_id);
  return property?.address || "—";
}

/** Full-text-ish search + ward/cda/gender filters used by the CDA and LG dashboards. */
export function searchResidents(db, { query = "", wardId = "", cdaId = "", gender = "" } = {}) {
  const q = query.trim().toLowerCase();
  return db.residents.filter((r) => {
    const property = db.properties.find((p) => p.id === r.property_id);
    if (q) {
      const haystack = [
        r.first_name, r.last_name, r.resident_id, property?.property_number, property?.address,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (wardId && property?.ward_id !== wardId) return false;
    if (cdaId && property?.cda_id !== cdaId) return false;
    if (gender && r.gender !== gender) return false;
    return true;
  });
}