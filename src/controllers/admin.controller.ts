import type { Context } from 'hono';
import { ApiResponse } from '@/utils/ApiResponse';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { cookieStrings } from '@/constants';
import { cookieOptions } from '@/index';
import { checkAdminService, refreshAdminTokenService, signInAdminService } from '@/services/admin';

export const signInAdmin = async (c: Context) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const { accessToken, refreshToken } = await signInAdminService(email, password);

  setCookie(c, cookieStrings.adminLoginAccessToken, accessToken, {
    ...cookieOptions,
    maxAge: 604800, // 7 days
  });

  setCookie(c, cookieStrings.adminLoginRefreshToken, refreshToken, {
    ...cookieOptions,
    maxAge: 604800, // 7 days
  });

  return c.json(new ApiResponse(200, { accessToken, refreshToken }, 'Sign in successful.'));
};

export const logoutAdmin = async (c: Context) => {
  deleteCookie(c, cookieStrings.adminLoginAccessToken);
  deleteCookie(c, cookieStrings.adminLoginRefreshToken);
  return c.json(new ApiResponse(200, null, 'Logout successful.'));
};

/**
 * Refresh token endpoint:
 * Reads the refresh token from cookies, verifies it,
 * and if valid, issues new tokens which are then set as cookies.
 */
export const refreshAdminToken = async (c: Context) => {
  const refreshToken = getCookie(c, cookieStrings.adminLoginRefreshToken);
  if (!refreshToken) {
    throw new Error('No refresh token provided.');
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshAdminTokenService(refreshToken);

  setCookie(c, cookieStrings.adminLoginAccessToken, accessToken, {
    ...cookieOptions,
    maxAge: 604800,
  });

  setCookie(c, cookieStrings.adminLoginRefreshToken, newRefreshToken, {
    ...cookieOptions,
    maxAge: 604800,
  });

  return c.json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Tokens refreshed successfully.'));
};

/**
 * GET /admin/check
 * Checks whether the admin is authenticated.
 */
export const checkAdminAuth = async (c: Context) => {
  // The adminAuthMiddleware should have set 'adminId' in the context.
  const adminId = c.get('adminId');
  // Optionally, you can call a service to re-verify admin existence.
  await checkAdminService(adminId);
  return c.json(new ApiResponse(200, { adminId }, 'Authenticated'));
};
