export const ROLES = [
  'ROLE_ADMIN',
  'ROLE_USER'
] as const;

export type Rol = typeof ROLES[number];

export const ROL_LABELS: Record<Rol, string> = {
  ROLE_ADMIN: 'Gerente',
  ROLE_USER: 'Recepcionista'
};

export const ROLES_CATALOGO: { id: Rol; label: string }[] = [
  { id: ROLES[0], label: ROL_LABELS[ROLES[0]] },
  { id: ROLES[1], label: ROL_LABELS[ROLES[1]] }
];

export interface UsuarioRequest {
  username: string;
  password?: string;
  roles: Rol[];
}

export interface UsuarioResponse {
  username: string;
  roles: Rol[];
}
