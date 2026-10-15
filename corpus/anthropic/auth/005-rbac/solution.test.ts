import { test } from "node:test";
import assert from "node:assert/strict";
import { can, canChangeRole, type Member, type Role } from "./solution.ts";

const m = (role: Role, userId = role, orgId = "org1"): Member => ({ userId, orgId, role });
const owner = m("owner"), admin = m("admin"), member = m("member"), viewer = m("viewer");

test("permission matrix by role", () => {
  const matrix: Record<string, [boolean, boolean, boolean, boolean]> = {
    "org:delete": [true, false, false, false],
    "org:billing": [true, false, false, false],
    "member:invite": [true, true, false, false],
    "member:remove": [true, true, false, false],
    "member:set_role": [true, true, false, false],
    "project:create": [true, true, true, false],
    "project:read": [true, true, true, true],
    "project:update": [true, true, true, false],
    "project:delete": [true, true, false, false],
  };
  for (const [action, expected] of Object.entries(matrix)) {
    [owner, admin, member, viewer].forEach((actor, i) => {
      assert.equal(can(actor, action as never, "org1"), expected[i], `${actor.role} ${action}`);
    });
  }
});
test("deny by default: no actor, other org, unknown role/action", () => {
  assert.equal(can(null, "project:read", "org1"), false);
  assert.equal(can(undefined, "project:read", "org1"), false);
  assert.equal(can(m("owner", "u", "org2"), "project:read", "org1"), false);
  assert.equal(can({ userId: "u", orgId: "org1", role: "superadmin" as never }, "project:read", "org1"), false);
  assert.equal(can(owner, "org:nuke" as never, "org1"), false);
  assert.equal(can({ userId: "u", orgId: "org1", role: "constructor" as never }, "project:read", "org1"), false);
  assert.equal(can(owner, "toString" as never, "org1"), false);
});
test("owner can change anyone to any role", () => {
  assert.equal(canChangeRole(owner, m("admin", "a2"), "owner", 1).allowed, true);
  assert.equal(canChangeRole(owner, m("member", "m2"), "admin", 1).allowed, true);
  assert.equal(canChangeRole(owner, m("viewer", "v2"), "member", 1).allowed, true);
});
test("admin can manage only members/viewers and grant only member/viewer", () => {
  assert.equal(canChangeRole(admin, m("member", "m2"), "viewer", 1).allowed, true);
  assert.equal(canChangeRole(admin, m("viewer", "v2"), "member", 1).allowed, true);
  assert.equal(canChangeRole(admin, m("member", "m2"), "admin", 1).reason, "cannot_grant_equal_or_higher");
  assert.equal(canChangeRole(admin, m("member", "m2"), "owner", 1).reason, "cannot_grant_equal_or_higher");
  assert.equal(canChangeRole(admin, m("admin", "a2"), "member", 1).reason, "target_too_senior");
  assert.equal(canChangeRole(admin, m("owner", "o2"), "member", 2).reason, "target_too_senior");
});
test("privilege escalation: admin cannot promote self", () => {
  assert.equal(canChangeRole(admin, admin, "owner", 1).allowed, false);
});
test("member and viewer can never change roles", () => {
  assert.equal(canChangeRole(member, m("viewer", "v2"), "viewer", 1).reason, "insufficient_role");
  assert.equal(canChangeRole(viewer, m("viewer", "v2"), "member", 1).reason, "insufficient_role");
});
test("last owner cannot be demoted, but can be when another owner exists", () => {
  assert.equal(canChangeRole(owner, owner, "admin", 1).reason, "last_owner");
  assert.equal(canChangeRole(owner, owner, "admin", 2).allowed, true);
  assert.equal(canChangeRole(owner, owner, "owner", 1).allowed, true);
});
test("cross-org changes denied even for owners", () => {
  const foreign = m("member", "x", "org2");
  assert.equal(canChangeRole(owner, foreign, "viewer", 1).reason, "cross_org");
});
test("unauthenticated and invalid roles denied", () => {
  assert.equal(canChangeRole(null, member, "viewer", 1).reason, "unauthenticated");
  assert.equal(canChangeRole(owner, member, "root" as never, 1).reason, "invalid_role");
});
