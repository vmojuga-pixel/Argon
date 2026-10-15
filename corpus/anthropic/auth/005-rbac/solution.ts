export type Role = "owner" | "admin" | "member" | "viewer";
export type Action =
  | "org:delete" | "org:billing"
  | "member:invite" | "member:remove" | "member:set_role"
  | "project:create" | "project:read" | "project:update" | "project:delete";

export interface Member { userId: string; orgId: string; role: Role; }
export interface Decision { allowed: boolean; reason: string; }

const RANK: Record<Role, number> = { owner: 4, admin: 3, member: 2, viewer: 1 };
const MIN_ROLE: Record<Action, Role> = {
  "org:delete": "owner", "org:billing": "owner",
  "member:invite": "admin", "member:remove": "admin", "member:set_role": "admin",
  "project:create": "member", "project:read": "viewer",
  "project:update": "member", "project:delete": "admin",
};
const isRole = (r: unknown): r is Role => typeof r === "string" && Object.prototype.hasOwnProperty.call(RANK, r);

export function can(actor: Member | null | undefined, action: Action, orgId: string): boolean {
  if (!actor || actor.orgId !== orgId) return false;
  if (!isRole(actor.role)) return false;
  if (!Object.prototype.hasOwnProperty.call(MIN_ROLE, action)) return false;
  return RANK[actor.role] >= RANK[MIN_ROLE[action]];
}

export function canChangeRole(actor: Member | null | undefined, target: Member, newRole: Role, ownerCount: number): Decision {
  const deny = (reason: string): Decision => ({ allowed: false, reason });
  if (!actor) return deny("unauthenticated");
  if (actor.orgId !== target.orgId) return deny("cross_org");
  if (!can(actor, "member:set_role", target.orgId)) return deny("insufficient_role");
  if (!isRole(newRole) || !isRole(target.role)) return deny("invalid_role");
  if (target.role === "owner" && newRole !== "owner" && ownerCount <= 1) return deny("last_owner");
  if (actor.role === "owner") return { allowed: true, reason: "ok" };
  if (RANK[target.role] >= RANK[actor.role]) return deny("target_too_senior");
  if (RANK[newRole] >= RANK[actor.role]) return deny("cannot_grant_equal_or_higher");
  return { allowed: true, reason: "ok" };
}
