import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { tieneRolPermitido } from '../../navegacion/config/perimisos';

interface RoleRouteProps {
  roles: string[];
}

/** Bloquea rutas protegidas a las que el rol actual no tiene acceso. */
export default function RoleRoute({ roles }: RoleRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (tieneRolPermitido(user?.rol, roles)) {
    return <Outlet />;
  }

  return <Navigate to="/" replace state={{ deniedPath: location.pathname }} />;
}
