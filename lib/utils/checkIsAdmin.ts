/**
 * Core utility to check if user is admin based on organization data.
 * Single source of truth for admin check logic.
 *
 * @param organization - The organization object from Clerk
 * @returns true if user is admin, false otherwise
 */
export function checkIsAdmin(
  organization: { publicMetadata?: Record<string, unknown> | null } | undefined | null
): boolean {
  if (!organization) {
    console.log('[checkIsAdmin] No organization provided');
    return false;
  }

  // console.log('[checkIsAdmin] Organization:', organization);
  // console.log('[checkIsAdmin] publicMetadata:', organization.publicMetadata);
  // console.log('[checkIsAdmin] admin value:', organization.publicMetadata?.admin);

  return (organization?.publicMetadata?.admin as boolean) === true
}
