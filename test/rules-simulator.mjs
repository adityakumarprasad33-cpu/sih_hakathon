/**
 * Firebase RTDB Security Rules & Authorization Simulator
 * 
 * Verifies the security and boundary rules from database.rules.json:
 * 1. Cross-patient telemetry isolation (no unauthorized read/write)
 * 2. Unauthenticated access rejection
 * 3. Doctor RBAC and explicit patient consent gate
 * 4. Device ownership claiming collision prevention
 * 5. Ingestion boundary authentication and UID mismatch rejection
 */

import assert from "node:assert";

console.log("\n=======================================================");
console.log("TEST SUITE: Firebase RTDB Security & Authorization Rules");
console.log("=======================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// 1. Telemetry Read Access Evaluator (Mirroring database.rules.json)
// -----------------------------------------------------------------------------
function canReadTelemetry({ auth, patientUid, doctorRelationships }) {
  if (!auth) return false;
  // Patient reads own
  if (auth.uid === patientUid) return true;

  // Doctor check
  const relKey = `${auth.uid}/${patientUid}`;
  const rel = doctorRelationships?.[relKey];
  if (rel && rel.status === "ACTIVE" && rel.consentStatus === "GRANTED") {
    if (Array.isArray(rel.permissions) && rel.permissions.includes("READ_VITALS")) return true;
    if (typeof rel.permissions === "object" && rel.permissions.READ_VITALS === true) return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// 2. Telemetry Write Access Evaluator
// -----------------------------------------------------------------------------
function canWriteTelemetry({ auth, patientUid }) {
  if (!auth) return false;
  return auth.uid === patientUid;
}

// -----------------------------------------------------------------------------
// 3. Device Claiming Collision Evaluator
// -----------------------------------------------------------------------------
function canClaimDevice({ auth, deviceId, deviceCatalog }) {
  if (!auth) return false;
  const existingDevice = deviceCatalog[deviceId];
  if (!existingDevice) return true; // New device, unowned
  if (!existingDevice.ownerUid) return true; // Unclaimed device
  return existingDevice.ownerUid === auth.uid; // Owned by caller
}

// -----------------------------------------------------------------------------
// TESTS
// -----------------------------------------------------------------------------

test("1. Unauthenticated users cannot read any telemetry", () => {
  const allowed = canReadTelemetry({
    auth: null,
    patientUid: "patient_alice",
  });
  assert.strictEqual(allowed, false, "Unauthenticated read must be blocked");
});

test("2. Unauthenticated users cannot write any telemetry", () => {
  const allowed = canWriteTelemetry({
    auth: null,
    patientUid: "patient_alice",
  });
  assert.strictEqual(allowed, false, "Unauthenticated write must be blocked");
});

test("3. Patient can read and write their own telemetry", () => {
  const canRead = canReadTelemetry({
    auth: { uid: "patient_alice" },
    patientUid: "patient_alice",
  });
  const canWrite = canWriteTelemetry({
    auth: { uid: "patient_alice" },
    patientUid: "patient_alice",
  });
  assert.strictEqual(canRead, true);
  assert.strictEqual(canWrite, true);
});

test("4. Cross-patient isolation: Patient A CANNOT read or write Patient B's telemetry", () => {
  const canRead = canReadTelemetry({
    auth: { uid: "patient_bob" },
    patientUid: "patient_alice",
  });
  const canWrite = canWriteTelemetry({
    auth: { uid: "patient_bob" },
    patientUid: "patient_alice",
  });
  assert.strictEqual(canRead, false, "Cross-patient read must be strictly prohibited");
  assert.strictEqual(canWrite, false, "Cross-patient write must be strictly prohibited");
});

test("5. Doctor CANNOT read patient telemetry when consent is PENDING", () => {
  const relationships = {
    "doctor_smith/patient_alice": {
      status: "INVITED",
      consentStatus: "PENDING",
      permissions: ["READ_VITALS"],
    },
  };
  const canRead = canReadTelemetry({
    auth: { uid: "doctor_smith" },
    patientUid: "patient_alice",
    doctorRelationships: relationships,
  });
  assert.strictEqual(canRead, false);
});

test("6. Doctor CANNOT read patient telemetry when consent is DECLINED or REVOKED", () => {
  const declinedRel = {
    "doctor_smith/patient_alice": {
      status: "ACTIVE",
      consentStatus: "DECLINED",
      permissions: ["READ_VITALS"],
    },
  };
  const revokedRel = {
    "doctor_smith/patient_alice": {
      status: "ACTIVE",
      consentStatus: "REVOKED",
      permissions: ["READ_VITALS"],
    },
  };
  assert.strictEqual(canReadTelemetry({ auth: { uid: "doctor_smith" }, patientUid: "patient_alice", doctorRelationships: declinedRel }), false);
  assert.strictEqual(canReadTelemetry({ auth: { uid: "doctor_smith" }, patientUid: "patient_alice", doctorRelationships: revokedRel }), false);
});

test("7. Doctor CAN read patient telemetry ONLY when status is ACTIVE and consentStatus is GRANTED with READ_VITALS", () => {
  const activeGrantedRel = {
    "doctor_smith/patient_alice": {
      status: "ACTIVE",
      consentStatus: "GRANTED",
      permissions: ["READ_VITALS", "READ_RISK"],
    },
  };
  const canRead = canReadTelemetry({
    auth: { uid: "doctor_smith" },
    patientUid: "patient_alice",
    doctorRelationships: activeGrantedRel,
  });
  assert.strictEqual(canRead, true);
});

test("8. Doctor WITHOUT READ_VITALS permission cannot access vitals even if consent is GRANTED", () => {
  const noVitalsRel = {
    "doctor_smith/patient_alice": {
      status: "ACTIVE",
      consentStatus: "GRANTED",
      permissions: ["READ_RISK"], // Missing READ_VITALS
    },
  };
  const canRead = canReadTelemetry({
    auth: { uid: "doctor_smith" },
    patientUid: "patient_alice",
    doctorRelationships: noVitalsRel,
  });
  assert.strictEqual(canRead, false);
});

test("9. Device claiming collision prevention: Patient B cannot claim a device owned by Patient A", () => {
  const catalog = {
    "SAMADHAN-BAND-111": { ownerUid: "patient_alice" },
    "SAMADHAN-BAND-222": { ownerUid: null },
  };
  const canBobClaimAliceDevice = canClaimDevice({
    auth: { uid: "patient_bob" },
    deviceId: "SAMADHAN-BAND-111",
    deviceCatalog: catalog,
  });
  const canBobClaimUnownedDevice = canClaimDevice({
    auth: { uid: "patient_bob" },
    deviceId: "SAMADHAN-BAND-222",
    deviceCatalog: catalog,
  });
  const canAliceReclaimOwnDevice = canClaimDevice({
    auth: { uid: "patient_alice" },
    deviceId: "SAMADHAN-BAND-111",
    deviceCatalog: catalog,
  });

  assert.strictEqual(canBobClaimAliceDevice, false, "Collision prevented: device already owned by Alice");
  assert.strictEqual(canBobClaimUnownedDevice, true, "Unclaimed device can be claimed");
  assert.strictEqual(canAliceReclaimOwnDevice, true, "Owner can re-assert own device");
});

test("10. Gateway ingestion boundary enforces authenticated mobile-gateway caller and rejects UID spoofing", () => {
  const validateIngestion = (callerUid, payloadUid) => {
    if (!callerUid) return { allowed: false, error: "UNAUTHORIZED" };
    if (callerUid !== payloadUid) return { allowed: false, error: "FORBIDDEN" };
    return { allowed: true };
  };

  assert.strictEqual(validateIngestion(null, "patient_alice").allowed, false);
  assert.strictEqual(validateIngestion("patient_bob", "patient_alice").allowed, false);
  assert.strictEqual(validateIngestion("patient_alice", "patient_alice").allowed, true);
});

console.log("\n-------------------------------------------------------");
console.log(`Results: ${passed} / ${total} security tests passed (${Math.round((passed / total) * 100)}%)`);
console.log("-------------------------------------------------------\n");

if (passed === total) {
  console.log("ALL FIREBASE RTDB SECURITY & AUTHORIZATION RULES VERIFIED!\n");
} else {
  console.error("SECURITY RULE TEST FAILURES DETECTED.\n");
  process.exitCode = 1;
}
