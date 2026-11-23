/** True when a Google API failure looks like an API-key, billing, or access issue. */
export function isApiKeyError(error) {
  const message = String(error?.message ?? error ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return [
    'apikey',
    'permissiondenied',
    'requestdenied',
    'referer',
    'billing',
    'notauthorized',
    'notactivated',
    'apinotactivated',
    'notenabled',
    'servicedisabled',
    'invalidkey',
    'expiredkey',
    'missingkey',
    'apitargetblocked',
    'apiprojectmaperror',
  ].some((fragment) => message.includes(fragment));
}
