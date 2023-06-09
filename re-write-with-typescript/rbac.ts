type ActionEnum =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "*"
  | "!"


type RoleEnum =
  | "admin"
  | "guest"
  | "user"
  | "employee"
  | "manager"


type User = {
  name: string,
  role: RoleEnum
}


class Permission {
  resource: string;
  action: ActionEnum;

  constructor(resource: string, action: ActionEnum) {
    this.resource = resource;
    this.action = action;
  }

  get name() {
    return `${this.resource}:${this.action}`
  }
}


type Role = {
  name: RoleEnum,
  permissions: Permission[]
}


function log_perms(rules: Map<RoleEnum, Role>, role: RoleEnum) {
  const current_rule = rules.get(role);

  if (!current_rule) throw new Error("Not Found Role name");

  for (const perm of current_rule?.permissions) {
    console.log(`[ ${current_rule.name} ]`, perm.name);
  }
}


class AccessRule {
  access_rules: Map<RoleEnum, Role> = new Map([
    ["admin", {
      name: "admin", 
      permissions: [
        new Permission("*", "*")
      ]
    }],

    ["guest", { 
      name: "guest", 
      permissions: [
        new Permission("post", "read"),
        new Permission("dashboard", "read"),
      ]
    }]
  ]);

  authorize<U extends { role: RoleEnum }>(user: U, perm: string) {
    let access: boolean = false;
    const [resource] = perm.split(":");
    const current_rule = this.access_rules.get(user.role);

    if (!current_rule) throw new Error("not found role name");

    log_perms(this.access_rules, user.role);

    for (const permission of current_rule.permissions) {
      if ((perm === permission.name) || ((permission.resource === resource || permission.resource === "*") && permission.action === "*")) {
        access = true
      }
      if (resource == permission.resource && permission.action === "!") {
        access = false
      }
    }

    return access;
  }
}


function main() {
  const admin: User = {
    name: "bob",
    role: "admin"
  }

  const anonymous: User = {
    name: "some",
    role: "guest"
  }

  const rbac = new AccessRule();

  const admin_dashboard_edit_perm = rbac.authorize(admin, "dashboard:edit");

  const guest_post_read_perm = rbac.authorize(anonymous, "post:read");
  const guest_dashboard_edit_perm = rbac.authorize(anonymous, "dashboard:edit");

  console.log("\n");

  console.log({ admin_dashboard_edit_perm });
  console.log({ guest_post_read_perm });
  console.log({ guest_dashboard_edit_perm });
}


// // Middleware
// /* validate function */

// const authorize = (perm: string) => (req: Request, res: Response, next: NextFunction) => {
//   const rbac = new AccessRule();
//   
//   /* get token and deserialize user */
//   const user: User = { name: "bob", role: "admin" }; /* deserialized user */

//   if (rbac.authorize(user, perm)) {
//     next();
//   }
// }

// // Router
// router.post("/post", validate(), createPost);

// // Controller
// const createPost = async (
//   req: Request, 
//   res: Response, 
//   next: NextFunction) => {
//   /* Controller */
// };

main()
