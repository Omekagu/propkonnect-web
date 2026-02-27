/**
 * /admin page — intentionally empty.
 *
 * All rendering is handled by layout.js which manages role-based SPA routing
 * via the `activePage` state and the Sidebar's onRouteChange callback.
 * The layout renders the correct dashboard component (AdminDashboard,
 * PropertyOwnerDashboard, ArtisanDashboard, TenantDashboard) based on
 * the authenticated user's role — no content belongs here.
 */
export default function AdminPage () {
  return null
}
