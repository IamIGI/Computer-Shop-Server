export interface Roles {
    User?: number;
    Admin?: number;
    Editor?: number;
}

const ROLES_LIST: Roles = {
    Admin: 5150,
    Editor: 1984,
    User: 2001,
};

export default ROLES_LIST;
